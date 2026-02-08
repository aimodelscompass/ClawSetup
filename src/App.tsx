import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/shell";
import "./App.css";

function App() {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState("basic"); // "basic" or "advanced"
  const [checks, setChecks] = useState({ node: false, docker: false, openclaw: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [logs, setLogs] = useState("");
  const [pairingCode, setPairingCode] = useState("");

  // Form Data
  const [userName, setUserName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentVibe, setAgentVibe] = useState("Professional");
  const [apiKey, setApiKey] = useState("");
  const [authMethod, setAuthMethod] = useState("token"); // "token", "session", "oauth"
  const [provider, setProvider] = useState("anthropic");
  const [model, setModel] = useState("anthropic/claude-haiku-4-5-20251001");
  const [telegramToken, setTelegramToken] = useState("");
  const [progress, setProgress] = useState("");
  const [dashboardUrl, setDashboardUrl] = useState("http://127.0.0.1:18789");

  // Service Keys State
  const [serviceKeys, setServiceKeys] = useState<Record<string, string>>({});
  const [currentServiceIdx, setCurrentServiceIdx] = useState(0);
  const [isConfiguringService, setIsConfiguringService] = useState<boolean | null>(null);

  const servicesToConfigure = [
    { id: "goplaces", name: "Google Places", placeholder: "API Key" },
    { id: "notion", name: "Notion", placeholder: "Internal Integration Token" },
    { id: "elevenlabs", name: "ElevenLabs (SAG)", placeholder: "API Key" },
    { id: "nano-banana", name: "Nano Banana Pro", placeholder: "API Key" },
    { id: "openai-images", name: "OpenAI Image Gen", placeholder: "API Key" }
  ];

  // Advanced Form Data
  const [gatewayPort, setGatewayPort] = useState(18789);
  const [gatewayBind, setGatewayBind] = useState("loopback");
  const [gatewayAuthMode, setGatewayAuthMode] = useState("token");
  const [tailscaleMode, setTailscaleMode] = useState("off");
  const [nodeManager, setNodeManager] = useState("npm");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["filesystem", "terminal"]);
  
  // Pairing Data
  const [pairingInput, setPairingInput] = useState("");
  const [pairingStatus, setPairingStatus] = useState("");

  const availableSkills = [
    { id: "github", name: "GitHub", desc: "Interact with GitHub using gh CLI" },
    { id: "weather", name: "Weather", desc: "Get current weather and forecasts" },
    { id: "openai-whisper", name: "Whisper", desc: "Local speech-to-text" },
    { id: "apple-notes", name: "Apple Notes", desc: "Manage Apple Notes on macOS" },
    { id: "things-mac", name: "Things", desc: "Manage Things 3 on macOS" },
    { id: "coding-agent", name: "Coding Agent", desc: "Run Codex, Claude Code, etc." }
  ];

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
    setError(false);
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
          auth_method: authMethod,
          model,
          user_name: userName,
          agent_name: agentName,
          agent_vibe: agentVibe,
          telegram_token: telegramToken,
          gateway_port: gatewayPort,
          gateway_bind: gatewayBind,
          gateway_auth_mode: gatewayAuthMode,
          tailscale_mode: tailscaleMode,
          node_manager: nodeManager,
          skills: selectedSkills,
          service_keys: serviceKeys
        }
      });

      for (const skill of selectedSkills) {
        setProgress(`Installing skill: ${skill}...`);
        setLogs(`Installing skill: ${skill}...`);
        try {
          await invoke("install_skill", { name: skill });
        } catch (e) {
          console.error(`Failed to install skill ${skill}:`, e);
          setLogs(prev => prev + `\nWarning: Failed to install skill ${skill}: ${e}`);
        }
      }

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
      setStep(11); // Go to pairing
    } catch (e) {
      setProgress("");
      setLogs("Error: " + e);
      setError(true);
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

  const toggleSkill = (id: string) => {
    setSelectedSkills(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="container">
      <h1>🦞 ClawSetup</h1>

      {step === 1 && (
        <div className="step">
          <h2>1. System Check</h2>
          <div className="check-item">Node.js: {checks.node ? "✅" : "❌"}</div>
          <div className="check-item">OpenClaw: {checks.openclaw ? "✅ Installed" : "⏳ Will install"}</div>
          <button disabled={!checks.node} onClick={() => setStep(2)}>Next: Security</button>
        </div>
      )}

      {step === 2 && (
        <div className="step">
          <h2>2. Security Warning</h2>
          <div className="security-box">
            <p>OpenClaw is a hobby project and still in beta. Expect sharp edges.</p>
            <p>This bot can read files and run actions if tools are enabled. A bad prompt can trick it into doing unsafe things.</p>
            <p>Recommended baseline: Pairing/allowlists, Sandbox, Keep secrets out of reach.</p>
            <p><strong>I understand this is powerful and inherently risky. Continue?</strong></p>
          </div>
          <div style={{display: "flex", gap: "10px", marginTop: "20px"}}>
            <button onClick={() => setStep(3)}>Yes, I understand</button>
            <button className="secondary" onClick={() => setStep(1)}>No, take me back</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="step">
          <h2>3. Onboarding Mode</h2>
          <p>Choose how you want to configure OpenClaw.</p>
          <div className="mode-options">
            <div className={`mode-option ${mode === "basic" ? "selected" : ""}`} onClick={() => setMode("basic")}>
              <h3>QuickStart</h3>
              <p>Configure details later. Best for most users.</p>
            </div>
            <div className={`mode-option ${mode === "advanced" ? "selected" : ""}`} onClick={() => setMode("advanced")}>
              <h3>Manual (Advanced)</h3>
              <p>Configure gateway, auth, and skills now.</p>
            </div>
          </div>
          <div style={{display: "flex", gap: "10px", marginTop: "20px"}}>
            <button onClick={() => setStep(4)}>Continue</button>
            <button className="secondary" onClick={() => setStep(2)}>Back</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="step">
          <h2>4. Who are you?</h2>
          <input placeholder="David" value={userName} onChange={(e) => setUserName(e.target.value)} />
          <div style={{display: "flex", gap: "10px", marginTop: "20px"}}>
            <button disabled={!userName} onClick={() => setStep(5)}>Next</button>
            <button className="secondary" onClick={() => setStep(3)}>Back</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="step">
          <h2>5. Create your Agent</h2>
          <label>Name</label>
          <input placeholder="Jeeves" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
          <label>Vibe</label>
          <select value={agentVibe} onChange={(e) => setAgentVibe(e.target.value)}>
            <option>Professional</option><option>Friendly</option><option>Chaos</option>
          </select>
          <div style={{display: "flex", gap: "10px", marginTop: "20px"}}>
            <button disabled={!agentName} onClick={() => setStep(mode === "advanced" ? 6 : 7)}>Next</button>
            <button className="secondary" onClick={() => setStep(4)}>Back</button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="step">
          <h2>6. Gateway Settings</h2>
          <label>Port</label>
          <input type="number" value={gatewayPort} onChange={(e) => setGatewayPort(parseInt(e.target.value))} />
          <label>Bind</label>
          <select value={gatewayBind} onChange={(e) => setGatewayBind(e.target.value)}>
            <option value="loopback">Loopback (127.0.0.1)</option>
            <option value="all">All Interfaces (0.0.0.0)</option>
          </select>
          <label>Auth Mode</label>
          <select value={gatewayAuthMode} onChange={(e) => setGatewayAuthMode(e.target.value)}>
            <option value="token">Token (Secure)</option>
            <option value="none">None (Insecure)</option>
          </select>
          <label>Tailscale</label>
          <select value={tailscaleMode} onChange={(e) => setTailscaleMode(e.target.value)}>
            <option value="off">Off</option>
            <option value="on">On (Expose via Tailscale)</option>
          </select>
          <div style={{display: "flex", gap: "10px", marginTop: "20px"}}>
            <button onClick={() => setStep(7)}>Next: Brain</button>
            <button className="secondary" onClick={() => setStep(5)}>Back</button>
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="step">
          <h2>7. Connect Brain</h2>
          <label>Provider</label>
          <select value={provider} onChange={(e) => {
            setProvider(e.target.value);
            setAuthMethod("token");
          }}>
            <option value="anthropic">Anthropic</option>
            <option value="openai">OpenAI</option>
            <option value="google">Google</option>
            <option value="openrouter">OpenRouter</option>
            <option value="ollama">Ollama (Local)</option>
            {mode === "advanced" && (
              <>
                <option value="minimax">MiniMax</option>
                <option value="moonshot">Moonshot AI (Kimi)</option>
                <option value="xai">xAI (Grok)</option>
                <option value="qwen">Qwen</option>
                <option value="z_ai">Z.AI (GLM 4.7)</option>
                <option value="qianfan">Qianfan</option>
                <option value="copilot">Copilot</option>
                <option value="deepseek">DeepSeek</option>
                <option value="venice">Venice AI</option>
              </>
            )}
          </select>
          
          <label>Authentication Method</label>
          <select value={authMethod} onChange={(e) => setAuthMethod(e.target.value)}>
            <option value="token">API Key (Standard)</option>
            {(provider === "anthropic" || provider === "openai") && (
              <option value="session">Session Cookie (Unofficial)</option>
            )}
            {provider === "google" && (
              <option value="oauth">Google Auth (Browser)</option>
            )}
          </select>

          <label>Model</label>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <optgroup label="Anthropic">
              <option value="anthropic/claude-opus-4-6">Claude Opus 4.6</option>
              <option value="anthropic/claude-opus-4-5-20260201">Claude Opus 4.5</option>
              <option value="anthropic/claude-sonnet-4-5-20250929">Claude Sonnet 4.5</option>
              <option value="anthropic/claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
              <option value="anthropic/claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
            </optgroup>
            <optgroup label="OpenAI">
              <option value="openai/gpt-4o">GPT-4o</option>
              <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
            </optgroup>
            <optgroup label="Google">
              <option value="google/gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
              <option value="google/gemini-1.5-pro-latest">Gemini 1.5 Pro</option>
            </optgroup>
          </select>

          {authMethod !== "oauth" && (
            <>
              <label>{authMethod === "session" ? "Session Cookie" : "API Key"}</label>
              <input 
                type="password" 
                placeholder="Paste here..." 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)} 
              />
            </>
          )}

          {authMethod === "oauth" && (
            <button onClick={async () => {
              setLoading(true);
              try {
                const res: string = await invoke("start_provider_auth", { provider, method: "oauth" });
                setApiKey(res);
              } catch (e) { setLogs("Auth Error: " + e); }
              setLoading(false);
            }}>Start Browser Login</button>
          )}

          <div style={{display: "flex", gap: "10px", marginTop: "20px"}}>
            <button disabled={authMethod !== "oauth" && !apiKey} onClick={() => setStep(8)}>Next: Channels</button>
            <button className="secondary" onClick={() => setStep(mode === "advanced" ? 6 : 5)}>Back</button>
          </div>
        </div>
      )}

      {/* Step 7.5 was here, removed */}

      {step === 8 && (
        <div className="step">
          <h2>8. Connect Channels</h2>
          <p>Telegram is recommended for QuickStart.</p>
          <label>Telegram Token</label>
          <input type="password" placeholder="123456:ABC-..." value={telegramToken} onChange={(e) => setTelegramToken(e.target.value)} />
          
          {mode === "advanced" && (
            <p style={{fontSize: "0.8rem", color: "#666", marginTop: "10px"}}>
              More channels (Discord, Slack, WhatsApp) can be configured after setup in the dashboard.
            </p>
          )}

          <div style={{display: "flex", gap: "10px", marginTop: "20px"}}>
            <button onClick={() => {
              if (mode === "advanced") setStep(9);
              else handleInstall();
            }} disabled={loading}>
              {mode === "advanced" ? "Next: Environment" : (loading ? "Installing..." : "Finish Setup")}
            </button>
            <button className="secondary" onClick={() => setStep(7)} disabled={loading}>Back</button>
          </div>
          
          {mode !== "advanced" && progress && <div style={{ marginTop: "10px", color: "#0084ff", fontWeight: "bold" }}>{progress}</div>}
          {mode !== "advanced" && <pre style={{maxHeight: "150px", overflow: "auto"}}>{logs}</pre>}
          {mode !== "advanced" && error && (
            <button className="error-btn" onClick={() => invoke("close_app")} style={{marginTop: "10px", backgroundColor: "#ff4d4d"}}>Exit Installation</button>
          )}
        </div>
      )}

      {step === 9 && (
        <div className="step">
          <h2>9. Node Manager</h2>
          <p>OpenClaw uses Node.js for skill execution.</p>
          <label>Preferred Node Manager</label>
          <select value={nodeManager} onChange={(e) => setNodeManager(e.target.value)}>
            <option value="npm">npm</option>
            <option value="pnpm">pnpm</option>
            <option value="bun">bun</option>
          </select>
          <div style={{display: "flex", gap: "10px", marginTop: "20px"}}>
            <button onClick={() => setStep(10)}>Next: Skills</button>
            <button className="secondary" onClick={() => setStep(8)}>Back</button>
          </div>
        </div>
      )}

      {step === 10 && (
        <div className="step">
          <h2>10. Select Skills</h2>
          <p>Enable the tools your agent can use.</p>
          <div className="skills-grid">
            {availableSkills.map(skill => (
              <div 
                key={skill.id} 
                className={`skill-item ${selectedSkills.includes(skill.id) ? "selected" : ""}`}
                onClick={() => toggleSkill(skill.id)}
              >
                <div className="skill-name">{skill.name}</div>
                <div className="skill-desc">{skill.desc}</div>
              </div>
            ))}
          </div>
          <div style={{display: "flex", gap: "10px", marginTop: "20px"}}>
            <button onClick={() => {
              setCurrentServiceIdx(0);
              setIsConfiguringService(null);
              setStep(10.5);
            }}>Next: Service Keys</button>
            <button className="secondary" onClick={() => setStep(9)}>Back</button>
          </div>
        </div>
      )}

      {step === 10.5 && (
        <div className="step">
          <h2>10.5 Service API Keys: {servicesToConfigure[currentServiceIdx].name}</h2>
          <p>Would you like to set the API key for {servicesToConfigure[currentServiceIdx].name}?</p>
          
          <div style={{display: "flex", gap: "10px", justifyContent: "center", marginBottom: "20px"}}>
            <button 
              className={isConfiguringService === true ? "selected" : "secondary"}
              onClick={() => setIsConfiguringService(true)}
            >Yes</button>
            <button 
              className={isConfiguringService === false ? "selected" : "secondary"}
              onClick={() => {
                setIsConfiguringService(false);
              }}
            >No</button>
          </div>

          {isConfiguringService === true && (
            <div className="service-auth-box" style={{textAlign: "left", background: "#fff", padding: "15px", borderRadius: "8px", border: "1px solid #ddd"}}>
              <label>{servicesToConfigure[currentServiceIdx].name} Key</label>
              <input 
                type="password" 
                placeholder={servicesToConfigure[currentServiceIdx].placeholder} 
                value={serviceKeys[servicesToConfigure[currentServiceIdx].id] || ""} 
                onChange={(e) => setServiceKeys({...serviceKeys, [servicesToConfigure[currentServiceIdx].id]: e.target.value})} 
              />
            </div>
          )}

          <div style={{display: "flex", gap: "10px", marginTop: "20px"}}>
            <button 
              disabled={isConfiguringService === null || (isConfiguringService === true && !serviceKeys[servicesToConfigure[currentServiceIdx].id])} 
              onClick={() => {
                const sid = servicesToConfigure[currentServiceIdx].id;
                const newKeys = { ...serviceKeys };
                if (!isConfiguringService) {
                  delete newKeys[sid];
                }
                setServiceKeys(newKeys);

                if (currentServiceIdx < servicesToConfigure.length - 1) {
                  setCurrentServiceIdx(currentServiceIdx + 1);
                  setIsConfiguringService(null);
                } else {
                  handleInstall();
                }
              }}
            >
              {currentServiceIdx < servicesToConfigure.length - 1 ? "Next Service" : (loading ? "Installing..." : "Finish Installation")}
            </button>
            <button className="secondary" onClick={() => {
              if (currentServiceIdx > 0) {
                setCurrentServiceIdx(currentServiceIdx - 1);
                setIsConfiguringService(serviceKeys[servicesToConfigure[currentServiceIdx - 1].id] ? true : false);
              } else {
                setStep(10);
              }
            }} disabled={loading}>Back</button>
          </div>
          {progress && <div style={{ marginTop: "10px", color: "#0084ff", fontWeight: "bold" }}>{progress}</div>}
          <pre style={{maxHeight: "150px", overflow: "auto"}}>{logs}</pre>
          {error && (
            <button className="error-btn" onClick={() => invoke("close_app")} style={{marginTop: "10px", backgroundColor: "#ff4d4d"}}>Exit Installation</button>
          )}
        </div>
      )}

      {step === 11 && (
        <div className="step">
          <h2>🎉 It's Alive!</h2>
          <p>Your agent is running on <strong>{dashboardUrl}</strong></p>

          <div className="pairing-box">
             <h3>Telegram Pairing</h3>
             <p style={{fontSize: "0.9em"}}>{pairingCode || "Message your bot to get a code."}</p>
             
             {telegramToken && (
               <div style={{display: "flex", gap: "10px", marginTop: "10px", flexDirection: "column"}}>
                 <input 
                   type="password"
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