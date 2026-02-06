import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/shell";
import "./App.css";

function App() {
  const [step, setStep] = useState(1);
  const [checks, setChecks] = useState({ node: false, docker: false, openclaw: false });
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState("");
  const [pairingCode, setPairingCode] = useState("");

  // Form Data
  const [userName, setUserName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentVibe, setAgentVibe] = useState("Professional");
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("anthropic");
  const [model, setModel] = useState("anthropic/claude-haiku-4-5-20251001");
  const [telegramToken, setTelegramToken] = useState("");
  const [progress, setProgress] = useState("");
  const [dashboardUrl, setDashboardUrl] = useState("http://127.0.0.1:18789");
  
  // Pairing Data
  const [pairingInput, setPairingInput] = useState("");
  const [pairingStatus, setPairingStatus] = useState("");

  useEffect(() => { checkSystem(); }, []);

  async function checkSystem() {
    const res: any = await invoke("check_prerequisites");
    setChecks({
      node: res.node_installed,
      docker: res.docker_running, // Keep for backward compat but not displayed
      openclaw: res.openclaw_installed
    });
  }

  async function handleInstall() {
    setLoading(true);
    setProgress("Starting setup...");
    try {
      setProgress("Installing OpenClaw (this may take a minute)...");
      setLogs("Installing OpenClaw (this may take a minute)...");
      if (!checks.openclaw) await invoke("install_openclaw");

      setProgress("Configuring agent...");
      setLogs("Configuring...");
      await invoke("configure_agent", {
        config: {
          provider,
          api_key: apiKey,
          model,
          user_name: userName,
          agent_name: agentName,
          agent_vibe: agentVibe,
          telegram_token: telegramToken
        }
      });

      setProgress("Starting Gateway (this may take 20-30 seconds)...");
      setLogs("Starting Gateway...");
      await invoke("start_gateway");

      setProgress("Finalizing setup...");
      // Just getting instruction text now
      const instruction: string = await invoke("generate_pairing_code");
      setPairingCode(instruction); // "Ready! Send any message..."

      // Get authenticated URL
      const url: string = await invoke("get_dashboard_url");
      setDashboardUrl(url);

      setProgress("");
      setStep(6); // Go to pairing
    } catch (e) {
      setProgress("");
      setLogs("Error: " + e);
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

  return (
    <div className="container">
      <h1>🦞 ClawSetup</h1>

      {step === 1 && (
        <div className="step">
          <h2>1. System Check</h2>
          <div className="check-item">Node.js: {checks.node ? "✅" : "❌"}</div>
          <div className="check-item">OpenClaw: {checks.openclaw ? "✅ Installed" : "⏳ Will install"}</div>
          <button disabled={!checks.node} onClick={() => setStep(2)}>Next: Identity</button>
        </div>
      )}

      {step === 2 && (
        <div className="step">
          <h2>2. Who are you?</h2>
          <input placeholder="David" value={userName} onChange={(e) => setUserName(e.target.value)} />
          <button disabled={!userName} onClick={() => setStep(3)}>Next</button>
        </div>
      )}

      {step === 3 && (
        <div className="step">
          <h2>3. Create your Agent</h2>
          <label>Name</label>
          <input placeholder="Jeeves" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
          <label>Vibe</label>
          <select value={agentVibe} onChange={(e) => setAgentVibe(e.target.value)}>
            <option>Professional</option><option>Friendly</option><option>Chaos</option>
          </select>
          <button disabled={!agentName} onClick={() => setStep(4)}>Next</button>
        </div>
      )}

      {step === 4 && (
        <div className="step">
          <h2>4. Connect Brain</h2>
          <label>Provider</label>
          <select value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="anthropic">Anthropic</option>
            <option value="openai">OpenAI</option>
            <option value="google">Google</option>
            <option value="openrouter">OpenRouter</option>
            <option value="ollama">Ollama (Local)</option>
          </select>
          
          <label>Model</label>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <optgroup label="Anthropic">
              <option value="anthropic/claude-opus-4-6">Claude Opus 4.6 (Most Powerful)</option>
              <option value="anthropic/claude-opus-4-5-20260201">Claude Opus 4.5 (Powerful)</option>
              <option value="anthropic/claude-sonnet-4-5-20250929">Claude Sonnet 4.5 (Balanced)</option>
              <option value="anthropic/claude-haiku-4-5-20251001">Claude Haiku 4.5 (Fast & Cheap)</option>
              <option value="anthropic/claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Latest)</option>
            </optgroup>
            <optgroup label="OpenAI">
              <option value="openai/gpt-4o">GPT-4o</option>
              <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
              <option value="openai/o1-preview">o1 Preview</option>
            </optgroup>
            <optgroup label="Google">
              <option value="google/gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental)</option>
              <option value="google/gemini-1.5-pro-latest">Gemini 1.5 Pro</option>
            </optgroup>
            <optgroup label="Ollama (Local)">
              <option value="ollama/llama3.2">Llama 3.2</option>
              <option value="ollama/mistral">Mistral</option>
            </optgroup>
          </select>

          <label>API Key</label>
          <input type="password" placeholder="sk-..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          
          <button disabled={!apiKey} onClick={() => setStep(5)}>Next: Channels</button>
        </div>
      )}

      {step === 5 && (
        <div className="step">
          <h2>5. Connect Telegram (Optional)</h2>
          <p>Create a bot via @BotFather and paste the token.</p>
          <input placeholder="123456:ABC-..." value={telegramToken} onChange={(e) => setTelegramToken(e.target.value)} />
          <button onClick={handleInstall} disabled={loading}>{loading ? "Installing..." : "Finish Setup"}</button>
          {progress && <div style={{ marginTop: "10px", color: "#0084ff", fontWeight: "bold" }}>{progress}</div>}
          <pre>{logs}</pre>
        </div>
      )}

      {step === 6 && (
        <div className="step">
          <h2>🎉 It's Alive!</h2>
          <p>Your agent is running on <strong>{dashboardUrl}</strong></p>

          <div className="pairing-box">
             <h3>Telegram Pairing</h3>
             <p style={{fontSize: "0.9em"}}>{pairingCode || "Message your bot to get a code."}</p>
             
             {telegramToken && (
               <div style={{display: "flex", gap: "10px", marginTop: "10px", flexDirection: "column"}}>
                 <input 
                   placeholder="Enter code (e.g. 3RQ8EBFE)" 
                   value={pairingInput} 
                   onChange={(e) => setPairingInput(e.target.value)} 
                   style={{textAlign: "center", letterSpacing: "2px"}}
                 />
                 <button onClick={handlePairing} disabled={!pairingInput || pairingStatus === "Verifying..."}>
                   {pairingStatus === "Verifying..." ? "Verifying..." : "Verify & Pair"}
                 </button>
                 {pairingStatus && <div style={{fontWeight: "bold", color: pairingStatus.includes("Error") ? "red" : "green"}}>{pairingStatus}</div>}
               </div>
             )}
          </div>

          <button onClick={() => open(dashboardUrl)} style={{marginTop: "20px"}}>Open Dashboard</button>
          <p style={{ marginTop: "20px", fontSize: "0.9em", color: "#666" }}>
            To chat via terminal: <code>openclaw tui</code>
          </p>
        </div>
      )}
    </div>
  );
}

export default App;