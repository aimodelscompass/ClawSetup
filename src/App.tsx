import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
  const [step, setStep] = useState(1);
  const [checks, setChecks] = useState({ node: false, docker: false, openclaw: false });
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState("");

  // Form Data
  const [userName, setUserName] = useState("");
  const [agentName, setAgentName] = useState("Claw");
  const [agentVibe, setAgentVibe] = useState("Professional");
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("anthropic"); // default

  useEffect(() => {
    checkSystem();
  }, []);

  async function checkSystem() {
    const res: any = await invoke("check_prerequisites");
    setChecks({
      node: res.node_installed,
      docker: res.docker_running,
      openclaw: res.openclaw_installed,
    });
  }

  async function handleInstall() {
    setLoading(true);
    setLogs("Installing OpenClaw via npm...");
    try {
      await invoke("install_openclaw");
      setLogs("Configuring Identity & Memory...");
      await invoke("configure_agent", {
        config: {
          provider,
          api_key: apiKey,
          model: provider === "anthropic" ? "anthropic/claude-3-5-sonnet-20240620" : "openai/gpt-4o",
          user_name: userName,
          agent_name: agentName,
          agent_vibe: agentVibe
        }
      });
      setLogs("Done! Launching Dashboard...");
      setStep(5); // Success
    } catch (e) {
      setLogs("Error: " + e);
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
          
          <button disabled={!checks.node} onClick={() => setStep(2)}>
            Next: Identity
          </button>
          {!checks.node && <p className="error">Please install Node.js first.</p>}
        </div>
      )}

      {step === 2 && (
        <div className="step">
          <h2>2. Who are you?</h2>
          <input 
            placeholder="Your Name (e.g. Dr. Mulu)" 
            value={userName} 
            onChange={(e) => setUserName(e.target.value)} 
          />
          <button disabled={!userName} onClick={() => setStep(3)}>Next</button>
        </div>
      )}

      {step === 3 && (
        <div className="step">
          <h2>3. Create your Agent</h2>
          <input 
            placeholder="Agent Name (e.g. Jeeves)" 
            value={agentName} 
            onChange={(e) => setAgentName(e.target.value)} 
          />
          <select value={agentVibe} onChange={(e) => setAgentVibe(e.target.value)}>
            <option>Professional</option>
            <option>Friendly</option>
            <option>Chaos</option>
          </select>
          <button onClick={() => setStep(4)}>Next</button>
        </div>
      )}

      {step === 4 && (
        <div className="step">
          <h2>4. Connect Brain</h2>
          <select value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="openai">OpenAI (GPT-4)</option>
          </select>
          <input 
            type="password" 
            placeholder="sk-..." 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
          />
          <button disabled={!apiKey} onClick={handleInstall}>
            {loading ? "Installing..." : "Install & Setup"}
          </button>
          <pre>{logs}</pre>
        </div>
      )}

      {step === 5 && (
        <div className="step">
          <h2>🎉 Success!</h2>
          <p>OpenClaw is installed and configured.</p>
          <p>Agent: <b>{agentName}</b> is ready to serve <b>{userName}</b>.</p>
          <button onClick={() => window.open("http://localhost:8080", "_blank")}>
            Open Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
