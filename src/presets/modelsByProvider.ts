import { ModelOption } from "../types";

export const DEFAULT_MODELS: Record<string, string> = {
  "anthropic": "anthropic/claude-opus-4-6",
  "openai": "openai/gpt-5.4",
  "google": "google/gemini-3.1-pro-preview",
  "openrouter": "openrouter/anthropic/claude-opus-4.6",
  "xai": "xai/grok-4.1-fast",
  "ollama": "ollama/llama3.2",
  "lmstudio": "lmstudio/llama-3.2-3b-instruct",
  "local": "local/custom"
};

export const MODELS_BY_PROVIDER: Record<string, ModelOption[]> = {
  "anthropic": [
    {
      "value": "anthropic/claude-3-5-haiku-20241022",
      "label": "Claude Haiku 3.5",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-3-5-haiku-latest",
      "label": "Claude Haiku 3.5 (latest)",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-3-5-sonnet-20240620",
      "label": "Claude Sonnet 3.5",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-3-5-sonnet-20241022",
      "label": "Claude Sonnet 3.5 v2",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-3-7-sonnet-20250219",
      "label": "Claude Sonnet 3.7",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-3-7-sonnet-latest",
      "label": "Claude Sonnet 3.7 (latest)",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-3-haiku-20240307",
      "label": "Claude Haiku 3",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-3-opus-20240229",
      "label": "Claude Opus 3",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-3-sonnet-20240229",
      "label": "Claude Sonnet 3",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-haiku-4-5",
      "label": "Claude Haiku 4.5 (latest)",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-haiku-4-5-20251001",
      "label": "Claude Haiku 4.5",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-opus-4-0",
      "label": "Claude Opus 4 (latest)",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-opus-4-1",
      "label": "Claude Opus 4.1 (latest)",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-opus-4-1-20250805",
      "label": "Claude Opus 4.1",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-opus-4-20250514",
      "label": "Claude Opus 4",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-opus-4-5",
      "label": "Claude Opus 4.5 (latest)",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-opus-4-5-20251101",
      "label": "Claude Opus 4.5",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-opus-4-6",
      "label": "Claude Opus 4.6",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-sonnet-4-0",
      "label": "Claude Sonnet 4 (latest)",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-sonnet-4-20250514",
      "label": "Claude Sonnet 4",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-sonnet-4-5",
      "label": "Claude Sonnet 4.5 (latest)",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-sonnet-4-5-20250929",
      "label": "Claude Sonnet 4.5",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "anthropic/claude-sonnet-4-6",
      "label": "Claude Sonnet 4.6",
      "description": "Input: text+image • Ctx: 200k"
    }
  ],
  "openai": [
    {
      "value": "openai/codex-mini-latest",
      "label": "Codex Mini",
      "description": "Input: text • Ctx: 200k"
    },
    {
      "value": "openai/gpt-4",
      "label": "GPT-4",
      "description": "Input: text • Ctx: 8k"
    },
    {
      "value": "openai/gpt-4-turbo",
      "label": "GPT-4 Turbo",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openai/gpt-4.1",
      "label": "GPT-4.1",
      "description": "Input: text+image • Ctx: 1048k"
    },
    {
      "value": "openai/gpt-4.1-mini",
      "label": "GPT-4.1 mini",
      "description": "Input: text+image • Ctx: 1048k"
    },
    {
      "value": "openai/gpt-4.1-nano",
      "label": "GPT-4.1 nano",
      "description": "Input: text+image • Ctx: 1048k"
    },
    {
      "value": "openai/gpt-4o",
      "label": "GPT-4o",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openai/gpt-4o-2024-05-13",
      "label": "GPT-4o (2024-05-13)",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openai/gpt-4o-2024-08-06",
      "label": "GPT-4o (2024-08-06)",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openai/gpt-4o-2024-11-20",
      "label": "GPT-4o (2024-11-20)",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openai/gpt-4o-mini",
      "label": "GPT-4o mini",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openai/gpt-5",
      "label": "GPT-5",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openai/gpt-5-chat-latest",
      "label": "GPT-5 Chat Latest",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openai/gpt-5-codex",
      "label": "GPT-5-Codex",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openai/gpt-5-mini",
      "label": "GPT-5 Mini",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openai/gpt-5-nano",
      "label": "GPT-5 Nano",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openai/gpt-5-pro",
      "label": "GPT-5 Pro",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openai/gpt-5.1",
      "label": "GPT-5.1",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openai/gpt-5.1-chat-latest",
      "label": "GPT-5.1 Chat",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openai/gpt-5.1-codex",
      "label": "GPT-5.1 Codex",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openai/gpt-5.1-codex-max",
      "label": "GPT-5.1 Codex Max",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openai/gpt-5.1-codex-mini",
      "label": "GPT-5.1 Codex mini",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openai/gpt-5.2",
      "label": "GPT-5.2",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openai/gpt-5.2-chat-latest",
      "label": "GPT-5.2 Chat",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openai/gpt-5.2-codex",
      "label": "GPT-5.2 Codex",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openai/gpt-5.2-pro",
      "label": "GPT-5.2 Pro",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openai/gpt-5.3-codex",
      "label": "GPT-5.3 Codex",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openai/gpt-5.3-codex-spark",
      "label": "GPT-5.3 Codex Spark",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openai/gpt-5.4",
      "label": "GPT-5.4",
      "description": "Input: text+image • Ctx: 272k"
    },
    {
      "value": "openai/gpt-5.4-pro",
      "label": "GPT-5.4 Pro",
      "description": "Input: text+image • Ctx: 1050k"
    },
    {
      "value": "openai/o1",
      "label": "o1",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openai/o1-pro",
      "label": "o1-pro",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openai/o3",
      "label": "o3",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openai/o3-deep-research",
      "label": "o3-deep-research",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openai/o3-mini",
      "label": "o3-mini",
      "description": "Input: text • Ctx: 200k"
    },
    {
      "value": "openai/o3-pro",
      "label": "o3-pro",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openai/o4-mini",
      "label": "o4-mini",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openai/o4-mini-deep-research",
      "label": "o4-mini-deep-research",
      "description": "Input: text+image • Ctx: 200k"
    }
  ],
  "google": [
    {
      "value": "google/gemini-1.5-flash",
      "label": "Gemini 1.5 Flash",
      "description": "Input: text+image • Ctx: 1000k"
    },
    {
      "value": "google/gemini-1.5-flash-8b",
      "label": "Gemini 1.5 Flash-8B",
      "description": "Input: text+image • Ctx: 1000k"
    },
    {
      "value": "google/gemini-1.5-pro",
      "label": "Gemini 1.5 Pro",
      "description": "Input: text+image • Ctx: 1000k"
    },
    {
      "value": "google/gemini-2.0-flash",
      "label": "Gemini 2.0 Flash",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "google/gemini-2.0-flash-lite",
      "label": "Gemini 2.0 Flash Lite",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "google/gemini-2.5-flash",
      "label": "Gemini 2.5 Flash",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "google/gemini-2.5-flash-lite",
      "label": "Gemini 2.5 Flash Lite",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "google/gemini-2.5-flash-lite-preview-06-17",
      "label": "Gemini 2.5 Flash Lite Preview 06-17",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "google/gemini-2.5-flash-lite-preview-09-2025",
      "label": "Gemini 2.5 Flash Lite Preview 09-25",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "google/gemini-2.5-flash-preview-04-17",
      "label": "Gemini 2.5 Flash Preview 04-17",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "google/gemini-2.5-flash-preview-05-20",
      "label": "Gemini 2.5 Flash Preview 05-20",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "google/gemini-2.5-flash-preview-09-2025",
      "label": "Gemini 2.5 Flash Preview 09-25",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "google/gemini-2.5-pro",
      "label": "Gemini 2.5 Pro",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "google/gemini-2.5-pro-preview-05-06",
      "label": "Gemini 2.5 Pro Preview 05-06",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "google/gemini-2.5-pro-preview-06-05",
      "label": "Gemini 2.5 Pro Preview 06-05",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "google/gemini-3-flash-preview",
      "label": "Gemini 3 Flash Preview",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "google/gemini-3-pro-preview",
      "label": "Gemini 3 Pro Preview",
      "description": "Input: text+image • Ctx: 1000k"
    },
    {
      "value": "google/gemini-3.1-flash-lite-preview",
      "label": "Gemini 3.1 Flash Lite Preview",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "google/gemini-3.1-pro-preview",
      "label": "Gemini 3.1 Pro Preview",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "google/gemini-3.1-pro-preview-customtools",
      "label": "Gemini 3.1 Pro Preview Custom Tools",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "google/gemini-flash-latest",
      "label": "Gemini Flash Latest",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "google/gemini-flash-lite-latest",
      "label": "Gemini Flash-Lite Latest",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "google/gemini-live-2.5-flash",
      "label": "Gemini Live 2.5 Flash",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "google/gemini-live-2.5-flash-preview-native-audio",
      "label": "Gemini Live 2.5 Flash Preview Native Audio",
      "description": "Input: text • Ctx: 131k"
    }
  ],
  "openrouter": [
    {
      "value": "openrouter/ai21/jamba-large-1.7",
      "label": "AI21: Jamba Large 1.7",
      "description": "Input: text • Ctx: 256k"
    },
    {
      "value": "openrouter/alibaba/tongyi-deepresearch-30b-a3b",
      "label": "Tongyi DeepResearch 30B A3B",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/allenai/olmo-3.1-32b-instruct",
      "label": "AllenAI: Olmo 3.1 32B Instruct",
      "description": "Input: text • Ctx: 66k"
    },
    {
      "value": "openrouter/amazon/nova-2-lite-v1",
      "label": "Amazon: Nova 2 Lite",
      "description": "Input: text+image • Ctx: 1000k"
    },
    {
      "value": "openrouter/amazon/nova-lite-v1",
      "label": "Amazon: Nova Lite 1.0",
      "description": "Input: text+image • Ctx: 300k"
    },
    {
      "value": "openrouter/amazon/nova-micro-v1",
      "label": "Amazon: Nova Micro 1.0",
      "description": "Input: text • Ctx: 128k"
    },
    {
      "value": "openrouter/amazon/nova-premier-v1",
      "label": "Amazon: Nova Premier 1.0",
      "description": "Input: text+image • Ctx: 1000k"
    },
    {
      "value": "openrouter/amazon/nova-pro-v1",
      "label": "Amazon: Nova Pro 1.0",
      "description": "Input: text+image • Ctx: 300k"
    },
    {
      "value": "openrouter/anthropic/claude-3-haiku",
      "label": "Anthropic: Claude 3 Haiku",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openrouter/anthropic/claude-3.5-haiku",
      "label": "Anthropic: Claude 3.5 Haiku",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openrouter/anthropic/claude-3.5-sonnet",
      "label": "Anthropic: Claude 3.5 Sonnet",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openrouter/anthropic/claude-3.7-sonnet",
      "label": "Anthropic: Claude 3.7 Sonnet",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openrouter/anthropic/claude-3.7-sonnet:thinking",
      "label": "Anthropic: Claude 3.7 Sonnet (thinking)",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openrouter/anthropic/claude-haiku-4.5",
      "label": "Anthropic: Claude Haiku 4.5",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openrouter/anthropic/claude-opus-4",
      "label": "Anthropic: Claude Opus 4",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openrouter/anthropic/claude-opus-4.1",
      "label": "Anthropic: Claude Opus 4.1",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openrouter/anthropic/claude-opus-4.5",
      "label": "Anthropic: Claude Opus 4.5",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openrouter/anthropic/claude-opus-4.6",
      "label": "Anthropic: Claude Opus 4.6",
      "description": "Input: text+image • Ctx: 1000k"
    },
    {
      "value": "openrouter/anthropic/claude-sonnet-4",
      "label": "Anthropic: Claude Sonnet 4",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openrouter/anthropic/claude-sonnet-4.5",
      "label": "Anthropic: Claude Sonnet 4.5",
      "description": "Input: text+image • Ctx: 1000k"
    },
    {
      "value": "openrouter/anthropic/claude-sonnet-4.6",
      "label": "Anthropic: Claude Sonnet 4.6",
      "description": "Input: text+image • Ctx: 1000k"
    },
    {
      "value": "openrouter/arcee-ai/trinity-large-preview:free",
      "label": "Arcee AI: Trinity Large Preview (free)",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/arcee-ai/trinity-mini",
      "label": "Arcee AI: Trinity Mini",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/arcee-ai/trinity-mini:free",
      "label": "Arcee AI: Trinity Mini (free)",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/arcee-ai/virtuoso-large",
      "label": "Arcee AI: Virtuoso Large",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/auto",
      "label": "Auto",
      "description": "Input: text+image • Ctx: 2000k"
    },
    {
      "value": "openrouter/baidu/ernie-4.5-21b-a3b",
      "label": "Baidu: ERNIE 4.5 21B A3B",
      "description": "Input: text • Ctx: 120k"
    },
    {
      "value": "openrouter/baidu/ernie-4.5-vl-28b-a3b",
      "label": "Baidu: ERNIE 4.5 VL 28B A3B",
      "description": "Input: text+image • Ctx: 30k"
    },
    {
      "value": "openrouter/bytedance-seed/seed-1.6",
      "label": "ByteDance Seed: Seed 1.6",
      "description": "Input: text+image • Ctx: 262k"
    },
    {
      "value": "openrouter/bytedance-seed/seed-1.6-flash",
      "label": "ByteDance Seed: Seed 1.6 Flash",
      "description": "Input: text+image • Ctx: 262k"
    },
    {
      "value": "openrouter/bytedance-seed/seed-2.0-mini",
      "label": "ByteDance Seed: Seed-2.0-Mini",
      "description": "Input: text+image • Ctx: 262k"
    },
    {
      "value": "openrouter/cohere/command-r-08-2024",
      "label": "Cohere: Command R (08-2024)",
      "description": "Input: text • Ctx: 128k"
    },
    {
      "value": "openrouter/cohere/command-r-plus-08-2024",
      "label": "Cohere: Command R+ (08-2024)",
      "description": "Input: text • Ctx: 128k"
    },
    {
      "value": "openrouter/deepseek/deepseek-chat",
      "label": "DeepSeek: DeepSeek V3",
      "description": "Input: text • Ctx: 164k"
    },
    {
      "value": "openrouter/deepseek/deepseek-chat-v3-0324",
      "label": "DeepSeek: DeepSeek V3 0324",
      "description": "Input: text • Ctx: 164k"
    },
    {
      "value": "openrouter/deepseek/deepseek-chat-v3.1",
      "label": "DeepSeek: DeepSeek V3.1",
      "description": "Input: text • Ctx: 33k"
    },
    {
      "value": "openrouter/deepseek/deepseek-r1",
      "label": "DeepSeek: R1",
      "description": "Input: text • Ctx: 64k"
    },
    {
      "value": "openrouter/deepseek/deepseek-r1-0528",
      "label": "DeepSeek: R1 0528",
      "description": "Input: text • Ctx: 164k"
    },
    {
      "value": "openrouter/deepseek/deepseek-v3.1-terminus",
      "label": "DeepSeek: DeepSeek V3.1 Terminus",
      "description": "Input: text • Ctx: 164k"
    },
    {
      "value": "openrouter/deepseek/deepseek-v3.1-terminus:exacto",
      "label": "DeepSeek: DeepSeek V3.1 Terminus (exacto)",
      "description": "Input: text • Ctx: 164k"
    },
    {
      "value": "openrouter/deepseek/deepseek-v3.2",
      "label": "DeepSeek: DeepSeek V3.2",
      "description": "Input: text • Ctx: 164k"
    },
    {
      "value": "openrouter/deepseek/deepseek-v3.2-exp",
      "label": "DeepSeek: DeepSeek V3.2 Exp",
      "description": "Input: text • Ctx: 164k"
    },
    {
      "value": "openrouter/essentialai/rnj-1-instruct",
      "label": "EssentialAI: Rnj 1 Instruct",
      "description": "Input: text • Ctx: 33k"
    },
    {
      "value": "openrouter/google/gemini-2.0-flash-001",
      "label": "Google: Gemini 2.0 Flash",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "openrouter/google/gemini-2.0-flash-lite-001",
      "label": "Google: Gemini 2.0 Flash Lite",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "openrouter/google/gemini-2.5-flash",
      "label": "Google: Gemini 2.5 Flash",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "openrouter/google/gemini-2.5-flash-lite",
      "label": "Google: Gemini 2.5 Flash Lite",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "openrouter/google/gemini-2.5-flash-lite-preview-09-2025",
      "label": "Google: Gemini 2.5 Flash Lite Preview 09-2025",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "openrouter/google/gemini-2.5-pro",
      "label": "Google: Gemini 2.5 Pro",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "openrouter/google/gemini-2.5-pro-preview",
      "label": "Google: Gemini 2.5 Pro Preview 06-05",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "openrouter/google/gemini-2.5-pro-preview-05-06",
      "label": "Google: Gemini 2.5 Pro Preview 05-06",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "openrouter/google/gemini-3-flash-preview",
      "label": "Google: Gemini 3 Flash Preview",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "openrouter/google/gemini-3-pro-preview",
      "label": "Google: Gemini 3 Pro Preview",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "openrouter/google/gemini-3.1-flash-lite-preview",
      "label": "Google: Gemini 3.1 Flash Lite Preview",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "openrouter/google/gemini-3.1-pro-preview",
      "label": "Google: Gemini 3.1 Pro Preview",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "openrouter/google/gemini-3.1-pro-preview-customtools",
      "label": "Google: Gemini 3.1 Pro Preview Custom Tools",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "openrouter/google/gemma-3-27b-it",
      "label": "Google: Gemma 3 27B",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openrouter/google/gemma-3-27b-it:free",
      "label": "Google: Gemma 3 27B (free)",
      "description": "Input: text+image • Ctx: 131k"
    },
    {
      "value": "openrouter/inception/mercury",
      "label": "Inception: Mercury",
      "description": "Input: text • Ctx: 128k"
    },
    {
      "value": "openrouter/inception/mercury-2",
      "label": "Inception: Mercury 2",
      "description": "Input: text • Ctx: 128k"
    },
    {
      "value": "openrouter/inception/mercury-coder",
      "label": "Inception: Mercury Coder",
      "description": "Input: text • Ctx: 128k"
    },
    {
      "value": "openrouter/kwaipilot/kat-coder-pro",
      "label": "Kwaipilot: KAT-Coder-Pro V1",
      "description": "Input: text • Ctx: 256k"
    },
    {
      "value": "openrouter/meituan/longcat-flash-chat",
      "label": "Meituan: LongCat Flash Chat",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/meta-llama/llama-3-8b-instruct",
      "label": "Meta: Llama 3 8B Instruct",
      "description": "Input: text • Ctx: 8k"
    },
    {
      "value": "openrouter/meta-llama/llama-3.1-405b-instruct",
      "label": "Meta: Llama 3.1 405B Instruct",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/meta-llama/llama-3.1-70b-instruct",
      "label": "Meta: Llama 3.1 70B Instruct",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/meta-llama/llama-3.1-8b-instruct",
      "label": "Meta: Llama 3.1 8B Instruct",
      "description": "Input: text • Ctx: 16k"
    },
    {
      "value": "openrouter/meta-llama/llama-3.3-70b-instruct",
      "label": "Meta: Llama 3.3 70B Instruct",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/meta-llama/llama-3.3-70b-instruct:free",
      "label": "Meta: Llama 3.3 70B Instruct (free)",
      "description": "Input: text • Ctx: 128k"
    },
    {
      "value": "openrouter/meta-llama/llama-4-maverick",
      "label": "Meta: Llama 4 Maverick",
      "description": "Input: text+image • Ctx: 1049k"
    },
    {
      "value": "openrouter/meta-llama/llama-4-scout",
      "label": "Meta: Llama 4 Scout",
      "description": "Input: text+image • Ctx: 328k"
    },
    {
      "value": "openrouter/minimax/minimax-m1",
      "label": "MiniMax: MiniMax M1",
      "description": "Input: text • Ctx: 1000k"
    },
    {
      "value": "openrouter/minimax/minimax-m2",
      "label": "MiniMax: MiniMax M2",
      "description": "Input: text • Ctx: 197k"
    },
    {
      "value": "openrouter/minimax/minimax-m2.1",
      "label": "MiniMax: MiniMax M2.1",
      "description": "Input: text • Ctx: 197k"
    },
    {
      "value": "openrouter/minimax/minimax-m2.5",
      "label": "MiniMax: MiniMax M2.5",
      "description": "Input: text • Ctx: 197k"
    },
    {
      "value": "openrouter/mistralai/codestral-2508",
      "label": "Mistral: Codestral 2508",
      "description": "Input: text • Ctx: 256k"
    },
    {
      "value": "openrouter/mistralai/devstral-2512",
      "label": "Mistral: Devstral 2 2512",
      "description": "Input: text • Ctx: 262k"
    },
    {
      "value": "openrouter/mistralai/devstral-medium",
      "label": "Mistral: Devstral Medium",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/mistralai/devstral-small",
      "label": "Mistral: Devstral Small 1.1",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/mistralai/ministral-14b-2512",
      "label": "Mistral: Ministral 3 14B 2512",
      "description": "Input: text+image • Ctx: 262k"
    },
    {
      "value": "openrouter/mistralai/ministral-3b-2512",
      "label": "Mistral: Ministral 3 3B 2512",
      "description": "Input: text+image • Ctx: 131k"
    },
    {
      "value": "openrouter/mistralai/ministral-8b-2512",
      "label": "Mistral: Ministral 3 8B 2512",
      "description": "Input: text+image • Ctx: 262k"
    },
    {
      "value": "openrouter/mistralai/mistral-large",
      "label": "Mistral Large",
      "description": "Input: text • Ctx: 128k"
    },
    {
      "value": "openrouter/mistralai/mistral-large-2407",
      "label": "Mistral Large 2407",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/mistralai/mistral-large-2411",
      "label": "Mistral Large 2411",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/mistralai/mistral-large-2512",
      "label": "Mistral: Mistral Large 3 2512",
      "description": "Input: text+image • Ctx: 262k"
    },
    {
      "value": "openrouter/mistralai/mistral-medium-3",
      "label": "Mistral: Mistral Medium 3",
      "description": "Input: text+image • Ctx: 131k"
    },
    {
      "value": "openrouter/mistralai/mistral-medium-3.1",
      "label": "Mistral: Mistral Medium 3.1",
      "description": "Input: text+image • Ctx: 131k"
    },
    {
      "value": "openrouter/mistralai/mistral-nemo",
      "label": "Mistral: Mistral Nemo",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/mistralai/mistral-saba",
      "label": "Mistral: Saba",
      "description": "Input: text • Ctx: 33k"
    },
    {
      "value": "openrouter/mistralai/mistral-small-24b-instruct-2501",
      "label": "Mistral: Mistral Small 3",
      "description": "Input: text • Ctx: 33k"
    },
    {
      "value": "openrouter/mistralai/mistral-small-3.1-24b-instruct:free",
      "label": "Mistral: Mistral Small 3.1 24B (free)",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openrouter/mistralai/mistral-small-3.2-24b-instruct",
      "label": "Mistral: Mistral Small 3.2 24B",
      "description": "Input: text+image • Ctx: 131k"
    },
    {
      "value": "openrouter/mistralai/mistral-small-creative",
      "label": "Mistral: Mistral Small Creative",
      "description": "Input: text • Ctx: 33k"
    },
    {
      "value": "openrouter/mistralai/mixtral-8x22b-instruct",
      "label": "Mistral: Mixtral 8x22B Instruct",
      "description": "Input: text • Ctx: 66k"
    },
    {
      "value": "openrouter/mistralai/mixtral-8x7b-instruct",
      "label": "Mistral: Mixtral 8x7B Instruct",
      "description": "Input: text • Ctx: 33k"
    },
    {
      "value": "openrouter/mistralai/pixtral-large-2411",
      "label": "Mistral: Pixtral Large 2411",
      "description": "Input: text+image • Ctx: 131k"
    },
    {
      "value": "openrouter/mistralai/voxtral-small-24b-2507",
      "label": "Mistral: Voxtral Small 24B 2507",
      "description": "Input: text • Ctx: 32k"
    },
    {
      "value": "openrouter/moonshotai/kimi-k2",
      "label": "MoonshotAI: Kimi K2 0711",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/moonshotai/kimi-k2-0905",
      "label": "MoonshotAI: Kimi K2 0905",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/moonshotai/kimi-k2-0905:exacto",
      "label": "MoonshotAI: Kimi K2 0905 (exacto)",
      "description": "Input: text • Ctx: 262k"
    },
    {
      "value": "openrouter/moonshotai/kimi-k2-thinking",
      "label": "MoonshotAI: Kimi K2 Thinking",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/moonshotai/kimi-k2.5",
      "label": "MoonshotAI: Kimi K2.5",
      "description": "Input: text+image • Ctx: 262k"
    },
    {
      "value": "openrouter/nex-agi/deepseek-v3.1-nex-n1",
      "label": "Nex AGI: DeepSeek V3.1 Nex N1",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/nvidia/llama-3.1-nemotron-70b-instruct",
      "label": "NVIDIA: Llama 3.1 Nemotron 70B Instruct",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/nvidia/llama-3.3-nemotron-super-49b-v1.5",
      "label": "NVIDIA: Llama 3.3 Nemotron Super 49B V1.5",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/nvidia/nemotron-3-nano-30b-a3b",
      "label": "NVIDIA: Nemotron 3 Nano 30B A3B",
      "description": "Input: text • Ctx: 262k"
    },
    {
      "value": "openrouter/nvidia/nemotron-3-nano-30b-a3b:free",
      "label": "NVIDIA: Nemotron 3 Nano 30B A3B (free)",
      "description": "Input: text • Ctx: 256k"
    },
    {
      "value": "openrouter/nvidia/nemotron-nano-12b-v2-vl:free",
      "label": "NVIDIA: Nemotron Nano 12B 2 VL (free)",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openrouter/nvidia/nemotron-nano-9b-v2",
      "label": "NVIDIA: Nemotron Nano 9B V2",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/nvidia/nemotron-nano-9b-v2:free",
      "label": "NVIDIA: Nemotron Nano 9B V2 (free)",
      "description": "Input: text • Ctx: 128k"
    },
    {
      "value": "openrouter/openai/gpt-3.5-turbo",
      "label": "OpenAI: GPT-3.5 Turbo",
      "description": "Input: text • Ctx: 16k"
    },
    {
      "value": "openrouter/openai/gpt-3.5-turbo-0613",
      "label": "OpenAI: GPT-3.5 Turbo (older v0613)",
      "description": "Input: text • Ctx: 4k"
    },
    {
      "value": "openrouter/openai/gpt-3.5-turbo-16k",
      "label": "OpenAI: GPT-3.5 Turbo 16k",
      "description": "Input: text • Ctx: 16k"
    },
    {
      "value": "openrouter/openai/gpt-4",
      "label": "OpenAI: GPT-4",
      "description": "Input: text • Ctx: 8k"
    },
    {
      "value": "openrouter/openai/gpt-4-0314",
      "label": "OpenAI: GPT-4 (older v0314)",
      "description": "Input: text • Ctx: 8k"
    },
    {
      "value": "openrouter/openai/gpt-4-1106-preview",
      "label": "OpenAI: GPT-4 Turbo (older v1106)",
      "description": "Input: text • Ctx: 128k"
    },
    {
      "value": "openrouter/openai/gpt-4-turbo",
      "label": "OpenAI: GPT-4 Turbo",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openrouter/openai/gpt-4-turbo-preview",
      "label": "OpenAI: GPT-4 Turbo Preview",
      "description": "Input: text • Ctx: 128k"
    },
    {
      "value": "openrouter/openai/gpt-4.1",
      "label": "OpenAI: GPT-4.1",
      "description": "Input: text+image • Ctx: 1048k"
    },
    {
      "value": "openrouter/openai/gpt-4.1-mini",
      "label": "OpenAI: GPT-4.1 Mini",
      "description": "Input: text+image • Ctx: 1048k"
    },
    {
      "value": "openrouter/openai/gpt-4.1-nano",
      "label": "OpenAI: GPT-4.1 Nano",
      "description": "Input: text+image • Ctx: 1048k"
    },
    {
      "value": "openrouter/openai/gpt-4o",
      "label": "OpenAI: GPT-4o",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openrouter/openai/gpt-4o-2024-05-13",
      "label": "OpenAI: GPT-4o (2024-05-13)",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openrouter/openai/gpt-4o-2024-08-06",
      "label": "OpenAI: GPT-4o (2024-08-06)",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openrouter/openai/gpt-4o-2024-11-20",
      "label": "OpenAI: GPT-4o (2024-11-20)",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openrouter/openai/gpt-4o-audio-preview",
      "label": "OpenAI: GPT-4o Audio",
      "description": "Input: text • Ctx: 128k"
    },
    {
      "value": "openrouter/openai/gpt-4o-mini",
      "label": "OpenAI: GPT-4o-mini",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openrouter/openai/gpt-4o-mini-2024-07-18",
      "label": "OpenAI: GPT-4o-mini (2024-07-18)",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openrouter/openai/gpt-4o:extended",
      "label": "OpenAI: GPT-4o (extended)",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openrouter/openai/gpt-5",
      "label": "OpenAI: GPT-5",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openrouter/openai/gpt-5-codex",
      "label": "OpenAI: GPT-5 Codex",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openrouter/openai/gpt-5-image",
      "label": "OpenAI: GPT-5 Image",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openrouter/openai/gpt-5-image-mini",
      "label": "OpenAI: GPT-5 Image Mini",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openrouter/openai/gpt-5-mini",
      "label": "OpenAI: GPT-5 Mini",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openrouter/openai/gpt-5-nano",
      "label": "OpenAI: GPT-5 Nano",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openrouter/openai/gpt-5-pro",
      "label": "OpenAI: GPT-5 Pro",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openrouter/openai/gpt-5.1",
      "label": "OpenAI: GPT-5.1",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openrouter/openai/gpt-5.1-chat",
      "label": "OpenAI: GPT-5.1 Chat",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openrouter/openai/gpt-5.1-codex",
      "label": "OpenAI: GPT-5.1-Codex",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openrouter/openai/gpt-5.1-codex-max",
      "label": "OpenAI: GPT-5.1-Codex-Max",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openrouter/openai/gpt-5.1-codex-mini",
      "label": "OpenAI: GPT-5.1-Codex-Mini",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openrouter/openai/gpt-5.2",
      "label": "OpenAI: GPT-5.2",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openrouter/openai/gpt-5.2-chat",
      "label": "OpenAI: GPT-5.2 Chat",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openrouter/openai/gpt-5.2-codex",
      "label": "OpenAI: GPT-5.2-Codex",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openrouter/openai/gpt-5.2-pro",
      "label": "OpenAI: GPT-5.2 Pro",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openrouter/openai/gpt-5.3-chat",
      "label": "OpenAI: GPT-5.3 Chat",
      "description": "Input: text+image • Ctx: 128k"
    },
    {
      "value": "openrouter/openai/gpt-5.3-codex",
      "label": "OpenAI: GPT-5.3-Codex",
      "description": "Input: text+image • Ctx: 400k"
    },
    {
      "value": "openrouter/openai/gpt-5.4",
      "label": "OpenAI: GPT-5.4",
      "description": "Input: text+image • Ctx: 1050k"
    },
    {
      "value": "openrouter/openai/gpt-5.4-pro",
      "label": "OpenAI: GPT-5.4 Pro",
      "description": "Input: text+image • Ctx: 1050k"
    },
    {
      "value": "openrouter/openai/gpt-oss-120b",
      "label": "OpenAI: gpt-oss-120b",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/openai/gpt-oss-120b:exacto",
      "label": "OpenAI: gpt-oss-120b (exacto)",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/openai/gpt-oss-120b:free",
      "label": "OpenAI: gpt-oss-120b (free)",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/openai/gpt-oss-20b",
      "label": "OpenAI: gpt-oss-20b",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/openai/gpt-oss-20b:free",
      "label": "OpenAI: gpt-oss-20b (free)",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/openai/gpt-oss-safeguard-20b",
      "label": "OpenAI: gpt-oss-safeguard-20b",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/openai/o1",
      "label": "OpenAI: o1",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openrouter/openai/o3",
      "label": "OpenAI: o3",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openrouter/openai/o3-deep-research",
      "label": "OpenAI: o3 Deep Research",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openrouter/openai/o3-mini",
      "label": "OpenAI: o3 Mini",
      "description": "Input: text • Ctx: 200k"
    },
    {
      "value": "openrouter/openai/o3-mini-high",
      "label": "OpenAI: o3 Mini High",
      "description": "Input: text • Ctx: 200k"
    },
    {
      "value": "openrouter/openai/o3-pro",
      "label": "OpenAI: o3 Pro",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openrouter/openai/o4-mini",
      "label": "OpenAI: o4 Mini",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openrouter/openai/o4-mini-deep-research",
      "label": "OpenAI: o4 Mini Deep Research",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openrouter/openai/o4-mini-high",
      "label": "OpenAI: o4 Mini High",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openrouter/openrouter/auto",
      "label": "Auto Router",
      "description": "Input: text+image • Ctx: 2000k"
    },
    {
      "value": "openrouter/openrouter/free",
      "label": "Free Models Router",
      "description": "Input: text+image • Ctx: 200k"
    },
    {
      "value": "openrouter/prime-intellect/intellect-3",
      "label": "Prime Intellect: INTELLECT-3",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/qwen/qwen-2.5-72b-instruct",
      "label": "Qwen2.5 72B Instruct",
      "description": "Input: text • Ctx: 33k"
    },
    {
      "value": "openrouter/qwen/qwen-2.5-7b-instruct",
      "label": "Qwen: Qwen2.5 7B Instruct",
      "description": "Input: text • Ctx: 33k"
    },
    {
      "value": "openrouter/qwen/qwen-max",
      "label": "Qwen: Qwen-Max ",
      "description": "Input: text • Ctx: 33k"
    },
    {
      "value": "openrouter/qwen/qwen-plus",
      "label": "Qwen: Qwen-Plus",
      "description": "Input: text • Ctx: 1000k"
    },
    {
      "value": "openrouter/qwen/qwen-plus-2025-07-28",
      "label": "Qwen: Qwen Plus 0728",
      "description": "Input: text • Ctx: 1000k"
    },
    {
      "value": "openrouter/qwen/qwen-plus-2025-07-28:thinking",
      "label": "Qwen: Qwen Plus 0728 (thinking)",
      "description": "Input: text • Ctx: 1000k"
    },
    {
      "value": "openrouter/qwen/qwen-turbo",
      "label": "Qwen: Qwen-Turbo",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/qwen/qwen-vl-max",
      "label": "Qwen: Qwen VL Max",
      "description": "Input: text+image • Ctx: 131k"
    },
    {
      "value": "openrouter/qwen/qwen3-14b",
      "label": "Qwen: Qwen3 14B",
      "description": "Input: text • Ctx: 41k"
    },
    {
      "value": "openrouter/qwen/qwen3-235b-a22b",
      "label": "Qwen: Qwen3 235B A22B",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/qwen/qwen3-235b-a22b-2507",
      "label": "Qwen: Qwen3 235B A22B Instruct 2507",
      "description": "Input: text • Ctx: 262k"
    },
    {
      "value": "openrouter/qwen/qwen3-235b-a22b-thinking-2507",
      "label": "Qwen: Qwen3 235B A22B Thinking 2507",
      "description": "Input: text • Ctx: 262k"
    },
    {
      "value": "openrouter/qwen/qwen3-30b-a3b",
      "label": "Qwen: Qwen3 30B A3B",
      "description": "Input: text • Ctx: 41k"
    },
    {
      "value": "openrouter/qwen/qwen3-30b-a3b-instruct-2507",
      "label": "Qwen: Qwen3 30B A3B Instruct 2507",
      "description": "Input: text • Ctx: 262k"
    },
    {
      "value": "openrouter/qwen/qwen3-30b-a3b-thinking-2507",
      "label": "Qwen: Qwen3 30B A3B Thinking 2507",
      "description": "Input: text • Ctx: 33k"
    },
    {
      "value": "openrouter/qwen/qwen3-32b",
      "label": "Qwen: Qwen3 32B",
      "description": "Input: text • Ctx: 41k"
    },
    {
      "value": "openrouter/qwen/qwen3-4b:free",
      "label": "Qwen: Qwen3 4B (free)",
      "description": "Input: text • Ctx: 41k"
    },
    {
      "value": "openrouter/qwen/qwen3-8b",
      "label": "Qwen: Qwen3 8B",
      "description": "Input: text • Ctx: 41k"
    },
    {
      "value": "openrouter/qwen/qwen3-coder",
      "label": "Qwen: Qwen3 Coder 480B A35B",
      "description": "Input: text • Ctx: 262k"
    },
    {
      "value": "openrouter/qwen/qwen3-coder-30b-a3b-instruct",
      "label": "Qwen: Qwen3 Coder 30B A3B Instruct",
      "description": "Input: text • Ctx: 160k"
    },
    {
      "value": "openrouter/qwen/qwen3-coder-flash",
      "label": "Qwen: Qwen3 Coder Flash",
      "description": "Input: text • Ctx: 1000k"
    },
    {
      "value": "openrouter/qwen/qwen3-coder-next",
      "label": "Qwen: Qwen3 Coder Next",
      "description": "Input: text • Ctx: 262k"
    },
    {
      "value": "openrouter/qwen/qwen3-coder-plus",
      "label": "Qwen: Qwen3 Coder Plus",
      "description": "Input: text • Ctx: 1000k"
    },
    {
      "value": "openrouter/qwen/qwen3-coder:exacto",
      "label": "Qwen: Qwen3 Coder 480B A35B (exacto)",
      "description": "Input: text • Ctx: 262k"
    },
    {
      "value": "openrouter/qwen/qwen3-coder:free",
      "label": "Qwen: Qwen3 Coder 480B A35B (free)",
      "description": "Input: text • Ctx: 262k"
    },
    {
      "value": "openrouter/qwen/qwen3-max",
      "label": "Qwen: Qwen3 Max",
      "description": "Input: text • Ctx: 262k"
    },
    {
      "value": "openrouter/qwen/qwen3-max-thinking",
      "label": "Qwen: Qwen3 Max Thinking",
      "description": "Input: text • Ctx: 262k"
    },
    {
      "value": "openrouter/qwen/qwen3-next-80b-a3b-instruct",
      "label": "Qwen: Qwen3 Next 80B A3B Instruct",
      "description": "Input: text • Ctx: 262k"
    },
    {
      "value": "openrouter/qwen/qwen3-next-80b-a3b-instruct:free",
      "label": "Qwen: Qwen3 Next 80B A3B Instruct (free)",
      "description": "Input: text • Ctx: 262k"
    },
    {
      "value": "openrouter/qwen/qwen3-next-80b-a3b-thinking",
      "label": "Qwen: Qwen3 Next 80B A3B Thinking",
      "description": "Input: text • Ctx: 128k"
    },
    {
      "value": "openrouter/qwen/qwen3-vl-235b-a22b-instruct",
      "label": "Qwen: Qwen3 VL 235B A22B Instruct",
      "description": "Input: text+image • Ctx: 262k"
    },
    {
      "value": "openrouter/qwen/qwen3-vl-235b-a22b-thinking",
      "label": "Qwen: Qwen3 VL 235B A22B Thinking",
      "description": "Input: text+image • Ctx: 131k"
    },
    {
      "value": "openrouter/qwen/qwen3-vl-30b-a3b-instruct",
      "label": "Qwen: Qwen3 VL 30B A3B Instruct",
      "description": "Input: text+image • Ctx: 131k"
    },
    {
      "value": "openrouter/qwen/qwen3-vl-30b-a3b-thinking",
      "label": "Qwen: Qwen3 VL 30B A3B Thinking",
      "description": "Input: text+image • Ctx: 131k"
    },
    {
      "value": "openrouter/qwen/qwen3-vl-32b-instruct",
      "label": "Qwen: Qwen3 VL 32B Instruct",
      "description": "Input: text+image • Ctx: 131k"
    },
    {
      "value": "openrouter/qwen/qwen3-vl-8b-instruct",
      "label": "Qwen: Qwen3 VL 8B Instruct",
      "description": "Input: text+image • Ctx: 131k"
    },
    {
      "value": "openrouter/qwen/qwen3-vl-8b-thinking",
      "label": "Qwen: Qwen3 VL 8B Thinking",
      "description": "Input: text+image • Ctx: 131k"
    },
    {
      "value": "openrouter/qwen/qwen3.5-122b-a10b",
      "label": "Qwen: Qwen3.5-122B-A10B",
      "description": "Input: text+image • Ctx: 262k"
    },
    {
      "value": "openrouter/qwen/qwen3.5-27b",
      "label": "Qwen: Qwen3.5-27B",
      "description": "Input: text+image • Ctx: 262k"
    },
    {
      "value": "openrouter/qwen/qwen3.5-35b-a3b",
      "label": "Qwen: Qwen3.5-35B-A3B",
      "description": "Input: text+image • Ctx: 262k"
    },
    {
      "value": "openrouter/qwen/qwen3.5-397b-a17b",
      "label": "Qwen: Qwen3.5 397B A17B",
      "description": "Input: text+image • Ctx: 262k"
    },
    {
      "value": "openrouter/qwen/qwen3.5-flash-02-23",
      "label": "Qwen: Qwen3.5-Flash",
      "description": "Input: text+image • Ctx: 1000k"
    },
    {
      "value": "openrouter/qwen/qwen3.5-plus-02-15",
      "label": "Qwen: Qwen3.5 Plus 2026-02-15",
      "description": "Input: text+image • Ctx: 1000k"
    },
    {
      "value": "openrouter/qwen/qwq-32b",
      "label": "Qwen: QwQ 32B",
      "description": "Input: text • Ctx: 33k"
    },
    {
      "value": "openrouter/relace/relace-search",
      "label": "Relace: Relace Search",
      "description": "Input: text • Ctx: 256k"
    },
    {
      "value": "openrouter/sao10k/l3-euryale-70b",
      "label": "Sao10k: Llama 3 Euryale 70B v2.1",
      "description": "Input: text • Ctx: 8k"
    },
    {
      "value": "openrouter/sao10k/l3.1-euryale-70b",
      "label": "Sao10K: Llama 3.1 Euryale 70B v2.2",
      "description": "Input: text • Ctx: 33k"
    },
    {
      "value": "openrouter/stepfun/step-3.5-flash",
      "label": "StepFun: Step 3.5 Flash",
      "description": "Input: text • Ctx: 256k"
    },
    {
      "value": "openrouter/stepfun/step-3.5-flash:free",
      "label": "StepFun: Step 3.5 Flash (free)",
      "description": "Input: text • Ctx: 256k"
    },
    {
      "value": "openrouter/thedrummer/rocinante-12b",
      "label": "TheDrummer: Rocinante 12B",
      "description": "Input: text • Ctx: 33k"
    },
    {
      "value": "openrouter/thedrummer/unslopnemo-12b",
      "label": "TheDrummer: UnslopNemo 12B",
      "description": "Input: text • Ctx: 33k"
    },
    {
      "value": "openrouter/tngtech/deepseek-r1t2-chimera",
      "label": "TNG: DeepSeek R1T2 Chimera",
      "description": "Input: text • Ctx: 164k"
    },
    {
      "value": "openrouter/upstage/solar-pro-3",
      "label": "Upstage: Solar Pro 3",
      "description": "Input: text • Ctx: 128k"
    },
    {
      "value": "openrouter/x-ai/grok-3",
      "label": "xAI: Grok 3",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/x-ai/grok-3-beta",
      "label": "xAI: Grok 3 Beta",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/x-ai/grok-3-mini",
      "label": "xAI: Grok 3 Mini",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/x-ai/grok-3-mini-beta",
      "label": "xAI: Grok 3 Mini Beta",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/x-ai/grok-4",
      "label": "xAI: Grok 4",
      "description": "Input: text+image • Ctx: 256k"
    },
    {
      "value": "openrouter/x-ai/grok-4-fast",
      "label": "xAI: Grok 4 Fast",
      "description": "Input: text+image • Ctx: 2000k"
    },
    {
      "value": "openrouter/x-ai/grok-4.1-fast",
      "label": "xAI: Grok 4.1 Fast",
      "description": "Input: text+image • Ctx: 2000k"
    },
    {
      "value": "openrouter/x-ai/grok-code-fast-1",
      "label": "xAI: Grok Code Fast 1",
      "description": "Input: text • Ctx: 256k"
    },
    {
      "value": "openrouter/xiaomi/mimo-v2-flash",
      "label": "Xiaomi: MiMo-V2-Flash",
      "description": "Input: text • Ctx: 262k"
    },
    {
      "value": "openrouter/z-ai/glm-4-32b",
      "label": "Z.ai: GLM 4 32B ",
      "description": "Input: text • Ctx: 128k"
    },
    {
      "value": "openrouter/z-ai/glm-4.5",
      "label": "Z.ai: GLM 4.5",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/z-ai/glm-4.5-air",
      "label": "Z.ai: GLM 4.5 Air",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/z-ai/glm-4.5-air:free",
      "label": "Z.ai: GLM 4.5 Air (free)",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "openrouter/z-ai/glm-4.5v",
      "label": "Z.ai: GLM 4.5V",
      "description": "Input: text+image • Ctx: 66k"
    },
    {
      "value": "openrouter/z-ai/glm-4.6",
      "label": "Z.ai: GLM 4.6",
      "description": "Input: text • Ctx: 205k"
    },
    {
      "value": "openrouter/z-ai/glm-4.6:exacto",
      "label": "Z.ai: GLM 4.6 (exacto)",
      "description": "Input: text • Ctx: 205k"
    },
    {
      "value": "openrouter/z-ai/glm-4.6v",
      "label": "Z.ai: GLM 4.6V",
      "description": "Input: text+image • Ctx: 131k"
    },
    {
      "value": "openrouter/z-ai/glm-4.7",
      "label": "Z.ai: GLM 4.7",
      "description": "Input: text • Ctx: 203k"
    },
    {
      "value": "openrouter/z-ai/glm-4.7-flash",
      "label": "Z.ai: GLM 4.7 Flash",
      "description": "Input: text • Ctx: 203k"
    },
    {
      "value": "openrouter/z-ai/glm-5",
      "label": "Z.ai: GLM 5",
      "description": "Input: text • Ctx: 203k"
    }
  ],
  "xai": [
    {
      "value": "xai/grok-2",
      "label": "Grok 2",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "xai/grok-2-1212",
      "label": "Grok 2 (1212)",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "xai/grok-2-latest",
      "label": "Grok 2 Latest",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "xai/grok-2-vision",
      "label": "Grok 2 Vision",
      "description": "Input: text+image • Ctx: 8k"
    },
    {
      "value": "xai/grok-2-vision-1212",
      "label": "Grok 2 Vision (1212)",
      "description": "Input: text+image • Ctx: 8k"
    },
    {
      "value": "xai/grok-2-vision-latest",
      "label": "Grok 2 Vision Latest",
      "description": "Input: text+image • Ctx: 8k"
    },
    {
      "value": "xai/grok-3",
      "label": "Grok 3",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "xai/grok-3-fast",
      "label": "Grok 3 Fast",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "xai/grok-3-fast-latest",
      "label": "Grok 3 Fast Latest",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "xai/grok-3-latest",
      "label": "Grok 3 Latest",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "xai/grok-3-mini",
      "label": "Grok 3 Mini",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "xai/grok-3-mini-fast",
      "label": "Grok 3 Mini Fast",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "xai/grok-3-mini-fast-latest",
      "label": "Grok 3 Mini Fast Latest",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "xai/grok-3-mini-latest",
      "label": "Grok 3 Mini Latest",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "xai/grok-4",
      "label": "Grok 4",
      "description": "Input: text • Ctx: 256k"
    },
    {
      "value": "xai/grok-4-1-fast",
      "label": "Grok 4.1 Fast",
      "description": "Input: text+image • Ctx: 2000k"
    },
    {
      "value": "xai/grok-4-1-fast-non-reasoning",
      "label": "Grok 4.1 Fast (Non-Reasoning)",
      "description": "Input: text+image • Ctx: 2000k"
    },
    {
      "value": "xai/grok-4-fast",
      "label": "Grok 4 Fast",
      "description": "Input: text+image • Ctx: 2000k"
    },
    {
      "value": "xai/grok-4-fast-non-reasoning",
      "label": "Grok 4 Fast (Non-Reasoning)",
      "description": "Input: text+image • Ctx: 2000k"
    },
    {
      "value": "xai/grok-beta",
      "label": "Grok Beta",
      "description": "Input: text • Ctx: 131k"
    },
    {
      "value": "xai/grok-code-fast-1",
      "label": "Grok Code Fast 1",
      "description": "Input: text • Ctx: 256k"
    },
    {
      "value": "xai/grok-vision-beta",
      "label": "Grok Vision Beta",
      "description": "Input: text+image • Ctx: 8k"
    }
  ],
  "ollama": [
    {
      "value": "ollama/llama3.2",
      "label": "Llama 3.2",
      "description": "Local • Ollama"
    },
    {
      "value": "ollama/llama3.1",
      "label": "Llama 3.1",
      "description": "Local • Ollama"
    },
    {
      "value": "ollama/qwen2.5-coder",
      "label": "Qwen 2.5 Coder",
      "description": "Local • Ollama"
    },
    {
      "value": "ollama/codellama",
      "label": "Code Llama",
      "description": "Local • Ollama"
    },
    {
      "value": "ollama/mistral",
      "label": "Mistral",
      "description": "Local • Ollama"
    },
    {
      "value": "ollama/gemma2",
      "label": "Gemma 2",
      "description": "Local • Ollama"
    },
    {
      "value": "ollama/deepseek-coder-v2",
      "label": "DeepSeek Coder V2",
      "description": "Local • Ollama"
    },
    {
      "value": "ollama/phi4",
      "label": "Phi-4",
      "description": "Local • Ollama"
    },
    {
      "value": "ollama/llava",
      "label": "LLaVA",
      "description": "Local • Ollama"
    },
    {
      "value": "ollama/moondream",
      "label": "Moondream",
      "description": "Local • Ollama"
    }
  ],
  "lmstudio": [
    {
      "value": "lmstudio/llama-3.2-3b-instruct",
      "label": "Llama 3.2 3B Instruct",
      "description": "Local • LM Studio"
    },
    {
      "value": "lmstudio/mistral-7b-instruct",
      "label": "Mistral 7B Instruct",
      "description": "Local • LM Studio"
    },
    {
      "value": "lmstudio/phi-3-mini-4k-instruct",
      "label": "Phi-3 Mini 4K Instruct",
      "description": "Local • LM Studio"
    },
    {
      "value": "lmstudio/qwen2.5-7b-instruct",
      "label": "Qwen 2.5 7B Instruct",
      "description": "Local • LM Studio"
    },
    {
      "value": "lmstudio/gemma-2-9b-it",
      "label": "Gemma 2 9B IT",
      "description": "Local • LM Studio"
    }
  ],
  "local": [
    {
      "value": "local/custom",
      "label": "Custom Model",
      "description": "OpenAI-compatible local endpoint"
    }
  ]
};

export const PROVIDER_LOGOS: Record<string, string> = {
  "anthropic": "/images/anthropic.svg",
  "openai": "/images/openai.svg",
  "google": "/images/google.svg",
  "openrouter": "/images/openrouter.svg",
  "ollama": "/images/ollama.svg",
  "amazon-bedrock": "/images/aws.svg",
  "azure-openai-responses": "/images/azure.svg",
  "cerebras": "/images/cerebras.svg",
  "github-copilot": "/images/github.svg",
  "google-antigravity": "/images/google.svg",
  "google-gemini-cli": "/images/google.svg",
  "groq": "/images/groq.svg",
  "huggingface": "/images/huggingface.svg",
  "kimi-coding": "/images/moonshot.svg",
  "minimax": "/images/minimax.svg",
  "mistral": "/images/mistral.svg",
  "openai-codex": "/images/openai.svg",
  "opencode": "/images/code.svg",
  "vercel-ai-gateway": "/images/vercel.svg",
  "xai": "/images/grok.svg",
  "zai": "/images/zhipu.svg",
  "lmstudio": "/images/code.svg",
  "local": "/images/code.svg"
};

export const EMOJI_OPTIONS = ["🦞","🤖","🧠","⚡","🔮","🦉","🦊","🐯","🦁","🦄","👽","👾","🐉","🦕","🦍","🐕","🐈","🐙","🍄","🌎"];

export const SKILL_ICONS: Record<string, string> = {
  "1password": "/images/1password.svg",
  "apple-notes": "/images/apple-notes.svg",
  "apple-reminders": "/images/checklist.svg",
  "bear-notes": "/images/bear.svg",
  "blogwatcher": "/images/terminal.svg",
  "blucli": "/images/terminal.svg",
  "bluebubbles": "/images/message.svg",
  "camsnap": "/images/camera.svg",
  "clawhub": "/images/terminal.svg",
  "coding-agent": "/images/code.svg",
  "discord": "/images/message.svg",
  "eightctl": "/images/moon.svg",
  "gemini": "/images/google.svg",
  "gh-issues": "/images/github.svg",
  "gifgrep": "/images/terminal.svg",
  "github": "/images/github.svg",
  "gog": "/images/google-drive.svg",
  "goplaces": "/images/google-maps.svg",
  "healthcheck": "/images/checklist.svg",
  "himalaya": "/images/message.svg",
  "imsg": "/images/message.svg",
  "mcporter": "/images/chart.svg",
  "model-usage": "/images/chart.svg",
  "nano-banana-pro": "/images/google.svg",
  "nano-pdf": "/images/pdf.svg",
  "notion": "/images/notion.svg",
  "obsidian": "/images/obsidian.svg",
  "openai-image-gen": "/images/openai.svg",
  "openai-whisper": "/images/mic.svg",
  "openai-whisper-api": "/images/mic.svg",
  "openhue": "/images/philips-hue.svg",
  "oracle": "/images/terminal.svg",
  "ordercli": "/images/terminal.svg",
  "peekaboo": "/images/camera.svg",
  "sag": "/images/message.svg",
  "session-logs": "/images/chart.svg",
  "sherpa-onnx-tts": "/images/message.svg",
  "skill-creator": "/images/code.svg",
  "slack": "/images/slack.svg",
  "songsee": "/images/spotify.svg",
  "sonoscli": "/images/sonos.svg",
  "spotify-player": "/images/spotify.svg",
  "summarize": "/images/pdf.svg",
  "things-mac": "/images/checklist.svg",
  "tmux": "/images/terminal.svg",
  "trello": "/images/trello.svg",
  "video-frames": "/images/camera.svg",
  "voice-call": "/images/message.svg",
  "wacli": "/images/whatsapp.svg",
  "weather": "/images/weather.svg",
  "xurl": "/images/message.svg"
};
