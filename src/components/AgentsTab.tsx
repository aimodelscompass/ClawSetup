import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { OpenClawConfig, WorkspaceFile } from "../types";
import "./AgentsTab.css";

export function AgentsTab({ files, config }: { files: WorkspaceFile[], config: OpenClawConfig | null }) {
    const [selectedAgent, setSelectedAgent] = useState("main");
    const [selectedFile, setSelectedFile] = useState<WorkspaceFile | null>(null);
    const [content, setContent] = useState("");
    const [newAgentName, setNewAgentName] = useState("");
    const [activeAgent, setActiveAgent] = useState("main"); // Simulating active agent for chat

    // Filter for personality files
    const personalityFiles = files.filter(f =>
        ["IDENTITY.md", "USER.md", "SOUL.md"].includes(f.name)
    );

    // If no file is selected, select IDENTITY.md by default if available
    useEffect(() => {
        if (!selectedFile && personalityFiles.length > 0) {
            const defaultFile = personalityFiles.find(f => f.name === "IDENTITY.md") || personalityFiles[0];
            setSelectedFile(defaultFile);
            setContent(defaultFile.content);
        }
    }, [personalityFiles, selectedFile]);

    const handleSave = async () => {
        if (!selectedFile) return;
        await invoke("save_workspace_file", { name: selectedFile.name, content });
        // Optimistically update the file content in local state if needed, 
        // but App.tsx re-fetches workspace on focus/changes usually.
        alert("Saved!");
    };

    const handleAddAgent = async () => {
        if (!newAgentName || !config) return;
        const newConfig = { ...config };
        newConfig.agents = newConfig.agents || {};
        const defaults = config.agents?.defaults || {};

        newConfig.agents[newAgentName] = {
            workspace: defaults.workspace,
            model: defaults.model
        };
        await invoke("save_openclaw_config", { config: newConfig });
        setNewAgentName("");
        setSelectedAgent(newAgentName);
    };

    const handleDeleteAgent = async (agentName: string) => {
        if (!config || agentName === "main") return;
        const newConfig = { ...config };
        if (newConfig.agents && newConfig.agents[agentName]) {
            delete newConfig.agents[agentName];
            await invoke("save_openclaw_config", { config: newConfig });
            if (selectedAgent === agentName) setSelectedAgent("main");
        }
    };

    const handleWorkspaceChange = async (newPath: string) => {
        if (!config || !selectedAgent) return;
        const newConfig = { ...config };
        if (newConfig.agents && newConfig.agents[selectedAgent]) {
            newConfig.agents[selectedAgent].workspace = newPath;
            await invoke("save_openclaw_config", { config: newConfig });
        }
    };

    const agents = config?.agents ? Object.keys(config.agents).filter(k => k !== "defaults") : ["main"];
    const currentAgentConfig = config?.agents?.[selectedAgent] || config?.agents?.defaults || {};

    return (
        <div className="agents-container">
            <div className="agents-sidebar">
                <div className="agent-list-card">
                    <div className="card-header">
                        <span>Agents</span>
                    </div>
                    <div className="list-content">
                        {agents.map(a => (
                            <div
                                key={a}
                                className={`list-item ${selectedAgent === a ? "active" : ""}`}
                                onClick={() => setSelectedAgent(a)}
                            >
                                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                    <span>🤖</span> {a}
                                    {activeAgent === a && <span style={{ fontSize: "10px", background: "var(--status-online)", color: "white", padding: "1px 4px", borderRadius: "4px" }}>Active</span>}
                                </span>
                                {a !== "main" && (
                                    <button
                                        className="delete-btn"
                                        onClick={(e) => { e.stopPropagation(); handleDeleteAgent(a); }}
                                        title="Delete Agent"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="add-agent-form">
                        <input
                            className="add-input"
                            placeholder="New Agent Name"
                            value={newAgentName}
                            onChange={e => setNewAgentName(e.target.value)}
                        />
                        <button className="action-button secondary" onClick={handleAddAgent} disabled={!newAgentName}>+</button>
                    </div>
                </div>

                <div className="file-list-card">
                    <div className="card-header">
                        <span>Personality</span>
                    </div>
                    <div className="list-content">
                        {personalityFiles.map(f => (
                            <div
                                key={f.name}
                                className={`list-item ${selectedFile?.name === f.name ? "active" : ""}`}
                                onClick={() => { setSelectedFile(f); setContent(f.content); }}
                            >
                                <span>📄 {f.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="editor-area">
                <div className="editor-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontWeight: 600 }}>{selectedFile ? selectedFile.name : "Select a file"}</span>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>for {selectedAgent}</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        {selectedAgent !== activeAgent && (
                            <button
                                className="action-button secondary"
                                onClick={() => setActiveAgent(selectedAgent)}
                            >
                                Set as Active
                            </button>
                        )}
                        <button className="action-button" onClick={handleSave}>Save Changes</button>
                    </div>
                </div>

                <div className="workspace-config">
                    <label>Workspace Path</label>
                    <input
                        className="workspace-path-input"
                        value={currentAgentConfig.workspace || ""}
                        onChange={(e) => handleWorkspaceChange(e.target.value)}
                        placeholder="/path/to/workspace"
                    />
                </div>

                {selectedFile ? (
                    <textarea
                        className="file-editor"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        spellCheck={false}
                    />
                ) : (
                    <div style={{ padding: "20px", color: "var(--text-secondary)", textAlign: "center" }}>
                        Select a personality file to edit.
                    </div>
                )}
            </div>
        </div>
    );
}
