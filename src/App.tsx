import { useState, useEffect, useRef, useMemo } from "react";
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
import { SUPPORTED_PROVIDERS, AuthModeDefinition } from "./model-definitions";

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

  // Chat state (lifted to persist across tab switches)
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [streamingMessage, setStreamingMessage] = useState("");

  // Setup/Onboarding state
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("anthropic");
  const [authMode, setAuthMode] = useState("api_key");
  const [model, setModel] = useState("anthropic.claude-3-5-sonnet-20241022-v2:0");
  const [telegramToken, setTelegramToken] = useState("");
  // Dashboard/Pairing state
  const [dashboardUrl, setDashboardUrl] = useState("http://127.0.0.1:18789");
  const [pairingInput, setPairingInput] = useState("");
  const [pairingStatus, setPairingStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Computed values for provider/auth/model selection
  const selectedProvider = useMemo(() =>
    SUPPORTED_PROVIDERS.find(p => p.id === provider),
    [provider]
  );

  const availableAuthModes = useMemo(() =>
    selectedProvider?.authModes || [],
    [selectedProvider]
  );

  const availableModels = useMemo(() =>
    selectedProvider?.models || [],
    [selectedProvider]
  );

  const selectedAuthModeDefinition = useMemo(() =>
    availableAuthModes.find(m => m.mode === authMode),
    [availableAuthModes, authMode]
  );

  // Reset auth mode and model when provider changes
  const handleProviderChange = (providerId: string) => {
    setProvider(providerId);
    const newProvider = SUPPORTED_PROVIDERS.find(p => p.id === providerId);
    if (newProvider?.authModes?.length) {
      setAuthMode(newProvider.authModes[0].mode);
    }
    if (newProvider?.models?.length) {
      setModel(newProvider.models[0].id);
    }
    setApiKey("");
  };

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
          telegram_token: telegramToken || null
        }
      });
      await invoke("start_gateway_service");

      // Get authenticated URL
      const url: string = await invoke("get_dashboard_url");
      setDashboardUrl(url);

      // Move to success/pairing step
      setStep(5);
    } catch (e) {
      alert("Setup failed: " + e);
    }
    setLoading(false);
  }

  async function handlePairing() {
    if (!pairingInput) return;
    setPairingStatus("Verifying...");
    try {
      await invoke("approve_pairing", { code: pairingInput });
      setPairingStatus("✅ Success! Bot paired.");
      setPairingInput("");
    } catch (e) {
      setPairingStatus("❌ Error: " + e);
    }
  }

  function finishOnboarding() {
    setIsOnboarded(true);
    checkOnboarding();
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
              <select value={provider} onChange={(e) => handleProviderChange(e.target.value)} style={{ width: "100%" }}>
                {SUPPORTED_PROVIDERS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              {availableAuthModes.length > 0 && (
                <>
                  <label style={{ marginTop: "15px" }}>Authentication Method</label>
                  <select value={authMode} onChange={(e) => setAuthMode(e.target.value)} style={{ width: "100%" }}>
                    {availableAuthModes.map(m => (
                      <option key={m.mode} value={m.mode}>{m.name}</option>
                    ))}
                  </select>
                  {selectedAuthModeDefinition && (
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "5px" }}>
                      {selectedAuthModeDefinition.description}
                    </p>
                  )}
                </>
              )}

              {(authMode === 'api_key' || authMode === 'token') && (
                <>
                  <label style={{ marginTop: "15px" }}>{authMode === 'api_key' ? 'API Key' : 'Access Token'}</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={selectedAuthModeDefinition?.envVar || "sk-..."}
                  />
                </>
              )}

              {(authMode === 'oauth' || authMode === 'cli_sync') && (
                <div style={{ marginTop: "15px", padding: "12px", background: "var(--bg-secondary)", borderRadius: "8px", fontSize: "13px" }}>
                  {authMode === 'oauth' ? (
                    <>
                      <strong>Browser Authentication</strong>
                      <p style={{ margin: "5px 0 0", color: "var(--text-secondary)" }}>
                        After setup, run <code>openclaw auth {provider}</code> to authenticate.
                      </p>
                    </>
                  ) : (
                    <>
                      <strong>CLI Credential Sync</strong>
                      <p style={{ margin: "5px 0 0", color: "var(--text-secondary)" }}>
                        Credentials will sync from <code>{selectedAuthModeDefinition?.cliTool}</code>.
                      </p>
                    </>
                  )}
                </div>
              )}

              {authMode === 'aws_sdk' && (
                <div style={{ marginTop: "15px", padding: "12px", background: "var(--bg-secondary)", borderRadius: "8px", fontSize: "13px" }}>
                  <strong>AWS SDK Authentication</strong>
                  <p style={{ margin: "5px 0 0", color: "var(--text-secondary)" }}>
                    Uses AWS environment credentials or IAM role.
                  </p>
                </div>
              )}

              {availableModels.length > 0 && (
                <>
                  <label style={{ marginTop: "15px" }}>Model</label>
                  <select value={model} onChange={(e) => setModel(e.target.value)} style={{ width: "100%" }}>
                    {availableModels.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </>
              )}

              <button
                disabled={(authMode === 'api_key' || authMode === 'token') && !apiKey}
                onClick={() => setStep(4)}
                style={{ width: "100%", marginTop: "20px" }}
              >
                Next Step
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="step">
              <label>Connect Telegram (Optional)</label>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "15px" }}>
                Create a bot via <a href="#" onClick={() => invoke("open_url", { url: "https://t.me/BotFather" })}>@BotFather</a> and paste the token here.
              </p>
              <input
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                placeholder="123456:ABC-DEF1234..."
              />
              <button
                onClick={handleInitialSetup}
                style={{ width: "100%", marginTop: "20px" }}
              >
                {loading ? "Installing & Configuring..." : "Finish Setup"}
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="step">
              <h2>🎉 It's Alive!</h2>
              <p>Your agent is running on <strong>{dashboardUrl}</strong></p>

              <div className="pairing-box" style={{ marginTop: "20px", padding: "15px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                <h3>Telegram Pairing</h3>
                <p style={{ fontSize: "0.9em", color: "var(--text-secondary)" }}>
                  Message your bot on Telegram to get a pairing code.
                </p>

                {telegramToken ? (
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexDirection: "column" }}>
                    <input
                      placeholder="Enter code (e.g. 3RQ8EBFE)"
                      value={pairingInput}
                      onChange={(e) => setPairingInput(e.target.value)}
                      style={{ textAlign: "center", letterSpacing: "2px" }}
                    />
                    <button className="primary-btn" onClick={handlePairing} disabled={!pairingInput || pairingStatus === "Verifying..."}>
                      {pairingStatus === "Verifying..." ? "Verifying..." : "Verify & Pair"}
                    </button>
                    {pairingStatus && <div style={{ fontWeight: "bold", color: pairingStatus.includes("Error") ? "red" : "green" }}>{pairingStatus}</div>}
                  </div>
                ) : (
                  <p style={{ fontSize: "0.8em", color: "var(--text-secondary)" }}>Telegram not configured.</p>
                )}
              </div>

              <button onClick={finishOnboarding} style={{ marginTop: "20px", width: "100%" }}>Open Dashboard</button>
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
          {activeTab === "chat" && (
            <ChatTab
              client={gatewayClient}
              messages={chatMessages}
              setMessages={setChatMessages}
              streamingMessage={streamingMessage}
              setStreamingMessage={setStreamingMessage}
            />
          )}
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