
export type Tab = "chat" | "agents" | "models" | "connect" | "system";

export interface GatewayClient {
    connect(): void;
    disconnect(): void;
    request(method: string, params?: any): Promise<any>;
    onEvent(event: string, callback: (payload: any) => void): void;
}

export interface AgentConfig {
    provider: string;
    api_key: string;
    model: string;
    user_name: string;
    agent_name: string;
    agent_vibe: string;
    telegram_token: string | null;
}

export interface OpenClawConfig {
    agents?: {
        defaults?: {
            workspace?: string;
            model?: {
                primary?: string;
            };
        };
        [key: string]: any;
    };
    auth?: {
        profiles?: {
            [key: string]: {
                provider: string;
                mode: string;
            };
        };
    };
    plugins?: {
        entries?: {
            telegram?: {
                enabled: boolean;
                token?: string;
            };
            [key: string]: any;
        };
    };
    gateway?: {
        auth?: {
            token?: string;
        };
    };
}

export interface WorkspaceFile {
    name: string;
    content: string;
}
