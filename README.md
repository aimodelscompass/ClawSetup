# ClawSetup 🦞

**The Native Installer for OpenClaw.**

Forget the terminal. ClawSetup is a friendly wizard that installs, configures, and launches your AI agent in 2 minutes.

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

## 🛠️ Developer Setup (Building from Source)

**Prerequisites:**
- Node.js (v18+)
- Rust (Cargo)

```bash
# 1. Clone the repo
git clone https://github.com/aimodelscompass/ClawSetup.git
cd ClawSetup

# 2. Install dependencies
npm install

# 3. Run in Development Mode (Launches the GUI)
npm run tauri dev

# 4. Build Production Binary
npm run tauri build
```

## 🏗️ Architecture
- **Frontend:** React + TypeScript (The Wizard UI).
- **Backend:** Rust (System calls, file writing, shell execution).
- **Framework:** Tauri v1.

---
*Built by [AI Models Compass](https://x.com/aimodelscompass).*
