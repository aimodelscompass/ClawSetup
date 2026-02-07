
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./SystemTab.css";

export function SystemTab({ logs, logEndRef }: { logs: string[], logEndRef: any }) {
    const [stats, setStats] = useState({ cpu: "0.0", mem: "0.0" });
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                // Only works on macOS/Linux with pgrep/ps installed
                const output: string = await invoke("run_openclaw_command", {
                    command: "ps -p $(pgrep -f 'openclaw gateway' | head -n 1) -o %cpu,%mem | tail -n 1"
                });
                const parts = output.trim().split(/\s+/);
                if (parts.length >= 2) {
                    setStats({ cpu: parts[0], mem: parts[1] });
                }
            } catch (e) {
                // Ignore errors if process not running
            }
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            await invoke("run_openclaw_command", { command: "npm install -g openclaw@latest" });
            alert("Update completed! Please restart the gateway.");
        } catch (e) {
            alert("Update failed: " + e);
        }
        setIsUpdating(false);
    };

    return (
        <div className="system-container">
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">CPU Usage</div>
                    <div className="stat-value">{stats.cpu}%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Memory Usage</div>
                    <div className="stat-value">{stats.mem}%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Gateway Status</div>
                    <div className="stat-value" style={{ color: "var(--status-online)", fontSize: "18px" }}>Running</div>
                </div>
            </div>

            <div className="section-card">
                <div className="section-header">
                    <span>Core System</span>
                    <button className="primary-btn" onClick={handleUpdate} disabled={isUpdating}>
                        {isUpdating ? "Updating..." : "Check for Updates"}
                    </button>
                </div>
            </div>

            <div className="section-card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div className="section-header">
                    <span>Gateway Logs</span>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button className="secondary-btn" onClick={() => invoke("control_gateway", { action: "restart" })}>Restart</button>
                        <button className="delete-icon-btn" title="Stop" onClick={() => invoke("control_gateway", { action: "stop" })}>⏹</button>
                    </div>
                </div>
                <div className="log-view">
                    {logs.map((l, i) => <div key={i}>{l}</div>)}
                    <div ref={logEndRef} />
                </div>
            </div>
        </div>
    );
}
