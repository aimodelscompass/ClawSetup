# ClawSetup 🦞

**The Native Installer for OpenClaw.**

Forget the terminal. ClawSetup is a friendly wizard that installs, configures, and launches your AI agent in 2 minutes.

![ClawSetup Screenshot](https://via.placeholder.com/800x600?text=ClawSetup+Wizard)

## 🚀 How to Use

### macOS
1.  Download **`ClawSetup.dmg`** from the [Releases Page](../../releases).
2.  Drag to Applications and open it.
3.  Follow the wizard to name your agent and enter your API key.
4.  Click **"Open Dashboard"** when finished.

### Linux
1.  Download **`ClawSetup.AppImage`**.
2.  Right-click -> Properties -> Permissions -> **Allow executing file as program**.
3.  Double-click to run.

### Windows
1.  Download **`ClawSetup.exe`**.
2.  Run the installer.

## ✨ Features
- **Auto-Dependency Check:** Verifies Node.js and Docker are ready.
- **Identity Wizard:** Sets your `USER.md` and `IDENTITY.md` via a GUI (no file editing needed).
- **Config Gen:** Automatically creates the correct `config.json` for Anthropic/OpenAI.
- **One-Click Launch:** Starts the agent and opens the web dashboard.

## 🛠️ For Developers (Building from Source)

If you want to contribute or build it yourself:

```bash
# Install dependencies
npm install

# Run in dev mode
npm run tauri dev

# Build production binary
npm run tauri build
```

## 🏗️ Architecture
- **Frontend:** React + TypeScript (The Wizard UI).
- **Backend:** Rust (System calls, file writing, shell execution).
- **Framework:** Tauri v1.

---
*Built by [AI Models Compass](https://x.com/aimodelscompass).*
