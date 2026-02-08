export interface ModelDefinition {
    id: string;
    name: string;
    provider: string;
    contextWindow: number;
}

/**
 * Authentication modes supported by OpenClaw providers.
 * - api_key: Traditional API key authentication
 * - oauth: Browser-based OAuth flow (refreshable tokens)
 * - token: Static bearer token (e.g., from CLI tools, not refreshable by OpenClaw)
 * - aws_sdk: AWS SDK credential chain (for Amazon Bedrock)
 * - cli_sync: Syncs credentials from external CLI tools (Claude Code, Codex, gcloud, etc.)
 */
export type AuthMode = 'api_key' | 'oauth' | 'token' | 'aws_sdk' | 'cli_sync';

export interface AuthModeDefinition {
    mode: AuthMode;
    name: string;
    description: string;
    /** Environment variable name for this auth mode, if applicable */
    envVar?: string;
    /** For cli_sync, the name of the CLI tool to sync from */
    cliTool?: string;
    /** Whether this mode opens a browser for authentication */
    browserAuth?: boolean;
}

export interface ProviderDefinition {
    id: string;
    name: string;
    models: ModelDefinition[];
    /** Supported authentication modes for this provider */
    authModes?: AuthModeDefinition[];
}

export const SUPPORTED_PROVIDERS: ProviderDefinition[] = [
    {
        id: "anthropic",
        name: "Anthropic",
        models: [
            { id: "anthropic/claude-opus-4-6", name: "Claude Opus 4.6 (Most Powerful)", provider: "anthropic", contextWindow: 200000 },
            { id: "anthropic/claude-opus-4-5-20260201", name: "Claude Opus 4.5 (Powerful)", provider: "anthropic", contextWindow: 200000 },
            { id: "anthropic/claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5 (Balanced)", provider: "anthropic", contextWindow: 200000 },
            { id: "anthropic/claude-haiku-4-5-20251001", name: "Claude Haiku 4.5 (Fast & Cheap)", provider: "anthropic", contextWindow: 200000 },
            { id: "anthropic/claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet (Latest)", provider: "anthropic", contextWindow: 200000 }
        ],
        authModes: [
            { mode: 'api_key', name: 'API Key', description: 'Use your Anthropic API key', envVar: 'ANTHROPIC_API_KEY' },
            { mode: 'oauth', name: 'Claude Code OAuth', description: 'Authenticate via Claude Code CLI (opens browser)', cliTool: 'claude', browserAuth: true },
            { mode: 'token', name: 'OAuth Token', description: 'Use an existing OAuth access token', envVar: 'ANTHROPIC_OAUTH_TOKEN' }
        ]
    },
    {
        id: "openai",
        name: "OpenAI",
        models: [
            { id: "openai/gpt-4o", name: "GPT-4o", provider: "openai", contextWindow: 128000 },
            { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", contextWindow: 128000 },
            { id: "openai/o1-preview", name: "o1 Preview", provider: "openai", contextWindow: 128000 }
        ],
        authModes: [
            { mode: 'api_key', name: 'API Key', description: 'Use your OpenAI API key', envVar: 'OPENAI_API_KEY' }
        ]
    },
    {
        id: "google",
        name: "Google",
        models: [
            { id: "google/gemini-2.0-flash-exp", name: "Gemini 2.0 Flash (Experimental)", provider: "google", contextWindow: 1000000 },
            { id: "google/gemini-1.5-pro-latest", name: "Gemini 1.5 Pro", provider: "google", contextWindow: 2000000 }
        ],
        authModes: [
            { mode: 'api_key', name: 'API Key', description: 'Use your Google AI Studio API key', envVar: 'GEMINI_API_KEY' },
            { mode: 'cli_sync', name: 'gcloud ADC', description: 'Use Google Cloud Application Default Credentials', cliTool: 'gcloud' },
            { mode: 'oauth', name: 'Gemini CLI OAuth', description: 'Authenticate via Gemini CLI (opens browser)', cliTool: 'gemini', browserAuth: true }
        ]
    },
    {
        id: "openrouter",
        name: "OpenRouter",
        models: [], // OpenRouter models are dynamic, usually fetched or user-defined
        authModes: [
            { mode: 'api_key', name: 'API Key', description: 'Use your OpenRouter API key', envVar: 'OPENROUTER_API_KEY' }
        ]
    },
    {
        id: "ollama",
        name: "Ollama (Local)",
        models: [
            { id: "ollama/llama3.2", name: "Llama 3.2", provider: "ollama", contextWindow: 8192 },
            { id: "ollama/mistral", name: "Mistral", provider: "ollama", contextWindow: 8192 }
        ],
        authModes: [
            { mode: 'api_key', name: 'No Auth (Local)', description: 'Ollama runs locally and requires no authentication', envVar: 'OLLAMA_API_KEY' }
        ]
    }
];

export const FLATTENED_MODELS = SUPPORTED_PROVIDERS.flatMap(p => p.models);
