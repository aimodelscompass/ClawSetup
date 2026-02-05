use tauri::command;
use std::process::Command;
use std::fs;
use std::path::PathBuf;
use std::thread;
use std::time::Duration;
use rand::Rng;

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
    // Check paths to ensure we find them on Mac/Linux
    let node = Command::new("node").arg("-v").output().is_ok();
    let docker = Command::new("docker").arg("info").output().is_ok();
    // Check if openclaw is in path
    let openclaw = Command::new("openclaw").arg("--version").output().is_ok();

    PrereqCheck {
        node_installed: node,
        docker_running: docker,
        openclaw_installed: openclaw,
    }
}

#[command]
fn install_openclaw() -> Result<String, String> {
    // 1. Install via npm
    // On Mac/Linux, this might fail without sudo. 
    // We try to install to a user-local prefix if global fails, but for now we assume permission or user-configured npm.
    let output = Command::new("npm")
        .args(&["install", "-g", "openclaw"])
        .output()
        .map_err(|e| format!("Failed to execute npm: {}", e))?;

    if output.status.success() {
        Ok("OpenClaw installed successfully.".into())
    } else {
        Err(format!("Install failed: {}", String::from_utf8_lossy(&output.stderr)))
    }
}

#[command]
fn configure_agent(config: AgentConfig) -> Result<String, String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let openclaw_root = home.join(".openclaw");
    let workspace = openclaw_root.join("workspace");

    fs::create_dir_all(&workspace).map_err(|e| e.to_string())?;

    // Generate a random gateway token
    let gateway_token: String = rand::thread_rng()
        .sample_iter(&rand::distributions::Alphanumeric)
        .take(32)
        .map(char::from)
        .collect();

    // Handle Telegram Config section
    let telegram_section = if let Some(token) = config.telegram_token {
        if !token.is_empty() {
            format!(r#",
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

    // Write config.json
    let config_json = format!(r#"{{
  "agents": {{
    "defaults": {{
      "model": {{
        "primary": "{}"
      }},
      "workspace": "{}/.openclaw/workspace"
    }}
  }},
  "auth": {{
    "profiles": {{
      "{}": {{
        "mode": "api_key",
        "key": "{}"
      }}
    }}
  }},
  "gateway": {{
    "mode": "local",
    "port": 18789,
    "bind": "loopback",
    "auth": {{
      "mode": "token",
      "token": "{}"
    }}
  }}{}
}}"#, config.model, home.display(), config.provider, config.api_key, gateway_token, telegram_section);

    fs::write(openclaw_root.join("config.json"), config_json).map_err(|e| e.to_string())?;

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
    // Stop any existing instance first
    let _ = Command::new("openclaw").args(&["gateway", "stop"]).output();

    // Install the gateway service
    let install_output = Command::new("openclaw")
        .args(&["gateway", "install", "--force"])
        .output()
        .map_err(|e| format!("Failed to install gateway: {}", e))?;

    if !install_output.status.success() {
        return Err(format!("Gateway install failed: {}", String::from_utf8_lossy(&install_output.stderr)));
    }

    // Wait a moment for install to complete
    thread::sleep(Duration::from_secs(1));

    // Start the gateway service
    let start_output = Command::new("openclaw")
        .args(&["gateway", "start"])
        .output()
        .map_err(|e| format!("Failed to start gateway: {}", e))?;

    if !start_output.status.success() {
        return Err(format!("Gateway start failed: {}", String::from_utf8_lossy(&start_output.stderr)));
    }

    Ok("Gateway installed and started.".into())
}

#[command]
fn generate_pairing_code() -> Result<String, String> {
    // Wait a bit for gateway to be ready
    thread::sleep(Duration::from_secs(3));

    let output = Command::new("openclaw")
        .args(&["pairing", "create", "--channel", "telegram"])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let raw = String::from_utf8_lossy(&output.stdout).to_string();
        // The CLI might output extra text, we should try to extract the code
        // For now, return raw output (it's usually just the code or a sentence containing it)
        Ok(raw)
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[command]
fn get_dashboard_url() -> Result<String, String> {
    // Read the config to get the gateway token
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let config_path = home.join(".openclaw/config.json");

    // If config exists, try to read the token
    if config_path.exists() {
        let config_content = fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read config: {}", e))?;

        // Parse JSON to extract token (simple string search for now)
        // In production, would use serde_json to properly parse
        if let Some(start) = config_content.find(r#""token":"#) {
            let token_start = start + 9; // Length of "token":"
            if let Some(end) = config_content[token_start..].find('"') {
                let token = &config_content[token_start..token_start + end];
                return Ok(format!("http://127.0.0.1:18789/?token={}", token));
            }
        }
    }

    // Fallback without token
    Ok("http://127.0.0.1:18789/".into())
}

#[command]
fn approve_pairing(code: String) -> Result<String, String> {
    let output = Command::new("openclaw")
        .args(&["pairing", "approve", "telegram", &code])
        .output()
        .map_err(|e| format!("Failed to approve pairing: {}", e))?;

    if output.status.success() {
        Ok("Pairing approved successfully.".into())
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
