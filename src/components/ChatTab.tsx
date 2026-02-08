import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { GatewayClient } from "../GatewayClient";
import { open } from "@tauri-apps/api/dialog";
import "./ChatTab.css";

interface ChatTabProps {
    client: GatewayClient | null;
    messages: any[];
    setMessages: Dispatch<SetStateAction<any[]>>;
    streamingMessage: string;
    setStreamingMessage: Dispatch<SetStateAction<string>>;
}

export function ChatTab({ client, messages, setMessages, streamingMessage, setStreamingMessage }: ChatTabProps) {
    const [input, setInput] = useState("");
    const [attachments, setAttachments] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!client) return;

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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamingMessage]);

    const handleSend = async () => {
        if ((!input.trim() && attachments.length === 0) || !client) return;

        const userMsg = {
            role: "user",
            content: input,
            attachments: [...attachments]
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setAttachments([]);

        try {
            await client.request("chat.send", {
                message: input,
                attachments: userMsg.attachments,
                sessionKey: "desktop-session-" + new Date().toISOString().split('T')[0],
                idempotencyKey: crypto.randomUUID()
            });
        } catch (e: any) {
            setMessages((prev) => [...prev, { role: "agent", content: "Error: " + (e.message || JSON.stringify(e)) }]);
        }
    };

    const handleAttach = async () => {
        try {
            const selected = await open({
                multiple: true,
                filters: [{
                    name: 'Files',
                    extensions: ['png', 'jpg', 'jpeg', 'pdf', 'txt', 'md']
                }]
            });

            if (selected) {
                const newFiles = Array.isArray(selected) ? selected : [selected];
                setAttachments(prev => [...prev, ...newFiles]);
            }
        } catch (e) {
            console.error("Failed to attach file", e);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const renderMessageContent = (content: string) => {
        if (!content) return null;

        // Simple parser for tool blocks
        const parts = content.split(/(<tool_code>[\s\S]*?<\/tool_code>)/g);

        return parts.map((part, index) => {
            if (part.startsWith("<tool_code>")) {
                const code = part.replace(/<\/?tool_code>/g, "").trim();
                return (
                    <details key={index} className="tool-use-block">
                        <summary>🛠️ Used a skill</summary>
                        <pre className="tool-code">{code}</pre>
                    </details>
                );
            }
            // Render formatting for regular text (basic bold/italic support could be added here)
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <div className="chat-container">
            <div className="chat-messages">
                {messages.length === 0 && (
                    <div className="empty-state">
                        <span className="empty-icon">🦞</span>
                        <h3>How can I help you today?</h3>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`message-wrapper ${m.role}`}>
                        <div className={`message-bubble ${m.role}`}>
                            {m.attachments && m.attachments.length > 0 && (
                                <div className="message-attachments">
                                    {m.attachments.map((a: string, idx: number) => (
                                        <div key={idx} className="attachment-chip">
                                            📎 {a.split('/').pop()}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="message-content">
                                {m.role === "agent" ? renderMessageContent(m.content) : m.content}
                            </div>
                        </div>
                    </div>
                ))}
                {streamingMessage && (
                    <div className="message-wrapper agent">
                        <div className="message-bubble agent">
                            {renderMessageContent(streamingMessage)}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                {attachments.length > 0 && (
                    <div className="attachments-preview">
                        {attachments.map((a, i) => (
                            <div key={i} className="attachment-preview-item">
                                <span className="attachment-name">{a.split('/').pop()}</span>
                                <button className="attachment-remove" onClick={() => removeAttachment(i)}>×</button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="input-row">
                    <button className="attach-button" onClick={handleAttach} title="Attach file">
                        📎
                    </button>
                    <input
                        className="chat-input"
                        placeholder={client ? "Type a message..." : "Connecting to gateway..."}
                        disabled={!client}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <button
                        className="send-button"
                        onClick={handleSend}
                        disabled={!client || (!input.trim() && attachments.length === 0)}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
