use tauri::command;
use std::process::Command;
use std::fs;
use std::thread;
use std::time::Duration;
use std::net::TcpStream;
use rand::Rng;

#[derive(serde::Deserialize)]
struct AgentConfig {
    provider: String,
    api_key: String,
    auth_method: Option<String>,
    model: String,
    user_name: String,
    agent_name: String,
    agent_vibe: String,
    telegram_token: Option<String>,
    // Advanced fields
    gateway_port: Option<u16>,
    gateway_bind: Option<String>,
    gateway_auth_mode: Option<String>,
    tailscale_mode: Option<String>,
    node_manager: Option<String>,
    skills: Option<Vec<String>>,
    service_keys: Option<std::collections::HashMap<String, String>>,
}

#[derive(serde::Serialize)]
struct PrereqCheck {
    node_installed: bool,
    docker_running: bool,
    openclaw_installed: bool,
}

#[command]
fn start_provider_auth(provider: String, method: String) -> Result<String, String> {
    // Run openclaw models auth login --provider <provider> --method <method>
    // Note: For OAuth flows, this usually opens a browser.
    // We might not get the token back directly in stdout if it's purely interactive,
    // but we can try to read it from auth-profiles.json after.
    
    let cmd = format!("openclaw models auth login --provider {} --method {}", provider, method);
    shell_command(&cmd)?;
    
    // Try to extract the token from auth-profiles.json
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let profile_name = format!("{}:default", provider);
    let auth_path = home.join(".openclaw").join("agents").join("main").join("agent").join("auth-profiles.json");
    
    if auth_path.exists() {
        let content = fs::read_to_string(auth_path).map_err(|e| e.to_string())?;
        let json: serde_json::Value = serde_json::from_str(&content).map_err(|e| e.to_string())?;
        if let Some(token) = json.get("profiles").and_then(|p| p.get(&profile_name)).and_then(|p| p.get("token")).and_then(|t| t.as_str()) {
            return Ok(token.to_string());
        }
    }
    
    Ok("Authenticated via browser. Token synced.".to_string())
}

#[command]
fn close_app(window: tauri::Window) {
    let _ = window.close();
}

#[command]
fn install_skill(name: String) -> Result<String, String> {
    // Use npx clawhub install as recommended by openclaw help
    shell_command(&format!("npx clawhub install {}", name))
}

#[command]
fn get_openclaw_version() -> String {
    match shell_command("openclaw --version") {
        Ok(v) => v.trim().to_string(),
        Err(_) => "v2026.2.8".to_string(), // Fallback to last known if not installed yet
    }
}

#[command]
fn check_prerequisites() -> PrereqCheck {
    // Use shell_command to properly source user's PATH
    let node = shell_command("node -v").is_ok();
    // Docker not needed on macOS - OpenClaw runs natively
    let openclaw = shell_command("openclaw --version").is_ok();

    PrereqCheck {
        node_installed: node,
        docker_running: true, // Always true on macOS (not needed)
        openclaw_installed: openclaw,
    }
}

#[command]
fn install_openclaw() -> Result<String, String> {
    // Install via npm using shell_command for proper PATH
    shell_command("npm install -g openclaw")?;

    // Verify installation
    shell_command("openclaw --version")?;

    Ok("OpenClaw installed successfully.".to_string())
}

#[command]
fn configure_agent(config: AgentConfig) -> Result<String, String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let openclaw_root = home.join(".openclaw");
    let workspace = openclaw_root.join("workspace");
    let agents_dir = openclaw_root.join("agents").join("main").join("agent");

    fs::create_dir_all(&workspace).map_err(|e| e.to_string())?;
    fs::create_dir_all(&agents_dir).map_err(|e| e.to_string())?;

    // Generate a random gateway token
    let gateway_token: String = rand::thread_rng()
        .sample_iter(&rand::distributions::Alphanumeric)
        .take(32)
        .map(char::from)
        .collect();

    // Build profile name (e.g., "anthropic:default")
    let profile_name = format!("{}:default", config.provider);
    let auth_mode = config.auth_method.unwrap_or_else(|| "token".to_string());

    // Handle Telegram config section
    let telegram_section = if let Some(ref token) = config.telegram_token {
        if !token.is_empty() {
            format!(r#",
  "plugins": {{
    "entries": {{
      "telegram": {{
        "enabled": true
      }}
    }}
  }},
  "channels": {{
    "telegram": {{
      "accounts": {{
        "main": {{
          "botToken": "{}",
          "name": "Primary Bot",
          "dmPolicy": "pairing"
        }}
      }}
    }}
  }}"#, token)
        } else {
            String::new()
        }
    } else {
        String::new()
    };

    // Write openclaw.json (NOT config.json!)
    let gateway_port = config.gateway_port.unwrap_or(18789);
    let gateway_bind = config.gateway_bind.unwrap_or_else(|| "loopback".to_string());
    let gateway_auth_mode = config.gateway_auth_mode.unwrap_or_else(|| "token".to_string());
    let tailscale_mode = config.tailscale_mode.unwrap_or_else(|| "off".to_string());

    let config_json_raw = format!(r#"{{
  "messages": {{
    "ackReactionScope": "group-mentions"
  }},
  "agents": {{
    "defaults": {{
      "maxConcurrent": 4,
      "subagents": {{
        "maxConcurrent": 8
      }},
      "compaction": {{
        "mode": "safeguard"
      }},
      "workspace": "{}",
      "model": {{
        "primary": "{}"
      }},
      "models": {{
        "{}": {{}}
      }}
    }}
  }},
  "gateway": {{
    "mode": "local",
    "port": {},
    "bind": "{}",
    "auth": {{
      "mode": "{}",
      "token": "{}"
    }},
    "tailscale": {{
      "mode": "{}",
      "resetOnExit": false
    }}
  }},
  "auth": {{
    "profiles": {{
      "{}": {{
        "provider": "{}",
        "mode": "{}"
      }}
    }}
  }}{}
}}"#,
        workspace.to_string_lossy(),
        config.model,
        config.model,
        gateway_port,
        gateway_bind,
        gateway_auth_mode,
        gateway_token,
        tailscale_mode,
        profile_name,
        config.provider,
        auth_mode,
        telegram_section
    );

    fs::write(openclaw_root.join("openclaw.json"), config_json_raw).map_err(|e| e.to_string())?;

    // Set nodeManager via CLI to ensure it's valid and avoid "Unknown config keys" warnings
    if let Some(nm) = config.node_manager {
        let _ = shell_command(&format!("openclaw config set skills.nodeManager {}", nm));
    }

    // Enable telegram plugin if token is provided
    if let Some(ref token) = config.telegram_token {
        if !token.is_empty() {
            let _ = shell_command("openclaw plugins enable telegram");
        }
    }

    // Write auth-profiles.json
    let mut profiles_map = serde_json::Map::new();
    
    // Add primary AI profile
    let mut primary_p = serde_json::Map::new();
    primary_p.insert("type".to_string(), serde_json::Value::String(auth_mode));
    primary_p.insert("provider".to_string(), serde_json::Value::String(config.provider.clone()));
    primary_p.insert("token".to_string(), serde_json::Value::String(config.api_key.clone()));
    profiles_map.insert(profile_name.clone(), serde_json::Value::Object(primary_p));

    // Add Service Keys
    if let Some(service_keys) = &config.service_keys {
        for (sid, key) in service_keys {
            let mut p = serde_json::Map::new();
            p.insert("type".to_string(), serde_json::Value::String("token".to_string()));
            p.insert("provider".to_string(), serde_json::Value::String(sid.clone()));
            p.insert("token".to_string(), serde_json::Value::String(key.clone()));
            profiles_map.insert(format!("{}:default", sid), serde_json::Value::Object(p));
        }
    }

    let auth_profiles_val = serde_json::json!({
      "version": 1,
      "profiles": profiles_map,
      "lastGood": {
        config.provider.clone(): profile_name
      },
      "usageStats": {}
    });

    let auth_profiles_json = serde_json::to_string_pretty(&auth_profiles_val).map_err(|e| e.to_string())?;

    fs::write(agents_dir.join("auth-profiles.json"), auth_profiles_json).map_err(|e| e.to_string())?;

    // Identity files (Identity, User, Soul)...
    let identity_md = format!(r#"# IDENTITY.md - Who Am I?
- **Name:** {}
- **Vibe:** {}
- **Emoji:** 🦞
---
Managed by ClawSetup."#, config.agent_name, config.agent_vibe);
    fs::write(workspace.join("IDENTITY.md"), identity_md).map_err(|e| e.to_string())?;

    let user_md = format!(r#"# USER.md - About Your Human
- **Name:** {}
---"#, config.user_name);
    fs::write(workspace.join("USER.md"), user_md).map_err(|e| e.to_string())?;

    let soul_md = format!(r#"# SOUL.md
## Mission
Serve {}."#, config.user_name);
    fs::write(workspace.join("SOUL.md"), soul_md).map_err(|e| e.to_string())?;

    Ok("Configured.".into())
}

#[command]
fn start_gateway() -> Result<String, String> {
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
    let install_output = shell_command("openclaw gateway install --force")?;

    // Check for any error messages in install output
    if install_output.to_lowercase().contains("error") || install_output.to_lowercase().contains("failed") {
        return Err(format!("Gateway installation may have failed: {}", install_output));
    }

    // If we had a config before, merge it back
    if let Some(old_config) = our_config {
        // Read the newly generated config with auth token
        let new_config = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;

        // Parse both configs
        let mut new_json: serde_json::Value = serde_json::from_str(&new_config)
            .map_err(|e| format!("Failed to parse new config: {}", e))?;
        let old_json: serde_json::Value = serde_json::from_str(&old_config)
            .map_err(|e| format!("Failed to parse old config: {}", e))?;

        // Merge key sections from old config (preserve gateway.auth from new config)
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

        // Write merged config back
        let merged = serde_json::to_string_pretty(&new_json)
            .map_err(|e| format!("Failed to serialize merged config: {}", e))?;
        fs::write(&config_path, merged).map_err(|e| e.to_string())?;
    }

    // Start the gateway (runs natively on macOS, not via Docker)
    let start_output = shell_command("openclaw gateway start")?;

    // Check for errors in start output
    if start_output.to_lowercase().contains("error") || start_output.to_lowercase().contains("failed") {
        return Err(format!("Gateway start may have failed: {}", start_output));
    }

    // Give it time to initialize - native process startup
    thread::sleep(Duration::from_secs(5));

    // Try to verify it's actually accessible via network with multiple attempts
    let mut last_error = String::new();
    for attempt in 1..=8 {
        // Try to connect to the gateway port (18789)
        if TcpStream::connect("127.0.0.1:18789").is_ok() {
            // Port is open, gateway is listening!
            return Ok("Gateway started successfully and is accessible on port 18789.".to_string());
        }

        // Check status output for diagnostic info
        if let Ok(status) = shell_command("openclaw gateway status") {
            let status_lower = status.to_lowercase();
            last_error = format!("Status: {} | Port 18789: not accessible", status.trim());

            // If status indicates it's running but port isn't open yet, keep waiting
            if status_lower.contains("starting") || status_lower.contains("initializing") {
                last_error = format!("Gateway is starting... (attempt {}/8)", attempt);
            }
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
        Final gateway status:\n{}\n\n\
        Troubleshooting:\n\
        1. Check gateway logs: 'openclaw gateway logs'\n\
        2. Check gateway status: 'openclaw gateway status'\n\
        3. Try manual start: 'openclaw gateway stop && openclaw gateway start'\n\
        4. Check if port 18789 is in use: 'lsof -i :18789'",
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
fn get_dashboard_url() -> Result<String, String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let config_path = home.join(".openclaw").join("openclaw.json");

    let config_str = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    let json: serde_json::Value = serde_json::from_str(&config_str).map_err(|e| e.to_string())?;

    let token = json.get("gateway")
        .and_then(|g| g.get("auth"))
        .and_then(|a| a.get("token"))
        .and_then(|t| t.as_str())
        .ok_or("Could not find gateway token in config")?;

    Ok(format!("http://127.0.0.1:18789/?token={}", token))
}

// Helper to run shell commands with proper PATH (fixes macOS Tauri PATH issue)
fn shell_command(cmd: &str) -> Result<String, String> {
    // On macOS, GUI apps don't inherit the shell's PATH.
    // We source common profile files and manually add common paths.
    // We redirect ALL preamble output to /dev/null.
    let full_cmd = format!(
        "export PATH=\"$PATH:/usr/local/bin:/opt/homebrew/bin\"; \
         {{ [ -f /etc/profile ] && . /etc/profile; \
           [ -f ~/.zprofile ] && . ~/.zprofile; \
           [ -f ~/.zshrc ] && . ~/.zshrc; }} > /dev/null 2>&1; \
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
        // Strip common shell preamble errors from stderr if they somehow leaked
        let cleaned_stderr = stderr.lines()
            .filter(|line| !line.contains(".zshrc") && !line.contains(".zprofile") && !line.contains("no such file or directory"))
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
            start_gateway,
            generate_pairing_code,
            get_dashboard_url,
            approve_pairing,
            close_app,
            install_skill,
            start_provider_auth,
            get_openclaw_version
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}