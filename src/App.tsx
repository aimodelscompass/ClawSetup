import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { GatewayClient } from "./GatewayClient";
import "./App.css";
import { Tab, OpenClawConfig, WorkspaceFile } from "./types";
import { ChatTab } from "./components/ChatTab";
import { AgentsTab } from "./components/AgentsTab";
import { ModelsTab } from "./components/ModelsTab";
import { ConnectTab } from "./components/ConnectTab";
import { SystemTab } from "./components/SystemTab";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [config, setConfig] = useState<OpenClawConfig | null>(null);
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>([]);
  const [gatewayStatus, setGatewayStatus] = useState("Offline");
  const [isGatewayConnected, setIsGatewayConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [gatewayClient, setGatewayClient] = useState<GatewayClient | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Setup/Onboarding state
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("anthropic");
  const [model, setModel] = useState("anthropic/claude-3-5-sonnet-20241022");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    init();
    const unlisten = listen("log-event", (event: any) => {
      setLogs((prev) => [...prev.slice(-500), event.payload]);
    });

    invoke("stream_logs").catch(console.error);
    const statusInterval = setInterval(refreshStatus, 5000);

    return () => {
      unlisten.then(u => u());
      clearInterval(statusInterval);
      gatewayClient?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isOnboarded && config && !gatewayClient) {
      const token = config.gateway?.auth?.token;
      if (token) {
        const client = new GatewayClient(
          `ws://127.0.0.1:18789/?token=${token}`,
          token,
          (event, payload) => {
            // Handle global gateway events
          },
          (connected) => {
            setIsGatewayConnected(connected);
          }
        );
        client.connect();
        setGatewayClient(client);
      }
    }
  }, [isOnboarded, config, gatewayClient]);

  async function init() {
    await checkOnboarding();
    refreshStatus();
  }

  async function checkOnboarding() {
    try {
      const cfg: OpenClawConfig = await invoke("get_openclaw_config");
      if (cfg && cfg.agents) {
        setConfig(cfg);
        setIsOnboarded(true);
        loadWorkspace();
        return cfg;
      }
    } catch (e) {
      console.error("Failed to load config", e);
    }
    return null;
  }

  async function loadWorkspace() {
    try {
      const files: WorkspaceFile[] = await invoke("get_workspace_files");
      setWorkspaceFiles(files);
    } catch (e) {
      console.error("Failed to load workspace", e);
    }
  }

  async function refreshStatus() {
    try {
      const status: string = await invoke("get_gateway_status");
      setGatewayStatus(status);
    } catch (e) {
      setGatewayStatus("Offline");
    }
  }

  async function handleInitialSetup() {
    setLoading(true);
    try {
      await invoke("install_openclaw");
      await invoke("configure_agent", {
        config: {
          provider,
          api_key: apiKey,
          model,
          user_name: userName,
          agent_name: agentName,
          agent_vibe: "Friendly",
          telegram_token: null
        }
      });
      await invoke("start_gateway_service");
      setIsOnboarded(true);
      checkOnboarding();
    } catch (e) {
      alert("Setup failed: " + e);
    }
    setLoading(false);
  }

  if (!isOnboarded) {
    return (
      <div className="onboarding-overlay">
        <div className="onboarding-card">
          <h1>🦞 Welcome to OpenClaw</h1>
          <p style={{ marginBottom: "30px", color: "var(--text-secondary)" }}>Let's set up your native AI agent.</p>

          {step === 1 && (
            <div className="step">
              <label>What's your name?</label>
              <input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="David" autoFocus />
              <button disabled={!userName} onClick={() => setStep(2)} style={{ width: "100%", marginTop: "20px" }}>Continue</button>
            </div>
          )}

          {step === 2 && (
            <div className="step">
              <label>Name your Agent</label>
              <input value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Jeeves" autoFocus />
              <button disabled={!agentName} onClick={() => setStep(3)} style={{ width: "100%", marginTop: "20px" }}>Continue</button>
            </div>
          )}

          {step === 3 && (
            <div className="step">
              <label>AI Provider</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)} style={{ width: "100%" }}>
                <option value="anthropic">Anthropic</option>
                <option value="openai">OpenAI</option>
              </select>
              <label style={{ marginTop: "15px" }}>API Key</label>
              <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." />
              <button disabled={!apiKey} onClick={handleInitialSetup} style={{ width: "100%", marginTop: "20px" }}>
                {loading ? "Setting up..." : "Finish Setup"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="sidebar">
        <div
          className={`sidebar-item ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          <span className="sidebar-icon">💬</span> Chat
        </div>
        <div
          className={`sidebar-item ${activeTab === "agents" ? "active" : ""}`}
          onClick={() => setActiveTab("agents")}
        >
          <span className="sidebar-icon">🤖</span> Agents
        </div>
        <div
          className={`sidebar-item ${activeTab === "models" ? "active" : ""}`}
          onClick={() => setActiveTab("models")}
        >
          <span className="sidebar-icon">🧠</span> Models
        </div>
        <div
          className={`sidebar-item ${activeTab === "connect" ? "active" : ""}`}
          onClick={() => setActiveTab("connect")}
        >
          <span className="sidebar-icon">🔌</span> Connect
        </div>
        <div
          className={`sidebar-item ${activeTab === "system" ? "active" : ""}`}
          onClick={() => setActiveTab("system")}
        >
          <span className="sidebar-icon">⚙️</span> System
        </div>

        <div style={{ marginTop: "auto", padding: "15px", borderTop: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: "11px", color: "var(--text-secondary)" }}>
            <span className={`status-indicator ${isGatewayConnected ? "status-online" : "status-offline"}`}></span>
            Gateway: {isGatewayConnected ? "Connected" : "Disconnected"}
          </div>
        </div>
      </div>

      <div className="main-content">
        <header className="header">
          <div className="header-title">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</div>
          <div>
            <button className="secondary" onClick={refreshStatus} style={{ padding: "4px 8px", fontSize: "11px" }}>Refresh</button>
          </div>
        </header>

        <div className="content-area">
          {activeTab === "chat" && <ChatTab client={gatewayClient} />}
          {activeTab === "agents" && <AgentsTab files={workspaceFiles} config={config} />}
          {activeTab === "models" && <ModelsTab config={config} />}
          {activeTab === "connect" && <ConnectTab config={config} />}
          {activeTab === "system" && <SystemTab logs={logs} logEndRef={logEndRef} />}
        </div>
      </div>
    </div>
  );
}

export default App;