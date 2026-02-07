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

    // Generate a random gateway token
    let gateway_token: String = rand::thread_rng()
        .sample_iter(&rand::distributions::Alphanumeric)
        .take(32)
        .map(char::from)
        .collect();

    let profile_name = format!("{}:default", config.provider);

    // Standard OpenClaw config structure
    let config_json = serde_json::json!({
      "meta": {
        "lastTouchedVersion": "2026.2.6-3",
        "lastTouchedAt": ""
      },
      "messages": { "ackReactionScope": "group-mentions" },
      "agents": {
        "defaults": {
          "maxConcurrent": 4,
          "subagents": { "maxConcurrent": 8 },
          "compaction": { "mode": "safeguard" },
          "workspace": workspace.to_string_lossy(),
          "model": { "primary": config.model },
          "models": {
            config.model.clone(): {}
          }
        }
      },
      "gateway": {
        "mode": "local",
        "port": 18789,
        "bind": "loopback",
        "auth": { "mode": "token", "token": gateway_token },
        "tailscale": { "mode": "off", "resetOnExit": false }
      },
      "auth": {
        "profiles": {
          &profile_name: { "provider": config.provider, "mode": "token" }
        }
      },
      "plugins": {
        "entries": {
          "telegram": { "enabled": config.telegram_token.is_some() }
        }
      }
    });

    let config_path = openclaw_root.join("openclaw.json");
    fs::write(&config_path, serde_json::to_string_pretty(&config_json).unwrap()).map_err(|e| e.to_string())?;

    // Write auth-profiles.json for the main agent
    let auth_profiles_json = serde_json::json!({
      "version": 1,
      "profiles": {
        &profile_name: { "type": "token", "provider": config.provider, "token": config.api_key }
      },
      "lastGood": { &config.provider: &profile_name }
    });

    fs::write(agents_dir.join("auth-profiles.json"), serde_json::to_string_pretty(&auth_profiles_json).unwrap()).map_err(|e| e.to_string())?;

    // Initial Identity files
    fs::write(workspace.join("IDENTITY.md"), format!("# IDENTITY.md\n\nI am {}, an AI agent powered by OpenClaw.\n\nVibe: {}", config.agent_name, config.agent_vibe)).ok();
    fs::write(workspace.join("USER.md"), format!("# USER.md\n\nAbout my human: {}\n", config.user_name)).ok();
    fs::write(workspace.join("SOUL.md"), "# SOUL.md\n\n## Mission\nProvide excellent assistance and maintain a helpful attitude.\n").ok();

    Ok("Configuration completed.".into())
}

#[command]
fn start_gateway_service() -> Result<String, String> {
    // 1. Install gateway service
    shell_command("openclaw gateway install --force")?;
    
    // 2. Start gateway service
    shell_command("openclaw gateway start")?;
    
    // 3. Verify status
    let status = shell_command("openclaw gateway status")?;
    Ok(status)
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
            get_openclaw_config,
            save_openclaw_config,
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
