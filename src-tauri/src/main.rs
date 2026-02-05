use tauri::command;
use std::process::Command;
use std::fs;
use std::path::PathBuf;
use std::thread;
use std::time::Duration;

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

    // Handle Telegram Config section
    let telegram_section = if let Some(token) = config.telegram_token {
        if !token.is_empty() {
            format!(r#",
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

    // Write config.json
    let config_json = format!(r#"{{
  "agents": {{
    "defaults": {{
      "model": {{
        "primary": "{}" 
      }}
    }}
  }},
  "auth": {{
    "profiles": {{
      "{}": {{
        "mode": "api_key",
        "key": "{}"
      }}
    }}
  }}{}
}}"#, config.model, config.provider, config.api_key, telegram_section);

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

    // Start in background (daemon mode)
    // We use std::process::Command to spawn it.
    let child = Command::new("openclaw")
        .args(&["gateway", "start", "--background"])
        .spawn()
        .map_err(|e| format!("Failed to start gateway: {}", e))?;

    Ok("Gateway started.".into())
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

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            check_prerequisites, 
            install_openclaw, 
            configure_agent,
            start_gateway,
            generate_pairing_code
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
