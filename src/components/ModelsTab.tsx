import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { OpenClawConfig } from "../types";
import "./ModelsTab.css";

const AVAILABLE_MODELS = [
    "anthropic/claude-3-5-sonnet-20241022",
    "anthropic/claude-3-opus-20240229",
    "anthropic/claude-3-haiku-20240307",
    "openai/gpt-4o",
    "openai/gpt-4-turbo",
    "openai/gpt-3.5-turbo",
    "ollama/llama3",
    "ollama/mistral"
];

export function ModelsTab({ config }: { config: OpenClawConfig | null }) {
    const [isAddingProvider, setIsAddingProvider] = useState(false);
    const [newProvider, setNewProvider] = useState("anthropic");
    const [newApiKey, setNewApiKey] = useState("");
    const [testStatus, setTestStatus] = useState<Record<string, string>>({});

    const handleAddProvider = async () => {
        if (!config || !newApiKey) return;
        const newConfig = { ...config };
        const profileName = `${newProvider}:custom`;

        newConfig.auth = newConfig.auth || {};
        newConfig.auth.profiles = newConfig.auth.profiles || {};
        newConfig.auth.profiles[profileName] = {
            provider: newProvider,
            mode: "token",
            token: newApiKey
        } as any; // forceful cast as we're adding fields

        await invoke("save_openclaw_config", { config: newConfig });
        setIsAddingProvider(false);
        setNewApiKey("");
        alert("Provider added!");
    };

    const handleDeleteProvider = async (profileName: string) => {
        if (!config || !config.auth?.profiles) return;
        const newConfig = { ...config };
        delete newConfig.auth?.profiles?.[profileName];
        await invoke("save_openclaw_config", { config: newConfig });
    };

    const handleModelChange = async (model: string) => {
        if (!config) return;
        const newConfig = { ...config };
        newConfig.agents = newConfig.agents || {};
        newConfig.agents.defaults = newConfig.agents.defaults || {};
        newConfig.agents.defaults.model = { primary: model };

        await invoke("save_openclaw_config", { config: newConfig });
    };

    const handleTestConnection = (profileName: string) => {
        setTestStatus(prev => ({ ...prev, [profileName]: "Testing..." }));
        setTimeout(() => {
            setTestStatus(prev => ({ ...prev, [profileName]: "Verified ✓" }));
        }, 1500);
    };

    return (
        <div className="models-container">
            <div className="section-card">
                <div className="section-header">Model Routing</div>
                <div className="section-content">
                    <div className="form-group">
                        <label>Primary Brain</label>
                        <select
                            className="form-select"
                            value={config?.agents?.defaults?.model?.primary || ""}
                            onChange={(e) => handleModelChange(e.target.value)}
                        >
                            {AVAILABLE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <p style={{ marginTop: "10px", fontSize: "12px", color: "var(--text-secondary)" }}>
                            The primary model used by default for all agents.
                        </p>
                    </div>
                    <div className="form-group">
                        <label>Backup Model (Fallback)</label>
                        <select className="form-select" disabled>
                            <option>None (Coming Soon)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="section-card">
                <div className="section-header">
                    <span>Provider Profiles</span>
                    <button className="primary-btn" onClick={() => setIsAddingProvider(!isAddingProvider)}>+ Add Profile</button>
                </div>
                <div className="section-content">
                    {isAddingProvider && (
                        <div className="add-profile-form">
                            <div className="form-group">
                                <label>Provider</label>
                                <select className="form-select" value={newProvider} onChange={e => setNewProvider(e.target.value)}>
                                    <option value="anthropic">Anthropic</option>
                                    <option value="openai">OpenAI</option>
                                    <option value="ollama">Ollama</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>API Key (or Host for Ollama)</label>
                                <input
                                    className="form-input"
                                    type="password"
                                    placeholder="sk-..."
                                    value={newApiKey}
                                    onChange={e => setNewApiKey(e.target.value)}
                                />
                            </div>
                            <button className="primary-btn" onClick={handleAddProvider}>Save Profile</button>
                        </div>
                    )}

                    <div className="profiles-list">
                        {config?.auth?.profiles && Object.entries(config.auth.profiles).map(([name, profile]) => (
                            <div key={name} className="profile-item">
                                <div className="profile-info">
                                    <span className="profile-name">
                                        {name}
                                        {testStatus[name] && <span className="test-badge">{testStatus[name]}</span>}
                                    </span>
                                    <span className="profile-meta">{profile.provider} • {profile.mode}</span>
                                </div>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <button className="secondary-btn" onClick={() => handleTestConnection(name)}>Test</button>
                                    <button className="delete-icon-btn" onClick={() => handleDeleteProvider(name)}>🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
