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
  const [dashboardUrl, setDashboardUrl] = useState("");
  const [userPairingCode, setUserPairingCode] = useState("");
  const [pairingApproved, setPairingApproved] = useState(false);

  // Form Data
  const [userName, setUserName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentVibe, setAgentVibe] = useState("Professional");
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("anthropic"); 
  const [model, setModel] = useState("anthropic/claude-3-5-sonnet-20240620");
  const [telegramToken, setTelegramToken] = useState("");

  useEffect(() => { checkSystem(); }, []);

  async function checkSystem() {
    const res: any = await invoke("check_prerequisites");
    setChecks({ node: res.node_installed, docker: res.docker_running, openclaw: res.openclaw_installed });
  }

  async function handleInstall() {
    setLoading(true);
    try {
      setLogs("Installing OpenClaw (this may take a minute)...");
      if (!checks.openclaw) await invoke("install_openclaw");

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

      setLogs("Installing and starting Gateway...");
      await invoke("start_gateway");

      setLogs("Getting dashboard URL...");
      const url: string = await invoke("get_dashboard_url");
      setDashboardUrl(url);

      if (telegramToken) {
        setLogs("Generating Telegram Pairing Code...");
        const code: string = await invoke("generate_pairing_code");
        setPairingCode(code.trim());
      }

      setStep(6); // Go to success screen
    } catch (e) {
      setLogs("Error: " + e);
    }
    setLoading(false);
  }

  async function handleApprovePairing() {
    if (!userPairingCode) return;
    setLoading(true);
    try {
      await invoke("approve_pairing", { code: userPairingCode });
      setPairingApproved(true);
      setLogs("Pairing approved! You can now chat with your agent on Telegram.");
    } catch (e) {
      setLogs("Error approving pairing: " + e);
    }
    setLoading(false);
  }

  return (
    <div className="container">
      <h1>🦞 ClawSetup</h1>

      {step === 1 && (
        <div className="step">
          <h2>1. System Check</h2>
          <div className="check-item">Node.js: {checks.node ? "✅" : "❌"}</div>
          <div className="check-item">Docker: {checks.docker ? "✅" : "❌"}</div>
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
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="openai">OpenAI (GPT)</option>
            <option value="google">Google (Gemini)</option>
            <option value="openrouter">OpenRouter</option>
            <option value="amazon-bedrock">Amazon Bedrock</option>
            <option value="moonshot">Moonshot (Kimi)</option>
            <option value="minimax">MiniMax</option>
            <option value="xiaomi">Xiaomi (MiMo)</option>
            <option value="qwen-portal">Qwen Portal</option>
            <option value="ollama">Ollama (Local)</option>
            <option value="venice">Venice</option>
            <option value="github-copilot">GitHub Copilot</option>
          </select>

          <label>Model</label>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <optgroup label="Anthropic">
              <option value="anthropic/claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Latest)</option>
              <option value="anthropic/claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
              <option value="anthropic/claude-3-opus-20240229">Claude 3 Opus</option>
              <option value="anthropic/claude-3-haiku-20240307">Claude 3 Haiku</option>
            </optgroup>
            <optgroup label="OpenAI">
              <option value="openai/gpt-4o">GPT-4o</option>
              <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
              <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
              <option value="openai/o1-preview">o1 Preview</option>
              <option value="openai/o1-mini">o1 Mini</option>
            </optgroup>
            <optgroup label="Google">
              <option value="google/gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental)</option>
              <option value="google/gemini-1.5-pro-latest">Gemini 1.5 Pro</option>
              <option value="google/gemini-1.5-flash-latest">Gemini 1.5 Flash</option>
            </optgroup>
            <optgroup label="OpenRouter">
              <option value="openrouter/anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (via OpenRouter)</option>
              <option value="openrouter/openai/gpt-4o">GPT-4o (via OpenRouter)</option>
              <option value="openrouter/google/gemini-pro-1.5">Gemini Pro 1.5 (via OpenRouter)</option>
            </optgroup>
            <optgroup label="Moonshot">
              <option value="moonshot/kimi-k2.5-latest">Kimi K2.5 Latest</option>
              <option value="moonshot/kimi-k1.5-all">Kimi K1.5 All</option>
            </optgroup>
            <optgroup label="MiniMax">
              <option value="minimax/MiniMax-M2.1-Text">MiniMax M2.1 Text</option>
            </optgroup>
            <optgroup label="Xiaomi">
              <option value="xiaomi/MiMo-V2-Flash">MiMo V2 Flash</option>
            </optgroup>
            <optgroup label="Ollama (Local)">
              <option value="ollama/llama3.2">Llama 3.2</option>
              <option value="ollama/mistral">Mistral</option>
              <option value="ollama/qwen2.5">Qwen 2.5</option>
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
          <button onClick={handleInstall}>{loading ? "Installing..." : "Finish Setup"}</button>
          <pre>{logs}</pre>
        </div>
      )}

      {step === 6 && (
        <div className="step">
          <h2>🎉 It's Alive!</h2>
          <p>Your OpenClaw agent is running!</p>

          {pairingCode && !pairingApproved && (
            <div className="pairing-box">
              <h3>📱 Telegram Pairing</h3>
              <p><strong>Step 1:</strong> Send a message to your Telegram bot</p>
              <p><strong>Step 2:</strong> The bot will reply with a pairing code</p>
              <p><strong>Step 3:</strong> Enter the code below to approve:</p>
              <input
                placeholder="Enter 8-character code"
                value={userPairingCode}
                onChange={(e) => setUserPairingCode(e.target.value.toUpperCase())}
                maxLength={8}
              />
              <button onClick={handleApprovePairing} disabled={loading || userPairingCode.length !== 8}>
                {loading ? "Approving..." : "Approve Pairing"}
              </button>
            </div>
          )}

          {pairingApproved && (
            <div className="success-message">
              ✅ Telegram paired successfully!
            </div>
          )}

          <button onClick={() => dashboardUrl && open(dashboardUrl)}>Open Dashboard</button>
          {logs && <pre>{logs}</pre>}
        </div>
      )}
    </div>
  );
}

export default App;
