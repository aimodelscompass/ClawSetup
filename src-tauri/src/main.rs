use tauri::{command, Manager, Window};
use std::process::Command;
use std::fs;
use std::thread;
use std::time::Duration;
use std::io::{BufRead, BufReader};
use serde::{Deserialize, Serialize};
use rand::Rng;

#[derive(Deserialize, Serialize, Clone)]
struct AgentConfig {
    provider: String,
    api_key: String,
    model: String,
    user_name: String,
    agent_name: String,
    agent_vibe: String,
    telegram_token: Option<String>,
}

#[derive(Serialize)]
struct PrereqCheck {
    node_installed: bool,
    openclaw_installed: bool,
}

#[derive(Serialize, Deserialize)]
struct WorkspaceFile {
    name: String,
    content: String,
}

#[command]
fn check_prerequisites() -> PrereqCheck {
    let node = shell_command("node -v").is_ok();
    let openclaw = shell_command("openclaw --version").is_ok();
    PrereqCheck {
        node_installed: node,
        openclaw_installed: openclaw,
    }
}

#[command]
fn install_openclaw() -> Result<String, String> {
    // Attempt installation
    shell_command("npm install -g openclaw")?;
    
    // Verify installation and get version
    let version = shell_command("openclaw --version")?;
    Ok(format!("OpenClaw installed successfully: {}", version.trim()))
}

#[command]
fn configure_agent(config: AgentConfig) -> Result<String, String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let openclaw_root = home.join(".openclaw");
    let workspace = openclaw_root.join("workspace");
    let agents_dir = openclaw_root.join("agents").join("main").join("agent");

    fs::create_dir_all(&workspace).map_err(|e| e.to_string())?;
    fs::create_dir_all(&agents_dir).map_err(|e| e.to_string())?;

    let config_path = openclaw_root.join("openclaw.json");
    let profile_name = format!("{}:default", config.provider);

    // Load existing config or create a new one
    let mut config_json: serde_json::Value = if config_path.exists() {
        let content = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).unwrap_or_else(|_| serde_json::json!({}))
    } else {
        serde_json::json!({})
    };

    // CRITICAL: Read existing gateway token BEFORE any modifications
    // Priority:
    // 1. Environment variable (OPENCLAW_GATEWAY_TOKEN) - highest precedence
    // 2. Existing config (openclaw.json) - preserve if set
    // 3. Generate new (only if neither 1 nor 2 exists)
    let env_gateway_token = std::env::var("OPENCLAW_GATEWAY_TOKEN").ok();
    
    let existing_gateway_token: Option<String> = env_gateway_token.or_else(|| {
        config_json
            .get("gateway")
            .and_then(|g| g.get("auth"))
            .and_then(|a| a.get("token"))
            .and_then(|t| t.as_str())
            .map(|s| s.to_string())
    });

    // Helper to ensure nested objects exist
    fn ensure_object<'a>(val: &'a mut serde_json::Value, key: &str) -> &'a mut serde_json::Value {
        if !val.get(key).map_or(false, |v| v.is_object()) {
            val[key] = serde_json::json!({});
        }
        val.get_mut(key).unwrap()
    }

    // Update meta (only if missing)
    if config_json.get("meta").is_none() {
        config_json["meta"] = serde_json::json!({
            "lastTouchedVersion": "2026.2.6-3",
            "lastTouchedAt": ""
        });
    }

    // Update messages (only if missing)
    if config_json.get("messages").is_none() {
        config_json["messages"] = serde_json::json!({ "ackReactionScope": "group-mentions" });
    }

    // Update agents.defaults - merge model settings
    {
        let agents = ensure_object(&mut config_json, "agents");
        let defaults = ensure_object(agents, "defaults");
        
        // Set these values (update if they change)
        if defaults.get("maxConcurrent").is_none() {
            defaults["maxConcurrent"] = serde_json::json!(4);
        }
        if defaults.get("subagents").is_none() {
            defaults["subagents"] = serde_json::json!({ "maxConcurrent": 8 });
        }
        if defaults.get("compaction").is_none() {
            defaults["compaction"] = serde_json::json!({ "mode": "safeguard" });
        }
        defaults["workspace"] = serde_json::json!(workspace.to_string_lossy());
        defaults["model"] = serde_json::json!({ "primary": &config.model });
        
        // Merge into models object (don't replace entire object)
        let models = ensure_object(defaults, "models");
        models[&config.model] = serde_json::json!({});
    }

    // Update gateway - generate token ONLY if none exists
    {
        let gateway = ensure_object(&mut config_json, "gateway");
        
        // Set defaults if missing
        if gateway.get("mode").is_none() {
            gateway["mode"] = serde_json::json!("local");
        }
        if gateway.get("port").is_none() {
            gateway["port"] = serde_json::json!(18789);
        }
        if gateway.get("bind").is_none() {
            gateway["bind"] = serde_json::json!("loopback");
        }
        if gateway.get("tailscale").is_none() {
            gateway["tailscale"] = serde_json::json!({ "mode": "off", "resetOnExit": false });
        }
        
        // Set auth mode and token - USE THE PRESERVED TOKEN FROM BEFORE MODIFICATIONS
        let auth = ensure_object(gateway, "auth");
        auth["mode"] = serde_json::json!("token");
        
        // Use existing token if we found one, otherwise generate a new one
        let gateway_token = existing_gateway_token.unwrap_or_else(|| {
            rand::thread_rng()
                .sample_iter(&rand::distributions::Alphanumeric)
                .take(32)
                .map(char::from)
                .collect()
        });
        auth["token"] = serde_json::json!(gateway_token);
    }

    // Update auth.profiles - merge new profile
    {
        let auth = ensure_object(&mut config_json, "auth");
        let profiles = ensure_object(auth, "profiles");
        profiles[&profile_name] = serde_json::json!({ "provider": &config.provider, "mode": "token" });
    }

    // Handle Telegram config section - logic from main branch
    if let Some(token) = &config.telegram_token {
        if !token.is_empty() {
             // Create plugins entries if missing
             let plugins = ensure_object(&mut config_json, "plugins");
             let entries = ensure_object(plugins, "entries");
             entries["telegram"] = serde_json::json!({
                 "enabled": true
             });
 
             // Create channels config
             let channels = ensure_object(&mut config_json, "channels");
             let telegram = ensure_object(channels, "telegram");
             let accounts = ensure_object(telegram, "accounts");
             accounts["main"] = serde_json::json!({
                 "botToken": token,
                 "name": "Primary Bot",
                 "dmPolicy": "pairing"
             });
        }
    }

    // Write merged config
    fs::write(&config_path, serde_json::to_string_pretty(&config_json).unwrap()).map_err(|e| e.to_string())?;

    // Write/update auth-profiles.json for the main agent (merge with existing)
    let auth_profiles_path = agents_dir.join("auth-profiles.json");
    let mut auth_profiles: serde_json::Value = if auth_profiles_path.exists() {
        let content = fs::read_to_string(&auth_profiles_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).unwrap_or_else(|_| serde_json::json!({}))
    } else {
        serde_json::json!({ "version": 1 })
    };

    {
        let profiles = ensure_object(&mut auth_profiles, "profiles");
        profiles[&profile_name] = serde_json::json!({
            "type": "token",
            "provider": &config.provider,
            "token": &config.api_key
        });
        
        let last_good = ensure_object(&mut auth_profiles, "lastGood");
        last_good[&config.provider] = serde_json::json!(&profile_name);
    }

    fs::write(&auth_profiles_path, serde_json::to_string_pretty(&auth_profiles).unwrap()).map_err(|e| e.to_string())?;

    // Create Identity files only if they don't exist
    let identity_path = workspace.join("IDENTITY.md");
    if !identity_path.exists() {
        fs::write(&identity_path, format!("# IDENTITY.md\n\nI am {}, an AI agent powered by OpenClaw.\n\nVibe: {}", config.agent_name, config.agent_vibe)).ok();
    }
    let user_path = workspace.join("USER.md");
    if !user_path.exists() {
        fs::write(&user_path, format!("# USER.md\n\nAbout my human: {}\n", config.user_name)).ok();
    }
    let soul_path = workspace.join("SOUL.md");
    if !soul_path.exists() {
        fs::write(&soul_path, "# SOUL.md\n\n## Mission\nProvide excellent assistance and maintain a helpful attitude.\n").ok();
    }

    Ok("Configuration completed.".into())
}

#[command]
fn start_gateway_service() -> Result<String, String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let openclaw_root = home.join(".openclaw");
    let config_path = openclaw_root.join("openclaw.json");

    // Stop any existing instance first
    let _ = shell_command("openclaw gateway stop");
    thread::sleep(Duration::from_secs(2));

    // Backup our config if it exists (we'll merge it back after gateway install)
    let our_config = if config_path.exists() {
        Some(fs::read_to_string(&config_path).map_err(|e| e.to_string())?)
    } else {
        None
    };

    // Install gateway service
    // We use --force to ensure a clean install of the service
    let install_output = shell_command("openclaw gateway install --force")?;

    // Check for any error messages in install output
    if install_output.to_lowercase().contains("error") || install_output.to_lowercase().contains("failed") {
        return Err(format!("Gateway installation may have failed: {}", install_output));
    }

    // If we had a config before, merge it back
    if let Some(old_config) = our_config {
        // Read the newly generated config (which might have a new token if we didn't preserve it, 
        // but our configure_agent logic tries to reuse existing tokens properly)
        let new_config = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;

        // Parse both configs
        let mut new_json: serde_json::Value = serde_json::from_str(&new_config)
            .map_err(|e| format!("Failed to parse new config: {}", e))?;
        let old_json: serde_json::Value = serde_json::from_str(&old_config)
            .map_err(|e| format!("Failed to parse old config: {}", e))?;

        // Merge key sections from old config (preserve what we configured)
        if let Some(agents) = old_json.get("agents") {
            new_json["agents"] = agents.clone();
        }
        if let Some(auth) = old_json.get("auth") {
            new_json["auth"] = auth.clone();
        }
        if let Some(messages) = old_json.get("messages") {
            new_json["messages"] = messages.clone();
        }
        if let Some(plugins) = old_json.get("plugins") {
            new_json["plugins"] = plugins.clone();
        }
        if let Some(channels) = old_json.get("channels") {
            new_json["channels"] = channels.clone();
        }
        // IMPORTANT: We might want to keep the gateway auth token from the new config if the old one was invalid/missing,
        // but typically we want to preserve our configured token. 
        // Logic in configure_agent prioritizes existing token, so old_json should have the one we want.
        if let Some(gateway) = old_json.get("gateway") {
             if let Some(auth) = gateway.get("auth") {
                 // Ensure gateway object exists in new_json
                 if new_json.get("gateway").is_none() {
                     new_json["gateway"] = serde_json::json!({});
                 }
                 new_json["gateway"]["auth"] = auth.clone();
             }
        }

        // Write merged config back
        let merged = serde_json::to_string_pretty(&new_json)
            .map_err(|e| format!("Failed to serialize merged config: {}", e))?;
        fs::write(&config_path, merged).map_err(|e| e.to_string())?;
    }

    // Start the gateway
    let start_output = shell_command("openclaw gateway start")?;

    // Check for errors in start output
    if start_output.to_lowercase().contains("error") || start_output.to_lowercase().contains("failed") {
        return Err(format!("Gateway start may have failed: {}", start_output));
    }

    // Give it time to initialize
    thread::sleep(Duration::from_secs(5));

    // Try to verify it's actually accessible via network with multiple attempts
    use std::net::TcpStream;
    let mut last_error = String::new();
    for attempt in 1..=8 {
        // Try to connect to the gateway port (18789)
        if TcpStream::connect("127.0.0.1:18789").is_ok() {
            return Ok("Gateway started successfully and is accessible on port 18789.".to_string());
        }

        if let Ok(status) = shell_command("openclaw gateway status") {
             last_error = format!("Status: {} | Port 18789: not accessible", status.trim());
        } else {
             last_error = format!("Gateway status check failed (attempt {}/8)", attempt);
        }

        if attempt < 8 {
            thread::sleep(Duration::from_secs(3));
        }
    }

    // Get final status for error message
    let final_status = shell_command("openclaw gateway status")
        .unwrap_or_else(|_| "Unable to get status".to_string());

    Err(format!(
        "Gateway did not become accessible on port 18789 after 24+ seconds.\n\
        Last status: {}\n\
        Final gateway status:\n{}\n",
        last_error,
        final_status
    ))
}

#[command]
fn generate_pairing_code() -> Result<String, String> {
    // Give gateway a bit more time if needed
    thread::sleep(Duration::from_secs(2));

    // Try to verify gateway is accessible (but don't fail if we can't verify)
    let _ = shell_command("openclaw gateway status");

    // OpenClaw doesn't have a "pairing create" command.
    // The flow is: user sends a message to the bot, then checks pending requests.
    // Return instructions for the user.
    Ok("Ready! Send any message to your Telegram bot to start pairing. The bot will respond automatically with a code.".to_string())
}

#[command]
fn approve_pairing(code: String) -> Result<String, String> {
    // Run: openclaw pairing approve <code> --channel telegram
    let output = shell_command(&format!("openclaw pairing approve {} --channel telegram", code));
    
    match output {
        Ok(out) => {
            let out_lower = out.to_lowercase();
            if out_lower.contains("error") {
                if out_lower.contains("no pending pairing request found") {
                    return Err("Invalid pairing code. Please make sure you sent a message to the bot and try again.".to_string());
                }
                return Err(out);
            }
            Ok("Pairing successful!".to_string())
        },
        Err(err) => {
            let err_lower = err.to_lowercase();
            if err_lower.contains("no pending pairing request found") {
                return Err("Invalid pairing code. Please make sure you sent a message to the bot and try again.".to_string());
            }
            Err(err)
        }
    }
}

#[command]
fn get_openclaw_config() -> Result<serde_json::Value, String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let config_path = home.join(".openclaw").join("openclaw.json");
    if !config_path.exists() {
        return Ok(serde_json::json!({}));
    }
    let content = fs::read_to_string(config_path).map_err(|e| e.to_string())?;
    let json: serde_json::Value = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    Ok(json)
}

#[command]
fn get_dashboard_url() -> Result<String, String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let config_path = home.join(".openclaw").join("openclaw.json");
    
    // Default URL if config read fails or token missing
    let default_url = "http://127.0.0.1:18789".to_string();

    if !config_path.exists() {
        return Ok(default_url);
    }

    let content = fs::read_to_string(config_path).map_err(|e| e.to_string())?;
    let json: serde_json::Value = serde_json::from_str(&content).unwrap_or_else(|_| serde_json::json!({}));

    // Extract token
    let token = json.get("gateway")
        .and_then(|g| g.get("auth"))
        .and_then(|a| a.get("token"))
        .and_then(|t| t.as_str())
        .map(|s| s.to_string());

    if let Some(t) = token {
        Ok(format!("http://127.0.0.1:18789/dashboard?token={}", t))
    } else {
        Ok(default_url)
    }
}

#[command]
fn save_openclaw_config(config: serde_json::Value) -> Result<(), String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let config_path = home.join(".openclaw").join("openclaw.json");
    let content = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(config_path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
fn get_workspace_files() -> Result<Vec<WorkspaceFile>, String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let workspace = home.join(".openclaw").join("workspace");
    if !workspace.exists() {
        return Ok(vec![]);
    }
    let mut files = vec![];
    if let Ok(entries) = fs::read_dir(workspace) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() && path.extension().map_or(false, |ext| ext == "md") {
                let name = path.file_name().unwrap().to_string_lossy().into_owned();
                let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
                files.push(WorkspaceFile { name, content });
            }
        }
    }
    Ok(files)
}

#[command]
fn save_workspace_file(name: String, content: String) -> Result<(), String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let workspace = home.join(".openclaw").join("workspace");
    fs::create_dir_all(&workspace).map_err(|e| e.to_string())?;
    let path = workspace.join(name);
    fs::write(path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
fn get_gateway_status() -> Result<String, String> {
    shell_command("openclaw gateway status")
}

#[command]
fn control_gateway(action: String) -> Result<String, String> {
    let cmd = format!("openclaw gateway {}", action);
    shell_command(&cmd)
}

#[command]
fn stream_logs(window: Window) -> Result<(), String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let log_path = home.join(".openclaw").join("logs").join("gateway.log");
    
    if !log_path.exists() {
        fs::create_dir_all(log_path.parent().unwrap()).ok();
        fs::write(&log_path, "").ok();
    }

    thread::spawn(move || {
        if let Ok(file) = fs::File::open(&log_path) {
            let mut reader = BufReader::new(file);
            use std::io::Seek;
            let _ = reader.seek(std::io::SeekFrom::End(0));

            loop {
                let mut line = String::new();
                match reader.read_line(&mut line) {
                    Ok(0) => thread::sleep(Duration::from_millis(500)),
                    Ok(_) => { let _ = window.emit("log-event", line); },
                    Err(_) => break,
                }
            }
        }
    });

    Ok(())
}

#[command]
fn run_openclaw_command(command: String) -> Result<String, String> {
    shell_command(&command)
}

fn shell_command(cmd: &str) -> Result<String, String> {
    // Enhanced PATH and sourcing for macOS
    let full_cmd = format!(
        "export PATH=\"$PATH:/usr/local/bin:/opt/homebrew/bin:$HOME/.nvm/versions/node/$(nvm current 2>/dev/null || echo 'v22.18.0')/bin\"; \
         {{ [ -f /etc/profile ] && . /etc/profile; \
           [ -f ~/.zprofile ] && . ~/.zprofile; \
           [ -f ~/.zshrc ] && . ~/.zshrc; \
           [ -s \"$HOME/.nvm/nvm.sh\" ] && . \"$HOME/.nvm/nvm.sh\"; }} > /dev/null 2>&1; \
         {}", 
        cmd
    );

    let output = Command::new("/bin/zsh")
        .arg("-c")
        .arg(full_cmd)
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if output.status.success() {
        Ok(stdout)
    } else {
        let cleaned_stderr = stderr.lines()
            .filter(|line| !line.contains(".zshrc") && !line.contains(".zprofile") && !line.contains("no such file or directory") && !line.contains("nvm"))
            .collect::<Vec<_>>()
            .join("\n");

        let err_to_return = if !cleaned_stderr.trim().is_empty() {
            cleaned_stderr
        } else if !stderr.is_empty() {
            stderr
        } else if !stdout.is_empty() {
            stdout
        } else {
            format!("Command failed with exit code: {}", output.status.code().unwrap_or(-1))
        };
        Err(err_to_return)
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            check_prerequisites,
            install_openclaw,
            configure_agent,
            start_gateway_service,
            generate_pairing_code,
            approve_pairing,
            get_openclaw_config,
            save_openclaw_config,
            get_dashboard_url,
            get_workspace_files,
            save_workspace_file,
            get_gateway_status,
            control_gateway,
            stream_logs,
            run_openclaw_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
