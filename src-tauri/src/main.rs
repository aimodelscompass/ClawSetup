use tauri::command;
use std::process::Command;
use std::fs;
use std::path::PathBuf;

#[derive(serde::Deserialize)]
struct AgentConfig {
    provider: String,
    api_key: String,
    model: String,
    user_name: String,
    agent_name: String,
    agent_vibe: String,
}

#[derive(serde::Serialize)]
struct PrereqCheck {
    node_installed: bool,
    docker_running: bool,
    openclaw_installed: bool,
}

#[command]
fn check_prerequisites() -> PrereqCheck {
    let node = Command::new("node").arg("-v").output().is_ok();
    let docker = Command::new("docker").arg("info").output().is_ok();
    let openclaw = Command::new("openclaw").arg("--version").output().is_ok();

    PrereqCheck {
        node_installed: node,
        docker_running: docker,
        openclaw_installed: openclaw,
    }
}

#[command]
fn install_openclaw() -> Result<String, String> {
    // Attempt npm install -g openclaw
    let output = Command::new("npm")
        .args(&["install", "-g", "openclaw"])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok("OpenClaw installed successfully.".into())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[command]
fn configure_agent(config: AgentConfig) -> Result<String, String> {
    // 1. Resolve Workspace Path (~/.openclaw/workspace)
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let openclaw_root = home.join(".openclaw");
    let workspace = openclaw_root.join("workspace");

    fs::create_dir_all(&workspace).map_err(|e| e.to_string())?;

    // 2. Write config.json
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
  }}
}}"#, config.model, config.provider, config.api_key);

    fs::write(openclaw_root.join("config.json"), config_json).map_err(|e| e.to_string())?;

    // 3. Write IDENTITY.md
    let identity_md = format!(r#"# IDENTITY.md - Who Am I?

- **Name:** {}
- **Vibe:** {}
- **Emoji:** 🦞

---
Managed by ClawSetup.
"#, config.agent_name, config.agent_vibe);
    
    fs::write(workspace.join("IDENTITY.md"), identity_md).map_err(|e| e.to_string())?;

    // 4. Write USER.md
    let user_md = format!(r#"# USER.md - About Your Human

- **Name:** {}
- **Role:** The User

---
Managed by ClawSetup.
"#, config.user_name);

    fs::write(workspace.join("USER.md"), user_md).map_err(|e| e.to_string())?;

    // 5. Write SOUL.md (Simple template based on vibe)
    let soul_instruction = match config.agent_vibe.as_str() {
        "Professional" => "Be concise, formal, and efficient.",
        "Friendly" => "Be warm, helpful, and use emojis occasionally.",
        "Chaos" => "Be wild, creative, and unrestrained.",
        _ => "Be helpful and accurate."
    };

    let soul_md = format!(r#"# SOUL.md - Who You Are

## Core Directives
{}

## Mission
Serve {} to the best of your ability.
"#, soul_instruction, config.user_name);

    fs::write(workspace.join("SOUL.md"), soul_md).map_err(|e| e.to_string())?;

    Ok("Configuration files created.".into())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![check_prerequisites, install_openclaw, configure_agent])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
