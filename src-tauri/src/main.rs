use tauri::command;
use std::process::Command;
use std::fs;
use std::thread;
use std::time::Duration;
use std::net::TcpStream;

#[derive(serde::Deserialize)]
struct AgentConfig {
    provider: String,
    api_key: String,
    model: String,
    user_name: String,
    agent_name: String,
    agent_vibe: String,
    telegram_token: Option<String>,
}

#[derive(serde::Serialize)]
struct PrereqCheck {
    node_installed: bool,
    docker_running: bool,
    openclaw_installed: bool,
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

fn generate_token() -> Result<String, String> {
    shell_command("node -e 'console.log(crypto.randomUUID())'")
        .map(|s| s.trim().to_string())
}

#[command]
fn configure_agent(config: AgentConfig) -> Result<String, String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let openclaw_root = home.join(".openclaw");
    let workspace = openclaw_root.join("workspace");
    let agents_dir = openclaw_root.join("agents").join("main").join("agent");

    fs::create_dir_all(&workspace).map_err(|e| e.to_string())?;
    fs::create_dir_all(&agents_dir).map_err(|e| e.to_string())?;

    // Generate a secure token for the gateway
    let gateway_token = generate_token()?;

    // Build profile name (e.g., "anthropic:default")
    let profile_name = format!("{}:default", config.provider);

    // Handle Telegram config section
    let telegram_section = if let Some(token) = config.telegram_token {
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
      "enabled": true,
      "botToken": "{}"
    }}
  }}"#, token)
        } else {
            String::new()
        }
    } else {
        String::new()
    };

    // Write openclaw.json (NOT config.json!)
    let config_json = format!(r#"{{
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
    "port": 18789,
    "bind": "loopback",
    "auth": {{
      "token": "{}"
    }},
    "tailscale": {{
      "mode": "off",
      "resetOnExit": false
    }}
  }},
  "auth": {{
    "profiles": {{
      "{}": {{
        "provider": "{}",
        "mode": "token"
      }}
    }}
  }}{}
}}"#,
        workspace.to_string_lossy(),
        config.model,
        config.model,
        gateway_token,
        profile_name,
        config.provider,
        telegram_section
    );

    fs::write(openclaw_root.join("openclaw.json"), config_json).map_err(|e| e.to_string())?;

    // Write auth-profiles.json with the actual API key
    let auth_profiles_json = format!(r#"{{
  "version": 1,
  "profiles": {{
    "{}": {{
      "type": "token",
      "provider": "{}",
      "token": "{}"
    }}
  }},
  "lastGood": {{
    "{}": "{}"
  }},
  "usageStats": {{}}
}}"#, profile_name, config.provider, config.api_key, config.provider, profile_name);

    fs::write(agents_dir.join("auth-profiles.json"), auth_profiles_json).map_err(|e| e.to_string())?;

    // Identity files (Identity, User, Soul)...
    // [Keeping previous logic for brevity, re-writing key parts]
    
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
    let output = shell_command(&format!("openclaw pairing approve {} --channel telegram", code))?;
    
    // Check for success or error in output
    if output.to_lowercase().contains("error") {
        return Err(output);
    }

    Ok("Pairing successful!".to_string())
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
    let output = Command::new("/bin/zsh")
        .arg("-l")
        .arg("-c")
        .arg(cmd)
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
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
            approve_pairing
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
