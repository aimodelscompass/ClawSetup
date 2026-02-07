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
            { id: "anthropic.claude-3-5-sonnet-20241022-v2:0", name: "Claude 3.5 Sonnet v2 (New)", provider: "anthropic", contextWindow: 200000 },
            { id: "anthropic.claude-3-7-sonnet-20250219-v1:0", name: "Claude 3.7 Sonnet", provider: "anthropic", contextWindow: 200000 },
            { id: "anthropic.claude-3-5-haiku-20241022-v1:0", name: "Claude 3.5 Haiku", provider: "anthropic", contextWindow: 200000 },
            { id: "anthropic.claude-haiku-4-5-20251001-v1:0", name: "Claude Haiku 4.5", provider: "anthropic", contextWindow: 200000 },
            { id: "anthropic.claude-sonnet-4-5-20250929-v1:0", name: "Claude Sonnet 4.5", provider: "anthropic", contextWindow: 200000 },
            { id: "anthropic.claude-3-opus-20240229-v1:0", name: "Claude 3 Opus", provider: "anthropic", contextWindow: 200000 },
            { id: "anthropic.claude-opus-4-5-20251101-v1:0", name: "Claude Opus 4.5", provider: "anthropic", contextWindow: 200000 },
            { id: "anthropic.claude-opus-4-6-v1", name: "Claude Opus 4.6", provider: "anthropic", contextWindow: 200000 }
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
            { id: "gpt-4o", name: "GPT-4o", provider: "openai", contextWindow: 128000 },
            { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "openai", contextWindow: 128000 },
            { id: "gpt-4", name: "GPT-4", provider: "openai", contextWindow: 8192 },
            { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "openai", contextWindow: 16385 }
        ],
        authModes: [
            { mode: 'api_key', name: 'API Key', description: 'Use your OpenAI API key', envVar: 'OPENAI_API_KEY' }
        ]
    },
    {
        id: "openai-codex",
        name: "OpenAI Codex (Preview)",
        models: [
            { id: "gpt-5.1-codex", name: "GPT-5.1 Codex", provider: "openai-codex", contextWindow: 272000 },
            { id: "gpt-5.2", name: "GPT-5.2", provider: "openai-codex", contextWindow: 272000 }
        ],
        authModes: [
            { mode: 'oauth', name: 'Codex CLI OAuth', description: 'Authenticate via Codex CLI (opens browser)', cliTool: 'codex', browserAuth: true }
        ]
    },
    {
        id: "ollama",
        name: "Ollama (Local)",
        models: [
            { id: "ollama/llama3", name: "Llama 3", provider: "ollama", contextWindow: 8192 },
            { id: "ollama/mistral", name: "Mistral", provider: "ollama", contextWindow: 8192 },
            { id: "ollama/phi3", name: "Phi-3", provider: "ollama", contextWindow: 128000 },
            { id: "ollama/gemma", name: "Gemma", provider: "ollama", contextWindow: 8192 }
        ],
        authModes: [
            { mode: 'api_key', name: 'No Auth (Local)', description: 'Ollama runs locally and requires no authentication', envVar: 'OLLAMA_API_KEY' }
        ]
    },
    {
        id: "google",
        name: "Google Gemini",
        models: [
            { id: "google/gemini-pro-1.5", name: "Gemini 1.5 Pro", provider: "google", contextWindow: 2000000 },
            { id: "google/gemini-flash-1.5", name: "Gemini 1.5 Flash", provider: "google", contextWindow: 1000000 },
            { id: "gemini-3-pro", name: "Gemini 3 Pro", provider: "google", contextWindow: 1048576 },
            { id: "gemini-3-flash", name: "Gemini 3 Flash", provider: "google", contextWindow: 1048576 }
        ],
        authModes: [
            { mode: 'api_key', name: 'API Key', description: 'Use your Google AI Studio API key', envVar: 'GEMINI_API_KEY' },
            { mode: 'cli_sync', name: 'gcloud ADC', description: 'Use Google Cloud Application Default Credentials (gcloud auth application-default login)', cliTool: 'gcloud' },
            { mode: 'oauth', name: 'Gemini CLI OAuth', description: 'Authenticate via Gemini CLI (opens browser)', cliTool: 'gemini', browserAuth: true }
        ]
    },
    {
        id: "deepseek",
        name: "DeepSeek",
        models: [
            { id: "deepseek.r1-v1:0", name: "DeepSeek R1", provider: "deepseek", contextWindow: 128000 },
            { id: "deepseek.v3-v1:0", name: "DeepSeek V3", provider: "deepseek", contextWindow: 163840 }
        ],
        authModes: [
            { mode: 'api_key', name: 'API Key', description: 'Use your DeepSeek API key', envVar: 'DEEPSEEK_API_KEY' }
        ]
    },
    {
        id: "groq",
        name: "Groq",
        models: [
            { id: "groq/llama3-70b-8192", name: "Llama 3 70B", provider: "groq", contextWindow: 8192 },
            { id: "groq/mixtral-8x7b-32768", name: "Mixtral 8x7B", provider: "groq", contextWindow: 32768 }
        ],
        authModes: [
            { mode: 'api_key', name: 'API Key', description: 'Use your Groq API key', envVar: 'GROQ_API_KEY' }
        ]
    },
    {
        id: "xai",
        name: "xAI (Grok)",
        models: [
            { id: "grok-2-latest", name: "Grok 2 Latest", provider: "xai", contextWindow: 131072 },
            { id: "grok-2-vision-latest", name: "Grok 2 Vision Latest", provider: "xai", contextWindow: 8192 },
            { id: "grok-3-latest", name: "Grok 3 Latest", provider: "xai", contextWindow: 131072 },
            { id: "grok-3-mini-latest", name: "Grok 3 Mini Latest", provider: "xai", contextWindow: 131072 },
            { id: "grok-4", name: "Grok 4", provider: "xai", contextWindow: 256000 },
            { id: "grok-beta", name: "Grok Beta", provider: "xai", contextWindow: 131072 }
        ],
        authModes: [
            { mode: 'api_key', name: 'API Key', description: 'Use your xAI API key', envVar: 'XAI_API_KEY' }
        ]
    },
    {
        id: "amazon-bedrock",
        name: "Amazon Bedrock",
        models: [
            { id: "amazon.nova-pro-v1:0", name: "Nova Pro", provider: "amazon-bedrock", contextWindow: 300000 },
            { id: "amazon.nova-lite-v1:0", name: "Nova Lite", provider: "amazon-bedrock", contextWindow: 300000 },
            { id: "amazon.titan-text-express-v1", name: "Titan Text Express", provider: "amazon-bedrock", contextWindow: 8192 },
            { id: "anthropic.claude-3-5-sonnet-20240620-v1:0", name: "Claude 3.5 Sonnet (Bedrock)", provider: "amazon-bedrock", contextWindow: 200000 },
            { id: "meta.llama3-1-70b-instruct-v1:0", name: "Llama 3.1 70B (Bedrock)", provider: "amazon-bedrock", contextWindow: 128000 }
        ],
        authModes: [
            { mode: 'aws_sdk', name: 'AWS SDK (Default)', description: 'Uses AWS SDK credential chain (AWS_ACCESS_KEY_ID, AWS_PROFILE, or IAM role)' },
            { mode: 'token', name: 'AWS Bearer Token', description: 'Use AWS Bearer Token for authentication', envVar: 'AWS_BEARER_TOKEN_BEDROCK' }
        ]
    },
    {
        id: "mistral",
        name: "Mistral AI",
        models: [
            { id: "mistral-large-latest", name: "Mistral Large", provider: "mistral", contextWindow: 32768 },
            { id: "mistral-medium-latest", name: "Mistral Medium", provider: "mistral", contextWindow: 32768 },
            { id: "mistral-small-latest", name: "Mistral Small", provider: "mistral", contextWindow: 32768 },
            { id: "open-mixtral-8x22b", name: "Mixtral 8x22B", provider: "mistral", contextWindow: 65536 }
        ],
        authModes: [
            { mode: 'api_key', name: 'API Key', description: 'Use your Mistral API key', envVar: 'MISTRAL_API_KEY' }
        ]
    },
    {
        id: "zai",
        name: "Zhipu AI (GLM)",
        models: [
            { id: "glm-4.5", name: "GLM-4.5", provider: "zai", contextWindow: 131072 },
            { id: "glm-4.6", name: "GLM-4.6", provider: "zai", contextWindow: 204800 },
            { id: "glm-4.7", name: "GLM-4.7", provider: "zai", contextWindow: 204800 }
        ],
        authModes: [
            { mode: 'api_key', name: 'API Key', description: 'Use your Zhipu AI API key', envVar: 'ZAI_API_KEY' }
        ]
    },
    {
        id: "minimax",
        name: "Minimax",
        models: [
            { id: "MiniMax-M2", name: "MiniMax M2", provider: "minimax", contextWindow: 128000 },
            { id: "MiniMax-M2.1", name: "MiniMax M2.1", provider: "minimax", contextWindow: 128000 }
        ],
        authModes: [
            { mode: 'api_key', name: 'API Key', description: 'Use your MiniMax API key', envVar: 'MINIMAX_API_KEY' },
            { mode: 'oauth', name: 'MiniMax CLI OAuth', description: 'Authenticate via MiniMax CLI (opens browser)', cliTool: 'minimax', browserAuth: true }
        ]
    },
    {
        id: "openrouter",
        name: "OpenRouter",
        models: [],
        authModes: [
            { mode: 'api_key', name: 'API Key', description: 'Use your OpenRouter API key', envVar: 'OPENROUTER_API_KEY' }
        ]
    }
];

export const FLATTENED_MODELS = SUPPORTED_PROVIDERS.flatMap(p => p.models);
