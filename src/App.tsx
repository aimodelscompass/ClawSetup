import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { GatewayClient } from "./GatewayClient";
import "./App.css";

type Tab = "chat" | "agents" | "models" | "connect" | "system";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [workspaceFiles, setWorkspaceFiles] = useState<any[]>([]);
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
      const cfg: any = await invoke("get_openclaw_config");
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
      const files: any = await invoke("get_workspace_files");
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

function ChatTab({ client }: { client: GatewayClient | null }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [streamingMessage, setStreamingMessage] = useState("");

  useEffect(() => {
    if (!client) return;

    // Listen for chat events
    const originalOnEvent = (client as any).onEvent;
    (client as any).onEvent = (event: string, payload: any) => {
      if (event === "chat.stream") {
        setStreamingMessage((prev) => prev + (payload.delta || ""));
      } else if (event === "chat.done") {
        setMessages((prev) => [...prev, { role: "agent", content: payload.text || "" }]);
        setStreamingMessage("");
      }
      if (originalOnEvent) originalOnEvent(event, payload);
    };
  }, [client]);

  const handleSend = async () => {
    if (!input.trim() || !client) return;
    
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      await client.request("chat.send", {
        message: input,
        sessionKey: "desktop-session",
      });
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: "agent", content: "Error: " + (e.message || JSON.stringify(e)) }]);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="chat-messages">
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "100px" }}>
            <span style={{ fontSize: "40px" }}>🦞</span>
            <h3>How can I help you today?</h3>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            {m.content}
          </div>
        ))}
        {streamingMessage && <div className="message agent">{streamingMessage}</div>}
      </div>
      <div className="chat-input-container">
        <input 
          style={{ flex: 1 }} 
          placeholder={client ? "Type a message..." : "Connecting to gateway..."} 
          disabled={!client}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} disabled={!client || !input.trim()}>Send</button>
      </div>
    </div>
  );
}

function AgentsTab({ files, config }: { files: any[], config: any }) {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [content, setContent] = useState("");
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");

  const handleSave = async () => {
    if (!selectedFile) return;
    await invoke("save_workspace_file", { name: selectedFile.name, content });
    alert("Saved!");
  };

  const handleAddAgent = async () => {
    if (!newAgentName) return;
    // Implementation for adding agent to config
    const newConfig = { ...config };
    newConfig.agents = newConfig.agents || {};
    newConfig.agents[newAgentName] = { 
       workspace: config.agents.defaults.workspace,
       model: config.agents.defaults.model
    };
    await invoke("save_openclaw_config", { config: newConfig });
    setIsAddingAgent(false);
    setNewAgentName("");
    alert("Agent added! Restart gateway to apply.");
  };

  const agents = config?.agents ? Object.keys(config.agents).filter(k => k !== "defaults") : ["main"];

  return (
    <div className="grid">
      <div className="card" style={{ gridColumn: "span 1" }}>
        <div className="card-title">Agents</div>
        {agents.map(a => (
          <div key={a} className="sidebar-item" style={{ margin: "2px 0", background: "var(--hover-bg)" }}>
            🤖 {a}
          </div>
        ))}
        <button 
          className="secondary" 
          style={{ width: "100%", marginTop: "10px", fontSize: "11px" }}
          onClick={() => setIsAddingAgent(true)}
        >+ New Agent</button>
        
        {isAddingAgent && (
          <div style={{ marginTop: "10px" }}>
            <input 
              placeholder="Agent Name" 
              value={newAgentName} 
              onChange={e => setNewAgentName(e.target.value)} 
              style={{ width: "100%", marginBottom: "5px" }}
            />
            <button onClick={handleAddAgent} style={{ width: "100%" }}>Create</button>
          </div>
        )}

        <div className="card-title" style={{ marginTop: "20px" }}>Files</div>
        {files.map(f => (
          <div 
            key={f.name} 
            className="sidebar-item" 
            style={{ margin: "2px 0" }}
            onClick={() => { setSelectedFile(f); setContent(f.content); }}
          >
            📄 {f.name}
          </div>
        ))}
      </div>
      <div className="card" style={{ gridColumn: "span 2" }}>
        <div className="card-title">
          {selectedFile ? `Editing ${selectedFile.name}` : "Select a personality file to edit"}
        </div>
        {selectedFile && (
          <>
            <textarea 
              style={{ width: "100%", height: "450px", fontFamily: "monospace", resize: "none", padding: "10px" }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button onClick={handleSave} style={{ marginTop: "10px" }}>Save Changes</button>
          </>
        )}
      </div>
    </div>
  );
}

function ModelsTab({ config }: { config: any }) {
  return (
    <div className="grid">
      <div className="card">
        <div className="card-title">Primary Brain</div>
        <select style={{ width: "100%" }} value={config?.agents?.defaults?.model?.primary}>
          <option>{config?.agents?.defaults?.model?.primary}</option>
        </select>
        <p style={{ marginTop: "10px", color: "var(--text-secondary)" }}>Using provider configuration from auth.profiles</p>
      </div>
      <div className="card">
        <div className="card-title">Providers</div>
        {config?.auth?.profiles && Object.keys(config.auth.profiles).map(p => (
          <div key={p} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
             <span>{p}</span>
             <span style={{ color: "var(--text-secondary)" }}>✓ Connected</span>
          </div>
        ))}
        <button className="secondary" style={{ width: "100%" }}>+ Add Provider</button>
      </div>
    </div>
  );
}

function ConnectTab({ config }: { config: any }) {
  return (
    <div className="grid">
      <div className="card">
        <div className="card-title">Telegram</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Primary Bot</span>
          <span className="status-indicator status-online"></span>
        </div>
        <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "10px" }}>
          Pairing mode: Pairing
        </p>
      </div>
      <div className="card">
        <div className="card-title">Skills</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {["Search", "Shell", "Vision", "Memory"].map(s => (
            <span key={s} style={{ background: "var(--hover-bg)", padding: "4px 8px", borderRadius: "4px", fontSize: "11px" }}>{s}</span>
          ))}
        </div>
        <button className="secondary" style={{ width: "100%", marginTop: "15px" }}>Manage Skills</button>
      </div>
    </div>
  );
}

function SystemTab({ logs, logEndRef }: { logs: string[], logEndRef: any }) {
  return (
    <div className="grid">
      <div className="card" style={{ gridColumn: "span 3" }}>
        <div className="card-title">Gateway Logs</div>
        <div className="log-view">
          {logs.map((l, i) => <div key={i}>{l}</div>)}
          <div ref={logEndRef} />
        </div>
        <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
          <button onClick={() => invoke("control_gateway", { action: "restart" })}>Restart Gateway</button>
          <button className="secondary" onClick={() => invoke("control_gateway", { action: "stop" })}>Stop Gateway</button>
        </div>
      </div>
    </div>
  );
}

export default App;