import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { OpenClawConfig } from "../types";
import "./ConnectTab.css";

const AVAILABLE_SKILLS = [
    { id: "search", name: "Web Search", description: "Allows the agent to search the internet for information.", key: "search" },
    { id: "shell", name: "Shell Access", description: "Execute commands on the local machine.", key: "shell" },
    { id: "vision", name: "Computer Vision", description: "Analyze images and screen content.", key: "vision" },
    { id: "memory", name: "Long-term Memory", description: "Store and retrieve information across sessions.", key: "memory" }
];

export function ConnectTab({ config }: { config: OpenClawConfig | null }) {
    const [telegramToken, setTelegramToken] = useState(config?.plugins?.entries?.telegram?.token || "");

    const handleSkillToggle = async (skillKey: string, enabled: boolean) => {
        if (!config) return;
        const newConfig = { ...config };
        newConfig.plugins = newConfig.plugins || {};
        newConfig.plugins.entries = newConfig.plugins.entries || {};
        newConfig.plugins.entries[skillKey] = { enabled };

        await invoke("save_openclaw_config", { config: newConfig });
    };

    const handleSaveTelegram = async () => {
        if (!config) return;
        const newConfig = { ...config };
        newConfig.plugins = newConfig.plugins || {};
        newConfig.plugins.entries = newConfig.plugins.entries || {};
        newConfig.plugins.entries.telegram = { enabled: !!telegramToken, token: telegramToken };

        await invoke("save_openclaw_config", { config: newConfig });
        alert("Telegram configuration saved!");
    };

    const isSkillEnabled = (key: string) => {
        return config?.plugins?.entries?.[key]?.enabled || false;
    };

    return (
        <div className="connect-container">
            <div className="section-card">
                <div className="section-header">Skill Market</div>
                <div className="section-content">
                    {AVAILABLE_SKILLS.map(skill => (
                        <div key={skill.id} className="skill-toggle-group">
                            <div className="skill-info">
                                <span className="skill-name">{skill.name}</span>
                                <span className="skill-desc">{skill.description}</span>
                            </div>
                            <div
                                className="toggle-switch"
                                onClick={() => handleSkillToggle(skill.key, !isSkillEnabled(skill.key))}
                            >
                                <div className={`status-dot ${isSkillEnabled(skill.key) ? "active" : ""}`}></div>
                                <span>{isSkillEnabled(skill.key) ? "Enabled" : "Disabled"}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="section-card">
                <div className="section-header">Channels</div>
                <div className="section-content">
                    <div className="channel-config">
                        <div className="channel-item">
                            <div className="channel-header">
                                <span className="channel-title">
                                    <span className="channel-icon">✈️</span> Telegram Bot
                                </span>
                                <div className={`status-dot ${config?.plugins?.entries?.telegram?.enabled ? "active" : ""}`}></div>
                            </div>
                            <div className="form-group">
                                <label>Bot Token</label>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <input
                                        className="form-input"
                                        type="password"
                                        placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                                        value={telegramToken}
                                        onChange={(e) => setTelegramToken(e.target.value)}
                                    />
                                    <button className="primary-btn" onClick={handleSaveTelegram}>Save</button>
                                </div>
                            </div>
                        </div>

                        <div className="channel-item" style={{ opacity: 0.7 }}>
                            <div className="channel-header">
                                <span className="channel-title">
                                    <span className="channel-icon">💬</span> WhatsApp (Coming Soon)
                                </span>
                            </div>
                        </div>
                        <div className="channel-item" style={{ opacity: 0.7 }}>
                            <div className="channel-header">
                                <span className="channel-title">
                                    <span className="channel-icon">💻</span> CLI (Coming Soon)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
