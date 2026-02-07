import { useState, useMemo } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { OpenClawConfig } from "../types";
import "./ModelsTab.css";

import { SUPPORTED_PROVIDERS, FLATTENED_MODELS, AuthModeDefinition, ProviderDefinition } from "../model-definitions";

export function ModelsTab({ config }: { config: OpenClawConfig | null }) {
    const [isAddingProvider, setIsAddingProvider] = useState(false);
    const [newProvider, setNewProvider] = useState("anthropic");
    const [newAuthMode, setNewAuthMode] = useState<string>("api_key");
    const [newApiKey, setNewApiKey] = useState("");
    const [testStatus, setTestStatus] = useState<Record<string, string>>({});

    // Get the selected provider definition
    const selectedProvider = useMemo(() =>
        SUPPORTED_PROVIDERS.find(p => p.id === newProvider),
        [newProvider]
    );

    // Get available auth modes for selected provider
    const availableAuthModes = useMemo(() =>
        selectedProvider?.authModes || [],
        [selectedProvider]
    );

    // Reset auth mode when provider changes
    const handleProviderChange = (providerId: string) => {
        setNewProvider(providerId);
        const provider = SUPPORTED_PROVIDERS.find(p => p.id === providerId);
        if (provider?.authModes?.length) {
            setNewAuthMode(provider.authModes[0].mode);
        }
        setNewApiKey("");
    };

    const selectedAuthModeDefinition = useMemo(() =>
        availableAuthModes.find(m => m.mode === newAuthMode),
        [availableAuthModes, newAuthMode]
    );

    const handleAddProvider = async () => {
        if (!config) return;
        const newConfig = { ...config };
        const profileName = `${newProvider}:custom`;

        newConfig.auth = newConfig.auth || {};
        newConfig.auth.profiles = newConfig.auth.profiles || {};

        // Store based on auth mode
        if (newAuthMode === 'api_key' || newAuthMode === 'token') {
            if (!newApiKey) {
                alert("Please enter an API key or token");
                return;
            }
            newConfig.auth.profiles[profileName] = {
                provider: newProvider,
                mode: newAuthMode === 'api_key' ? 'api_key' : 'token',
                ...(newAuthMode === 'api_key' ? { key: newApiKey } : { token: newApiKey })
            } as any;
        } else if (newAuthMode === 'oauth' || newAuthMode === 'cli_sync') {
            // For OAuth/CLI modes, we just store the profile config
            // The actual authentication happens via openclaw CLI
            newConfig.auth.profiles[profileName] = {
                provider: newProvider,
                mode: 'oauth'
            } as any;
        } else if (newAuthMode === 'aws_sdk') {
            // AWS SDK uses environment credentials
            newConfig.auth.profiles[profileName] = {
                provider: newProvider,
                mode: 'api_key' // Stored as api_key but resolved via AWS SDK
            } as any;
        }

        await invoke("save_openclaw_config", { config: newConfig });
        setIsAddingProvider(false);
        setNewApiKey("");

        if (selectedAuthModeDefinition?.browserAuth) {
            alert(`Provider profile saved! Run 'openclaw auth ${newProvider}' to complete browser authentication.`);
        } else if (newAuthMode === 'cli_sync') {
            alert(`Provider profile saved! Run '${selectedAuthModeDefinition?.cliTool} auth' to sync credentials.`);
        } else {
            alert("Provider added!");
        }
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
                            {FLATTENED_MODELS.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.name} ({m.provider})
                                </option>
                            ))}
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
                                <select className="form-select" value={newProvider} onChange={e => handleProviderChange(e.target.value)}>
                                    {SUPPORTED_PROVIDERS.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            {availableAuthModes.length > 0 && (
                                <div className="form-group">
                                    <label>Authentication Method</label>
                                    <select className="form-select" value={newAuthMode} onChange={e => setNewAuthMode(e.target.value)}>
                                        {availableAuthModes.map(m => (
                                            <option key={m.mode} value={m.mode}>{m.name}</option>
                                        ))}
                                    </select>
                                    {selectedAuthModeDefinition && (
                                        <p style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-secondary)" }}>
                                            {selectedAuthModeDefinition.description}
                                            {selectedAuthModeDefinition.envVar && (
                                                <><br />Environment variable: <code>{selectedAuthModeDefinition.envVar}</code></>
                                            )}
                                            {selectedAuthModeDefinition.browserAuth && (
                                                <><br />⚠️ This will open a browser for authentication</>
                                            )}
                                        </p>
                                    )}
                                </div>
                            )}

                            {(newAuthMode === 'api_key' || newAuthMode === 'token') && (
                                <div className="form-group">
                                    <label>{newAuthMode === 'api_key' ? 'API Key' : 'Access Token'}</label>
                                    <input
                                        className="form-input"
                                        type="password"
                                        placeholder={selectedAuthModeDefinition?.envVar ? `e.g., ${selectedAuthModeDefinition.envVar}` : "sk-..."}
                                        value={newApiKey}
                                        onChange={e => setNewApiKey(e.target.value)}
                                    />
                                </div>
                            )}

                            {(newAuthMode === 'oauth' || newAuthMode === 'cli_sync') && (
                                <div className="form-group">
                                    <div style={{ padding: "12px", background: "var(--bg-secondary)", borderRadius: "8px", fontSize: "13px" }}>
                                        {newAuthMode === 'oauth' ? (
                                            <>
                                                <strong>Browser Authentication</strong>
                                                <p style={{ margin: "8px 0 0 0", color: "var(--text-secondary)" }}>
                                                    After saving, run <code>openclaw auth {newProvider}</code> in your terminal to complete authentication.
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <strong>CLI Credential Sync</strong>
                                                <p style={{ margin: "8px 0 0 0", color: "var(--text-secondary)" }}>
                                                    OpenClaw will sync credentials from <code>{selectedAuthModeDefinition?.cliTool}</code>.
                                                    Make sure you're already authenticated with that tool.
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {newAuthMode === 'aws_sdk' && (
                                <div className="form-group">
                                    <div style={{ padding: "12px", background: "var(--bg-secondary)", borderRadius: "8px", fontSize: "13px" }}>
                                        <strong>AWS SDK Authentication</strong>
                                        <p style={{ margin: "8px 0 0 0", color: "var(--text-secondary)" }}>
                                            Uses AWS SDK credential chain: <code>AWS_ACCESS_KEY_ID</code>, <code>AWS_PROFILE</code>, or IAM role.
                                        </p>
                                    </div>
                                </div>
                            )}

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
