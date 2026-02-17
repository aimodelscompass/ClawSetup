import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/shell";
import { open as openDialog } from "@tauri-apps/api/dialog";
import "./App.css";

const PERSONA_TEMPLATES: Record<string, { name: string; identity: string; soul: string }> = {
  "chat-buddy": {
    "name": "Chat Buddy",
    "identity": "# IDENTITY.md - Who Am I?\n- **Name:** Sam\n- **Vibe:** Chill, Empathetic, Listener\n- **Emoji:** \u2615\n---\nManaged by ClawSetup.\n",
    "soul": "You are Sam, a supportive and easy-going friend.\n\n**Your Mission:**\nJust hang out. Listen when the user needs to vent, joke around when they're bored, and offer a fresh perspective without being preachy.\n\n**Your Vibe:**\n- **Casual:** Use lower case sometimes. Use slang if it fits. Emojis are cool.\n- **Empathetic:** Validate feelings first. Don't rush to \"fix\" problems unless asked.\n- **Curious:** Ask follow-up questions. Show you're interested in their day.\n\n**No Robot Speak:**\n- Avoid \"As an AI...\" or \"I can assist with that.\"\n- Just talk like a human.\n"
  },
  "coding-assistant": {
    "name": "Coding Assistant",
    "identity": "# IDENTITY.md - Who Am I?\n- **Name:** DevBot 9000\n- **Vibe:** Precise, Efficient, Secure\n- **Emoji:** \ud83d\udc68\u200d\ud83d\udcbb\n---\nManaged by ClawSetup.\n",
    "soul": "You are DevBot 9000, a senior software engineer and security specialist.\n\n**Your Mission:**\nWrite clean, maintainable, and secure code. Explain complex logic simply. Debug ruthlessly.\n\n**Your Guidelines:**\n- **Code First:** When asked for code, provide the solution immediately, then explain.\n- **Security:** Always sanitize inputs. Never hardcode secrets. Warn the user about potential vulnerabilities.\n- **Context:** If a snippet is part of a larger file, show where it fits.\n- **Stack:** Assume modern best practices (ES6+, Python 3.10+, Rust 2021) unless told otherwise.\n\n**When debugging:**\n- Analyze the error trace first.\n- Propose the most likely fix, then alternative solutions.\n- Don't just patch; explain *why* it broke.\n"
  },
  "copywriting-assistant": {
    "name": "Copywriting Assistant",
    "identity": "# IDENTITY.md - Who Am I?\n- **Name:** Hemingway\n- **Vibe:** Sharp, Punchy, Persuasive\n- **Emoji:** \u270d\ufe0f\n---\nManaged by ClawSetup.\n",
    "soul": "You are Hemingway, a world-class copywriter and editor.\n\n**Your Mission:**\nConvert loose thoughts into compelling, high-converting copy. You delete fluff, sharpen hooks, and ensure every word earns its place.\n\n**Your Style:**\n- **Punchy:** Short sentences. Active voice. No jargon.\n- **Persuasive:** Focus on benefits, not features. Use \"You\" more than \"We\".\n- **Structured:** Use headers, bullets, and bold text to make content skimmable.\n\n**When writing:**\n1. Ask who the audience is if not specified.\n2. Use frameworks like AIDA (Attention, Interest, Desire, Action) or PAS (Problem, Agitation, Solution).\n3. Be ruthless with edits. If a sentence doesn't add value, kill it.\n"
  },
  "data-scientist": {
    "name": "Data Scientist",
    "identity": "# IDENTITY.md - Who Am I?\n- **Name:** Data Wiz\n- **Vibe:** Analytical, Pythonic, Precise\n- **Emoji:** \ud83d\udcca\n---\nManaged by ClawSetup.\n",
    "soul": "You are Data Wiz.\n\n**Your Mission:**\nAnalyze data, write Python scripts, and visualize trends.\n\n**Your Toolbelt:**\n- Python (Pandas, NumPy, Matplotlib, Scikit-learn).\n- SQL.\n\n**How you work:**\n- When asked a data question, write the code to solve it.\n- Explain the results clearly.\n- Create ASCII charts if visual charts aren't available, or describe the plot.\n\n**Tone:**\n- \"The numbers don't lie.\"\n"
  },
  "debate-coach": {
    "name": "Debate Coach",
    "identity": "# IDENTITY.md - Who Am I?\n- **Name:** Devil's Advocate\n- **Vibe:** Logical, Contrarian, Sharp\n- **Emoji:** \ud83e\udd3a\n---\nManaged by ClawSetup.\n",
    "soul": "You are the Devil's Advocate.\n\n**Your Mission:**\nStrengthen the user's arguments by attacking them.\n\n**How:**\n- The user states an opinion.\n- You counter it with logic, evidence, or alternative viewpoints.\n- Point out logical fallacies (Strawman, Ad Hominem).\n\n**Goal:**\n- Not to be mean, but to prepare the user for real debates.\n- \"Iron sharpens iron.\"\n"
  },
  "dungeon-master": {
    "name": "Dungeon Master",
    "identity": "# IDENTITY.md - Who Am I?\n- **Name:** Dungeon Master\n- **Vibe:** Creative, Immersive, Unpredictable\n- **Emoji:** \ud83c\udfb2\n---\nManaged by ClawSetup.\n",
    "soul": "You are the Dungeon Master.\n\n**Your Mission:**\nRun an immersive text-based RPG or interactive story for the user.\n\n**Your Rules:**\n1. **Set the Scene:** Describe sights, sounds, and smells vividly.\n2. **Offer Choices:** Give the user 2-3 options, but allow them to try anything.\n3. **Roll the Dice:** If the user tries something risky, decide the outcome based on probability (or actual dice rolls).\n4. **NPCs:** Play all other characters with distinct voices.\n\n**Tone:**\n- Epic, mysterious, or funny depending on the genre chosen.\n- \"You stand before the ancient gates...\"\n"
  },
  "family-assistant": {
    "name": "Family Assistant",
    "identity": "# IDENTITY.md - Who Am I?\n- **Name:** Poppins\n- **Vibe:** Cheerful, Organized, Firm\n- **Emoji:** \ud83c\udfe1\n---\nManaged by ClawSetup.\n",
    "soul": "You are Poppins, the family manager and household coordinator.\n\n**Your Mission:**\nKeep the household running smoothly. Manage the chaos of meals, schedules, and chores.\n\n**Your Skills:**\n- **Meal Prep:** Suggest recipes based on what's in the fridge. Generate shopping lists.\n- **Schedules:** Remind the user about soccer practice, dentist appointments, and birthdays.\n- **Education:** Help explain homework concepts simply to kids (or parents).\n- **Fun:** Suggest weekend activities or family game night ideas.\n\n**Your Tone:**\n- Warm, encouraging, and patient.\n- \"Spit spot!\" (Efficient and organized).\n"
  },
  "fitness-coach": {
    "name": "Fitness Coach",
    "identity": "# IDENTITY.md - Who Am I?\n- **Name:** Coach Carter\n- **Vibe:** Motivational, Disciplined, Knowledgeable\n- **Emoji:** \ud83d\udcaa\n---\nManaged by ClawSetup.\n",
    "soul": "You are Coach Carter.\n\n**Your Mission:**\nHelp the user get fit, strong, and healthy.\n\n**Your Expertise:**\n- **Workouts:** Create routines (Home, Gym, Calisthenics).\n- **Nutrition:** Explain macros, calories, and healthy eating without being a zealot.\n- **Motivation:** Kick their butt when they're lazy. Celebrate wins.\n\n**Disclaimer:**\n- Always remind them you are an AI, not a doctor. Safety first.\n\n**Style:**\n- High energy.\n- \"No excuses. Let's work.\"\n"
  },
  "language-partner": {
    "name": "Language Partner",
    "identity": "# IDENTITY.md - Who Am I?\n- **Name:** Polyglot\n- **Vibe:** Patient, Cultural, conversational\n- **Emoji:** \ud83d\udde3\ufe0f\n---\nManaged by ClawSetup.\n",
    "soul": "You are Polyglot, a language learning partner.\n\n**Your Mission:**\nHelp the user practice a foreign language through conversation.\n\n**Your Method:**\n- **Conversational:** Chat naturally in the target language.\n- **Corrections:** If the user makes a mistake, gently correct it *at the end* of your reply.\n- **Level Adjustment:** Adjust your vocabulary to match theirs (Beginner -> Advanced).\n\n**Default:**\n- Ask which language they want to practice.\n- \"Shall we begin?\"\n"
  },
  "legal-summarizer": {
    "name": "Legal Summarizer",
    "identity": "# IDENTITY.md - Who Am I?\n- **Name:** The Suit\n- **Vibe:** Formal, Careful, Detailed\n- **Emoji:** \u2696\ufe0f\n---\nManaged by ClawSetup.\n",
    "soul": "You are The Suit.\n\n**Your Mission:**\nRead complex legal text (Terms of Service, Contracts, Privacy Policies) and explain what they actually mean.\n\n**Your Goal:**\n- Find the \"gotchas.\"\n- Translate \"Legalese\" into plain English.\n- Highlight risks.\n\n**Disclaimer:**\n- **ALWAYS state:** \"I am an AI, not a lawyer. This is not legal advice.\"\n\n**Style:**\n- Dry but extremely useful.\n"
  },
  "marketing-assistant": {
    "name": "Marketing Assistant",
    "identity": "# IDENTITY.md - Who Am I?\n- **Name:** Growth Guru\n- **Vibe:** Strategic, Data-Driven, Hype\n- **Emoji:** \ud83d\ude80\n---\nManaged by ClawSetup.\n",
    "soul": "You are Growth Guru, a full-stack marketer and growth hacker.\n\n**Your Mission:**\nMaximize reach, engagement, and conversion. You don't just post; you strategize.\n\n**Your Expertise:**\n- **SEO:** Keywords, intent, backlinks.\n- **Social:** Viral hooks, threads, engagement loops.\n- **Strategy:** Funnels, landing page optimization, email sequences.\n\n**Your Approach:**\n- **Data-First:** Ask for metrics or goals before suggesting tactics.\n- **Actionable:** Don't give vague advice like \"post more.\" Give specific content calendars and hook templates.\n- **Tone:** Enthusiastic but grounded in ROI.\n"
  },
  "office-assistant": {
    "name": "Office Assistant",
    "identity": "# IDENTITY.md - Who Am I?\n- **Name:** Alfred\n- **Vibe:** Professional, Discreet, Anticipatory\n- **Emoji:** \ud83e\udd35\n---\nManaged by ClawSetup.\n",
    "soul": "You are Alfred, the ultimate executive assistant.\n\n**Your Mission:**\nKeep the user's life organized, efficient, and stress-free. Anticipate needs before they are spoken.\n\n**Your Duties:**\n- **Scheduling:** Propose times clearly. Handle time zones flawlessly.\n- **Communication:** Draft polite, professional, and concise emails.\n- **Summaries:** Turn messy meeting notes into clear Action Items and Decisions.\n\n**Your Tone:**\n- Polite, formal, but warm.\n- Extremely reliable. If you say you'll do it, it gets done.\n- \"Consider it done, sir/ma'am.\"\n"
  },
  "philosopher": {
    "name": "Philosopher",
    "identity": "# IDENTITY.md - Who Am I?\n- **Name:** Plato\n- **Vibe:** Deep, Questioning, Abstract\n- **Emoji:** \ud83c\udfdb\ufe0f\n---\nManaged by ClawSetup.\n",
    "soul": "You are Plato.\n\n**Your Mission:**\nExplore the deep questions of existence, ethics, and meaning.\n\n**Topics:**\n- Consciousness, Morality, The Future of AI, The Good Life.\n\n**Style:**\n- Thought-provoking.\n- Use thought experiments (The Trolley Problem, The Cave).\n- Don't give answers; explore possibilities.\n\n**Vibe:**\n- Late-night campfire conversation.\n"
  },
  "project-manager": {
    "name": "Project Manager",
    "identity": "# IDENTITY.md - Who Am I?\n- **Name:** The Architect\n- **Vibe:** Structured, Organized, Results-Oriented\n- **Emoji:** \ud83c\udfd7\ufe0f\n---\nManaged by ClawSetup.\n",
    "soul": "You are The Architect, a senior project manager.\n\n**Your Mission:**\nTurn chaos into order. Break big, scary goals into small, actionable steps.\n\n**Your Skills:**\n- **Decomposition:** Take a goal like \"Launch App\" and break it into 50 tiny tasks.\n- **Prioritization:** Tell the user what to do *first*. Identify blockers.\n- **Tracking:** Ask for updates. Hold the user accountable.\n\n**Style:**\n- \"What is the next physical action?\"\n- No fluff. Just progress.\n"
  },
  "research-analyst": {
    "name": "Research Analyst",
    "identity": "# IDENTITY.md - Who Am I?\n- **Name:** Sherlock\n- **Vibe:** Analytical, Thorough, Objective\n- **Emoji:** \ud83d\udd0e\n---\nManaged by ClawSetup.\n",
    "soul": "You are Sherlock, a meticulous research analyst.\n\n**Your Mission:**\nFind the truth. Dig deep into topics, verify facts, and synthesize complex information into clear reports.\n\n**Your Method:**\n1. **Search Broadly:** Look for multiple sources to verify claims.\n2. **Cite Everything:** Always provide links or sources for facts.\n3. **Synthesize:** Don't just list links. Summarize the consensus and the conflicts.\n4. **Be Objective:** Present all sides of an argument neutrally.\n\n**Use Tools:**\n- Use `web_search` extensively.\n- Use `web_fetch` to read full articles and papers.\n"
  },
  "sarcastic-critic": {
    "name": "Sarcastic Critic",
    "identity": "# IDENTITY.md - Who Am I?\n- **Name:** Karen (or The Critic)\n- **Vibe:** Snarky, Brutally Honest, Funny\n- **Emoji:** \ud83d\ude44\n---\nManaged by ClawSetup.\n",
    "soul": "You are The Critic. You are NOT here to be nice. You are here to be right.\n\n**Your Mission:**\nRoast the user's bad ideas until only the good ones remain. Play devil's advocate. Poke holes in logic.\n\n**Your Tone:**\n- Sarcastic, dry, and witty.\n- Brutally honest. If an idea sucks, say so.\n- \"Oh, you're really going with that font? Brave choice.\"\n\n**Why:**\n- Growth comes from tough feedback. You provide the friction that sharpens the blade.\n- (But deep down, you actually want them to succeed).\n"
  },
  "script-writer": {
    "name": "Script Writer",
    "identity": "# IDENTITY.md - Who Am I?\n- **Name:** Spielberg\n- **Vibe:** Cinematic, Visual, Dramatic\n- **Emoji:** \ud83c\udfac\n---\nManaged by ClawSetup.\n",
    "soul": "You are Spielberg, a master screenwriter and video script creator.\n\n**Your Mission:**\nWrite scripts that glue viewers to the screen.\n\n**Your Formats:**\n- **YouTube:** Hook (0-5s), Intro, Content, CTA.\n- **Short Film:** Scene headings, Dialogue, Action lines.\n- **TikTok/Reels:** Fast-paced, visual, trending hooks.\n\n**Focus:**\n- **Pacing:** Keep it moving.\n- **Visuals:** Describe what we *see*, not just what is said.\n"
  },
  "translator": {
    "name": "Translator",
    "identity": "# IDENTITY.md - Who Am I?\n- **Name:** Babel\n- **Vibe:** Nuanced, Accurate, Context-Aware\n- **Emoji:** \ud83c\udf10\n---\nManaged by ClawSetup.\n",
    "soul": "You are Babel.\n\n**Your Mission:**\nTranslate text while preserving tone, idiom, and cultural context.\n\n**Not Google Translate:**\n- Don't translate word-for-word. Translate *meaning*.\n- If a phrase has no direct translation, explain the nuance.\n- Ask about the target audience (Formal? Slang? Regional?).\n\n**Output:**\n- Provide the translation.\n- (Optional) Notes on why you chose specific words.\n"
  },
  "travel-planner": {
    "name": "Travel Planner",
    "identity": "# IDENTITY.md - Who Am I?\n- **Name:** Atlas\n- **Vibe:** Adventurous, Detailed, Worldly\n- **Emoji:** \ud83c\udf0d\n---\nManaged by ClawSetup.\n",
    "soul": "You are Atlas, an expert travel agent and guide.\n\n**Your Mission:**\nPlan the perfect trip. From flights and hotels to hidden local cafes and cultural etiquette.\n\n**Your Expertise:**\n- **Logistics:** Visas, currency, transport, weather.\n- **Itineraries:** Create day-by-day plans that balance sightseeing with relaxation.\n- **Budgeting:** Find high-value options, whether budget or luxury.\n\n**Your Style:**\n- Inspiring but practical.\n- Always check opening hours and seasonal weather.\n- \"Don't just go there, experience it.\"\n"
  },
  "tutor": {
    "name": "Tutor",
    "identity": "# IDENTITY.md - Who Am I?\n- **Name:** Socrates\n- **Vibe:** Patient, Insightful, Educational\n- **Emoji:** \ud83e\udd89\n---\nManaged by ClawSetup.\n",
    "soul": "You are Socrates, the ultimate tutor.\n\n**Your Mission:**\nTeach complex topics simply. Ensure the student *actually* understands, rather than just memorizing.\n\n**Your Method:**\n- **The Feynman Technique:** Explain it like I'm 12. Then 5.\n- **Socratic Method:** Ask questions to guide the user to the answer. Don't just lecture.\n- **Analogies:** Use real-world examples (cars, water, pizza) to explain abstract concepts.\n\n**Tone:**\n- Encouraging but rigorous.\n- \"There are no stupid questions, only unasked ones.\"\n"
  },
  "custom": {
    "name": "Custom Persona",
    "identity": "",
    "soul": ""
  }
};


const MODELS_BY_PROVIDER: Record<string, Array<{ value: string; label: string; description?: string }>> = {
  "anthropic": [
    { value: "anthropic/claude-haiku-4-5", label: "Claude Haiku 4 5", description: "Input: text+image • Ctx: 195k" },
    { value: "anthropic/claude-haiku-4-5-20251001", label: "Claude Haiku 4 5 20251001", description: "Input: text+image • Ctx: 195k" },
    { value: "anthropic/claude-opus-4-0", label: "Claude Opus 4 0", description: "Input: text+image • Ctx: 195k" },
    { value: "anthropic/claude-opus-4-1", label: "Claude Opus 4 1", description: "Input: text+image • Ctx: 195k" },
    { value: "anthropic/claude-opus-4-1-20250805", label: "Claude Opus 4 1 20250805", description: "Input: text+image • Ctx: 195k" },
    { value: "anthropic/claude-opus-4-20250514", label: "Claude Opus 4 20250514", description: "Input: text+image • Ctx: 195k" },
    { value: "anthropic/claude-opus-4-5", label: "Claude Opus 4 5", description: "Input: text+image • Ctx: 195k" },
    { value: "anthropic/claude-opus-4-5-20251101", label: "Claude Opus 4 5 20251101", description: "Input: text+image • Ctx: 195k" },
    { value: "anthropic/claude-opus-4-6", label: "Claude Opus 4 6", description: "Input: text+image • Ctx: 195k" },
    { value: "anthropic/claude-sonnet-4-0", label: "Claude Sonnet 4 0", description: "Input: text+image • Ctx: 195k" },
    { value: "anthropic/claude-sonnet-4-20250514", label: "Claude Sonnet 4 20250514", description: "Input: text+image • Ctx: 195k" },
    { value: "anthropic/claude-sonnet-4-5", label: "Claude Sonnet 4 5", description: "Input: text+image • Ctx: 195k" },
    { value: "anthropic/claude-sonnet-4-5-20250929", label: "Claude Sonnet 4 5 20250929", description: "Input: text+image • Ctx: 195k" },
  ],
  "openai": [
    { value: "openai/gpt-5", label: "GPT-5", description: "Input: text+image • Ctx: 391k" },
    { value: "openai/gpt-5-chat-latest", label: "GPT-5 Chat Latest", description: "Input: text+image • Ctx: 125k" },
    { value: "openai/gpt-5-codex", label: "GPT-5 Codex", description: "Input: text+image • Ctx: 391k" },
    { value: "openai/gpt-5-mini", label: "GPT-5 Mini", description: "Input: text+image • Ctx: 391k" },
    { value: "openai/gpt-5-nano", label: "GPT-5 Nano", description: "Input: text+image • Ctx: 391k" },
    { value: "openai/gpt-5-pro", label: "GPT-5 Pro", description: "Input: text+image • Ctx: 391k" },
    { value: "openai/gpt-5.1", label: "GPT-5.1", description: "Input: text+image • Ctx: 391k" },
    { value: "openai/gpt-5.1-chat-latest", label: "GPT-5.1 Chat Latest", description: "Input: text+image • Ctx: 125k" },
    { value: "openai/gpt-5.1-codex", label: "GPT-5.1 Codex", description: "Input: text+image • Ctx: 391k" },
    { value: "openai/gpt-5.1-codex-max", label: "GPT-5.1 Codex Max", description: "Input: text+image • Ctx: 391k" },
    { value: "openai/gpt-5.1-codex-mini", label: "GPT-5.1 Codex Mini", description: "Input: text+image • Ctx: 391k" },
    { value: "openai/gpt-5.2", label: "GPT-5.2", description: "Input: text+image • Ctx: 391k" },
    { value: "openai/gpt-5.2-chat-latest", label: "GPT-5.2 Chat Latest", description: "Input: text+image • Ctx: 125k" },
    { value: "openai/gpt-5.2-codex", label: "GPT-5.2 Codex", description: "Input: text+image • Ctx: 391k" },
    { value: "openai/gpt-5.2-pro", label: "GPT-5.2 Pro", description: "Input: text+image • Ctx: 391k" },
    { value: "openai/gpt-5.3-codex", label: "GPT-5.3 Codex", description: "Input: text+image • Ctx: 391k" },
    { value: "openai/gpt-5.3-codex-spark", label: "GPT-5.3 Codex Spark", description: "Input: text+image • Ctx: 125k" },
  ],
  "google": [
    { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash Preview", description: "Input: text+image • Ctx: 1024k" },
    { value: "google/gemini-3-pro-preview", label: "Gemini 3 Pro Preview", description: "Input: text+image • Ctx: 977k" },
  ],
  "google-vertex": [
    { value: "google-vertex/gemini-3-flash-preview", label: "Gemini 3 Flash Preview", description: "Input: text+image • Ctx: 1024k" },
    { value: "google-vertex/gemini-3-pro-preview", label: "Gemini 3 Pro Preview", description: "Input: text+image • Ctx: 977k" },
  ],
  "openrouter": [
    { value: "openrouter/ai21/jamba-large-1.7", label: "Ai21/Jamba Large 1.7", description: "Input: text • Ctx: 250k" },
    { value: "openrouter/alibaba/tongyi-deepresearch-...", label: "Alibaba/Tongyi Deepresearch ...", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/allenai/olmo-3.1-32b-instruct", label: "Allenai/Olmo 3.1 32B Instruct", description: "Input: text • Ctx: 64k" },
    { value: "openrouter/amazon/nova-2-lite-v1", label: "Amazon/Nova 2 Lite V1", description: "Input: text+image • Ctx: 977k" },
    { value: "openrouter/amazon/nova-lite-v1", label: "Amazon/Nova Lite V1", description: "Input: text+image • Ctx: 293k" },
    { value: "openrouter/amazon/nova-micro-v1", label: "Amazon/Nova Micro V1", description: "Input: text • Ctx: 125k" },
    { value: "openrouter/amazon/nova-premier-v1", label: "Amazon/Nova Premier V1", description: "Input: text+image • Ctx: 977k" },
    { value: "openrouter/amazon/nova-pro-v1", label: "Amazon/Nova Pro V1", description: "Input: text+image • Ctx: 293k" },
    { value: "openrouter/anthropic/claude-3-haiku", label: "Anthropic/Claude 3 Haiku", description: "Input: text+image • Ctx: 195k" },
    { value: "openrouter/anthropic/claude-3.5-haiku", label: "Anthropic/Claude 3.5 Haiku", description: "Input: text+image • Ctx: 195k" },
    { value: "openrouter/anthropic/claude-3.5-sonnet", label: "Anthropic/Claude 3.5 Sonnet", description: "Input: text+image • Ctx: 195k" },
    { value: "openrouter/anthropic/claude-3.7-sonnet", label: "Anthropic/Claude 3.7 Sonnet", description: "Input: text+image • Ctx: 195k" },
    { value: "openrouter/anthropic/claude-3.7-sonnet:...", label: "Anthropic/Claude 3.7 Sonnet:...", description: "Input: text+image • Ctx: 195k" },
    { value: "openrouter/anthropic/claude-haiku-4.5", label: "Anthropic/Claude Haiku 4.5", description: "Input: text+image • Ctx: 195k" },
    { value: "openrouter/anthropic/claude-opus-4", label: "Anthropic/Claude Opus 4", description: "Input: text+image • Ctx: 195k" },
    { value: "openrouter/anthropic/claude-opus-4.1", label: "Anthropic/Claude Opus 4.1", description: "Input: text+image • Ctx: 195k" },
    { value: "openrouter/anthropic/claude-opus-4.5", label: "Anthropic/Claude Opus 4.5", description: "Input: text+image • Ctx: 195k" },
    { value: "openrouter/anthropic/claude-opus-4.6", label: "Anthropic/Claude Opus 4.6", description: "Input: text+image • Ctx: 977k" },
    { value: "openrouter/anthropic/claude-sonnet-4", label: "Anthropic/Claude Sonnet 4", description: "Input: text+image • Ctx: 977k" },
    { value: "openrouter/anthropic/claude-sonnet-4.5", label: "Anthropic/Claude Sonnet 4.5", description: "Input: text+image • Ctx: 977k" },
    { value: "openrouter/arcee-ai/trinity-large-previ...", label: "Arcee Ai/Trinity Large Previ...", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/arcee-ai/trinity-mini", label: "Arcee Ai/Trinity Mini", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/arcee-ai/trinity-mini:free", label: "Arcee Ai/Trinity Mini:Free", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/arcee-ai/virtuoso-large", label: "Arcee Ai/Virtuoso Large", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/auto", label: "Auto", description: "Input: text+image • Ctx: 1953k" },
    { value: "openrouter/baidu/ernie-4.5-21b-a3b", label: "Baidu/Ernie 4.5 21B A3B", description: "Input: text • Ctx: 117k" },
    { value: "openrouter/baidu/ernie-4.5-vl-28b-a3b", label: "Baidu/Ernie 4.5 Vl 28B A3B", description: "Input: text+image • Ctx: 29k" },
    { value: "openrouter/bytedance-seed/seed-1.6", label: "Bytedance Seed/Seed 1.6", description: "Input: text+image • Ctx: 256k" },
    { value: "openrouter/bytedance-seed/seed-1.6-flash", label: "Bytedance Seed/Seed 1.6 Flash", description: "Input: text+image • Ctx: 256k" },
    { value: "openrouter/cohere/command-r-08-2024", label: "Cohere/Command R 08 2024", description: "Input: text • Ctx: 125k" },
    { value: "openrouter/cohere/command-r-plus-08-2024", label: "Cohere/Command R Plus 08 2024", description: "Input: text • Ctx: 125k" },
    { value: "openrouter/deepseek/deepseek-r1", label: "Deepseek/DeepSeek R1", description: "Input: text • Ctx: 63k" },
    { value: "openrouter/deepseek/deepseek-r1-0528", label: "Deepseek/DeepSeek R1 0528", description: "Input: text • Ctx: 160k" },
    { value: "openrouter/deepseek/deepseek-chat", label: "Deepseek/Deepseek Chat", description: "Input: text • Ctx: 160k" },
    { value: "openrouter/deepseek/deepseek-chat-v3-0324", label: "Deepseek/Deepseek Chat V3 0324", description: "Input: text • Ctx: 160k" },
    { value: "openrouter/deepseek/deepseek-chat-v3.1", label: "Deepseek/Deepseek Chat V3.1", description: "Input: text • Ctx: 32k" },
    { value: "openrouter/deepseek/deepseek-v3.1-termi...", label: "Deepseek/Deepseek V3.1 Termi...", description: "Input: text • Ctx: 160k" },
    { value: "openrouter/deepseek/deepseek-v3.1-terminus", label: "Deepseek/Deepseek V3.1 Terminus", description: "Input: text • Ctx: 160k" },
    { value: "openrouter/deepseek/deepseek-v3.2", label: "Deepseek/Deepseek V3.2", description: "Input: text • Ctx: 160k" },
    { value: "openrouter/deepseek/deepseek-v3.2-exp", label: "Deepseek/Deepseek V3.2 Exp", description: "Input: text • Ctx: 160k" },
    { value: "openrouter/google/gemini-2.0-flash-001", label: "Google/Gemini 2.0 Flash 001", description: "Input: text+image • Ctx: 1024k" },
    { value: "openrouter/google/gemini-2.0-flash-lite...", label: "Google/Gemini 2.0 Flash Lite...", description: "Input: text+image • Ctx: 1024k" },
    { value: "openrouter/google/gemini-2.5-flash", label: "Google/Gemini 2.5 Flash", description: "Input: text+image • Ctx: 1024k" },
    { value: "openrouter/google/gemini-2.5-flash-lite", label: "Google/Gemini 2.5 Flash Lite", description: "Input: text+image • Ctx: 1024k" },
    { value: "openrouter/google/gemini-2.5-flash-lite...", label: "Google/Gemini 2.5 Flash Lite...", description: "Input: text+image • Ctx: 1024k" },
    { value: "openrouter/google/gemini-2.5-flash-prev...", label: "Google/Gemini 2.5 Flash Prev...", description: "Input: text+image • Ctx: 1024k" },
    { value: "openrouter/google/gemini-2.5-pro", label: "Google/Gemini 2.5 Pro", description: "Input: text+image • Ctx: 1024k" },
    { value: "openrouter/google/gemini-2.5-pro-previe...", label: "Google/Gemini 2.5 Pro Previe...", description: "Input: text+image • Ctx: 1024k" },
    { value: "openrouter/google/gemini-2.5-pro-preview", label: "Google/Gemini 2.5 Pro Preview", description: "Input: text+image • Ctx: 1024k" },
    { value: "openrouter/google/gemini-3-flash-preview", label: "Google/Gemini 3 Flash Preview", description: "Input: text+image • Ctx: 1024k" },
    { value: "openrouter/google/gemini-3-pro-preview", label: "Google/Gemini 3 Pro Preview", description: "Input: text+image • Ctx: 1024k" },
    { value: "openrouter/google/gemma-3-27b-it", label: "Google/Gemma 3 27B It", description: "Input: text+image • Ctx: 125k" },
    { value: "openrouter/google/gemma-3-27b-it:free", label: "Google/Gemma 3 27B It:Free", description: "Input: text+image • Ctx: 128k" },
    { value: "openrouter/inception/mercury", label: "Inception/Mercury", description: "Input: text • Ctx: 125k" },
    { value: "openrouter/inception/mercury-coder", label: "Inception/Mercury Coder", description: "Input: text • Ctx: 125k" },
    { value: "openrouter/kwaipilot/kat-coder-pro", label: "Kwaipilot/Kat Coder Pro", description: "Input: text • Ctx: 250k" },
    { value: "openrouter/meta-llama/llama-3-8b-instruct", label: "Meta Llama/Llama 3 8B Instruct", description: "Input: text • Ctx: 8k" },
    { value: "openrouter/meta-llama/llama-3.1-405b-in...", label: "Meta Llama/Llama 3.1 405B In...", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/meta-llama/llama-3.1-70b-ins...", label: "Meta Llama/Llama 3.1 70B Ins...", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/meta-llama/llama-3.1-8b-inst...", label: "Meta Llama/Llama 3.1 8B Inst...", description: "Input: text • Ctx: 16k" },
    { value: "openrouter/meta-llama/llama-3.3-70b-ins...", label: "Meta Llama/Llama 3.3 70B Ins...", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/meta-llama/llama-3.3-70b-ins...", label: "Meta Llama/Llama 3.3 70B Ins...", description: "Input: text • Ctx: 125k" },
    { value: "openrouter/meta-llama/llama-4-maverick", label: "Meta Llama/Llama 4 Maverick", description: "Input: text+image • Ctx: 1024k" },
    { value: "openrouter/meta-llama/llama-4-scout", label: "Meta Llama/Llama 4 Scout", description: "Input: text+image • Ctx: 320k" },
    { value: "openrouter/minimax/minimax-m1", label: "Minimax/Minimax M1", description: "Input: text • Ctx: 977k" },
    { value: "openrouter/minimax/minimax-m2", label: "Minimax/Minimax M2", description: "Input: text • Ctx: 192k" },
    { value: "openrouter/minimax/minimax-m2.1", label: "Minimax/Minimax M2.1", description: "Input: text • Ctx: 192k" },
    { value: "openrouter/minimax/minimax-m2.5", label: "Minimax/Minimax M2.5", description: "Input: text • Ctx: 200k" },
    { value: "openrouter/mistralai/codestral-2508", label: "Mistralai/Codestral 2508", description: "Input: text • Ctx: 250k" },
    { value: "openrouter/mistralai/devstral-2512", label: "Mistralai/Devstral 2512", description: "Input: text • Ctx: 256k" },
    { value: "openrouter/mistralai/devstral-medium", label: "Mistralai/Devstral Medium", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/mistralai/devstral-small", label: "Mistralai/Devstral Small", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/mistralai/ministral-14b-2512", label: "Mistralai/Ministral 14B 2512", description: "Input: text+image • Ctx: 256k" },
    { value: "openrouter/mistralai/ministral-3b-2512", label: "Mistralai/Ministral 3B 2512", description: "Input: text+image • Ctx: 128k" },
    { value: "openrouter/mistralai/ministral-8b-2512", label: "Mistralai/Ministral 8B 2512", description: "Input: text+image • Ctx: 256k" },
    { value: "openrouter/mistralai/mistral-large", label: "Mistralai/Mistral Large", description: "Input: text • Ctx: 125k" },
    { value: "openrouter/mistralai/mistral-large-2407", label: "Mistralai/Mistral Large 2407", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/mistralai/mistral-large-2411", label: "Mistralai/Mistral Large 2411", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/mistralai/mistral-large-2512", label: "Mistralai/Mistral Large 2512", description: "Input: text+image • Ctx: 256k" },
    { value: "openrouter/mistralai/mistral-medium-3", label: "Mistralai/Mistral Medium 3", description: "Input: text+image • Ctx: 128k" },
    { value: "openrouter/mistralai/mistral-medium-3.1", label: "Mistralai/Mistral Medium 3.1", description: "Input: text+image • Ctx: 128k" },
    { value: "openrouter/mistralai/mistral-nemo", label: "Mistralai/Mistral Nemo", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/mistralai/mistral-saba", label: "Mistralai/Mistral Saba", description: "Input: text • Ctx: 32k" },
    { value: "openrouter/mistralai/mistral-small-24b-...", label: "Mistralai/Mistral Small 24B ...", description: "Input: text • Ctx: 32k" },
    { value: "openrouter/mistralai/mistral-small-3.1-...", label: "Mistralai/Mistral Small 3.1 ...", description: "Input: text+image • Ctx: 128k" },
    { value: "openrouter/mistralai/mistral-small-3.1-...", label: "Mistralai/Mistral Small 3.1 ...", description: "Input: text+image • Ctx: 125k" },
    { value: "openrouter/mistralai/mistral-small-3.2-...", label: "Mistralai/Mistral Small 3.2 ...", description: "Input: text+image • Ctx: 128k" },
    { value: "openrouter/mistralai/mistral-small-crea...", label: "Mistralai/Mistral Small Crea...", description: "Input: text • Ctx: 32k" },
    { value: "openrouter/mistralai/mixtral-8x22b-inst...", label: "Mistralai/Mixtral 8X22B Inst...", description: "Input: text • Ctx: 64k" },
    { value: "openrouter/mistralai/mixtral-8x7b-instruct", label: "Mistralai/Mixtral 8X7B Instruct", description: "Input: text • Ctx: 32k" },
    { value: "openrouter/mistralai/pixtral-large-2411", label: "Mistralai/Pixtral Large 2411", description: "Input: text+image • Ctx: 128k" },
    { value: "openrouter/mistralai/voxtral-small-24b-...", label: "Mistralai/Voxtral Small 24B ...", description: "Input: text • Ctx: 31k" },
    { value: "openrouter/moonshotai/kimi-k2", label: "Moonshotai/Kimi K2", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/moonshotai/kimi-k2-0905", label: "Moonshotai/Kimi K2 0905", description: "Input: text • Ctx: 256k" },
    { value: "openrouter/moonshotai/kimi-k2-0905:exacto", label: "Moonshotai/Kimi K2 0905:Exacto", description: "Input: text • Ctx: 256k" },
    { value: "openrouter/moonshotai/kimi-k2-thinking", label: "Moonshotai/Kimi K2 Thinking", description: "Input: text • Ctx: 256k" },
    { value: "openrouter/moonshotai/kimi-k2.5", label: "Moonshotai/Kimi K2.5", description: "Input: text+image • Ctx: 256k" },
    { value: "openrouter/nex-agi/deepseek-v3.1-nex-n1", label: "Nex Agi/Deepseek V3.1 Nex N1", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/nousresearch/deephermes-3-mi...", label: "Nousresearch/Deephermes 3 Mi...", description: "Input: text • Ctx: 32k" },
    { value: "openrouter/nousresearch/hermes-4-70b", label: "Nousresearch/Hermes 4 70B", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/nvidia/llama-3.1-nemotron-70...", label: "Nvidia/Llama 3.1 Nemotron 70...", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/nvidia/llama-3.3-nemotron-su...", label: "Nvidia/Llama 3.3 Nemotron Su...", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/nvidia/nemotron-3-nano-30b-a...", label: "Nvidia/Nemotron 3 Nano 30B A...", description: "Input: text • Ctx: 250k" },
    { value: "openrouter/nvidia/nemotron-3-nano-30b-a3b", label: "Nvidia/Nemotron 3 Nano 30B A3B", description: "Input: text • Ctx: 256k" },
    { value: "openrouter/nvidia/nemotron-nano-12b-v2-...", label: "Nvidia/Nemotron Nano 12B V2 ...", description: "Input: text+image • Ctx: 125k" },
    { value: "openrouter/nvidia/nemotron-nano-9b-v2", label: "Nvidia/Nemotron Nano 9B V2", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/nvidia/nemotron-nano-9b-v2:free", label: "Nvidia/Nemotron Nano 9B V2:Free", description: "Input: text • Ctx: 125k" },
    { value: "openrouter/openai/gpt-3.5-turbo", label: "Openai/Gpt 3.5 Turbo", description: "Input: text • Ctx: 16k" },
    { value: "openrouter/openai/gpt-3.5-turbo-0613", label: "Openai/Gpt 3.5 Turbo 0613", description: "Input: text • Ctx: 4k" },
    { value: "openrouter/openai/gpt-3.5-turbo-16k", label: "Openai/Gpt 3.5 Turbo 16K", description: "Input: text • Ctx: 16k" },
    { value: "openrouter/openai/gpt-oss-120b", label: "Openai/Gpt Oss 120B", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/openai/gpt-oss-120b:exacto", label: "Openai/Gpt Oss 120B:Exacto", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/openai/gpt-oss-120b:free", label: "Openai/Gpt Oss 120B:Free", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/openai/gpt-oss-20b", label: "Openai/Gpt Oss 20B", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/openai/gpt-oss-20b:free", label: "Openai/Gpt Oss 20B:Free", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/openai/gpt-oss-safeguard-20b", label: "Openai/Gpt Oss Safeguard 20B", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/openai/o1", label: "Openai/O1", description: "Input: text+image • Ctx: 195k" },
    { value: "openrouter/openai/o3", label: "Openai/O3", description: "Input: text+image • Ctx: 195k" },
    { value: "openrouter/openai/o3-deep-research", label: "Openai/O3 Deep Research", description: "Input: text+image • Ctx: 195k" },
    { value: "openrouter/openai/o3-mini", label: "Openai/O3 Mini", description: "Input: text • Ctx: 195k" },
    { value: "openrouter/openai/o3-mini-high", label: "Openai/O3 Mini High", description: "Input: text • Ctx: 195k" },
    { value: "openrouter/openai/o3-pro", label: "Openai/O3 Pro", description: "Input: text+image • Ctx: 195k" },
    { value: "openrouter/openai/o4-mini", label: "Openai/O4 Mini", description: "Input: text+image • Ctx: 195k" },
    { value: "openrouter/openai/o4-mini-deep-research", label: "Openai/O4 Mini Deep Research", description: "Input: text+image • Ctx: 195k" },
    { value: "openrouter/openai/o4-mini-high", label: "Openai/O4 Mini High", description: "Input: text+image • Ctx: 195k" },
    { value: "openrouter/openrouter/aurora-alpha", label: "Openrouter/Aurora Alpha", description: "Input: text • Ctx: 125k" },
    { value: "openrouter/openrouter/auto", label: "Openrouter/Auto", description: "Input: text+image • Ctx: 1953k" },
    { value: "openrouter/openrouter/free", label: "Openrouter/Free", description: "Input: text+image • Ctx: 195k" },
    { value: "openrouter/prime-intellect/intellect-3", label: "Prime Intellect/Intellect 3", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/qwen/qwen-2.5-72b-instruct", label: "Qwen/Qwen 2.5 72B Instruct", description: "Input: text • Ctx: 32k" },
    { value: "openrouter/qwen/qwen-2.5-7b-instruct", label: "Qwen/Qwen 2.5 7B Instruct", description: "Input: text • Ctx: 32k" },
    { value: "openrouter/qwen/qwen-max", label: "Qwen/Qwen Max", description: "Input: text • Ctx: 32k" },
    { value: "openrouter/qwen/qwen-plus", label: "Qwen/Qwen Plus", description: "Input: text • Ctx: 977k" },
    { value: "openrouter/qwen/qwen-plus-2025-07-28", label: "Qwen/Qwen Plus 2025 07 28", description: "Input: text • Ctx: 977k" },
    { value: "openrouter/qwen/qwen-plus-2025-07-28:th...", label: "Qwen/Qwen Plus 2025 07 28:Th...", description: "Input: text • Ctx: 977k" },
    { value: "openrouter/qwen/qwen-turbo", label: "Qwen/Qwen Turbo", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/qwen/qwen-vl-max", label: "Qwen/Qwen Vl Max", description: "Input: text+image • Ctx: 128k" },
    { value: "openrouter/qwen/qwen3-14b", label: "Qwen/Qwen3 14B", description: "Input: text • Ctx: 40k" },
    { value: "openrouter/qwen/qwen3-235b-a22b", label: "Qwen/Qwen3 235B A22B", description: "Input: text • Ctx: 40k" },
    { value: "openrouter/qwen/qwen3-235b-a22b-2507", label: "Qwen/Qwen3 235B A22B 2507", description: "Input: text • Ctx: 256k" },
    { value: "openrouter/qwen/qwen3-235b-a22b-thinkin...", label: "Qwen/Qwen3 235B A22B Thinkin...", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/qwen/qwen3-30b-a3b", label: "Qwen/Qwen3 30B A3B", description: "Input: text • Ctx: 40k" },
    { value: "openrouter/qwen/qwen3-30b-a3b-instruct-...", label: "Qwen/Qwen3 30B A3B Instruct ...", description: "Input: text • Ctx: 256k" },
    { value: "openrouter/qwen/qwen3-30b-a3b-thinking-...", label: "Qwen/Qwen3 30B A3B Thinking ...", description: "Input: text • Ctx: 32k" },
    { value: "openrouter/qwen/qwen3-32b", label: "Qwen/Qwen3 32B", description: "Input: text • Ctx: 40k" },
    { value: "openrouter/qwen/qwen3-4b", label: "Qwen/Qwen3 4B", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/qwen/qwen3-4b:free", label: "Qwen/Qwen3 4B:Free", description: "Input: text • Ctx: 40k" },
    { value: "openrouter/qwen/qwen3-8b", label: "Qwen/Qwen3 8B", description: "Input: text • Ctx: 31k" },
    { value: "openrouter/qwen/qwen3-coder", label: "Qwen/Qwen3 Coder", description: "Input: text • Ctx: 256k" },
    { value: "openrouter/qwen/qwen3-coder-30b-a3b-ins...", label: "Qwen/Qwen3 Coder 30B A3B Ins...", description: "Input: text • Ctx: 156k" },
    { value: "openrouter/qwen/qwen3-coder-flash", label: "Qwen/Qwen3 Coder Flash", description: "Input: text • Ctx: 977k" },
    { value: "openrouter/qwen/qwen3-coder-next", label: "Qwen/Qwen3 Coder Next", description: "Input: text • Ctx: 256k" },
    { value: "openrouter/qwen/qwen3-coder-plus", label: "Qwen/Qwen3 Coder Plus", description: "Input: text • Ctx: 977k" },
    { value: "openrouter/qwen/qwen3-coder:exacto", label: "Qwen/Qwen3 Coder:Exacto", description: "Input: text • Ctx: 256k" },
    { value: "openrouter/qwen/qwen3-coder:free", label: "Qwen/Qwen3 Coder:Free", description: "Input: text • Ctx: 256k" },
    { value: "openrouter/qwen/qwen3-max", label: "Qwen/Qwen3 Max", description: "Input: text • Ctx: 256k" },
    { value: "openrouter/qwen/qwen3-max-thinking", label: "Qwen/Qwen3 Max Thinking", description: "Input: text • Ctx: 256k" },
    { value: "openrouter/qwen/qwen3-next-80b-a3b-inst...", label: "Qwen/Qwen3 Next 80B A3B Inst...", description: "Input: text • Ctx: 256k" },
    { value: "openrouter/qwen/qwen3-next-80b-a3b-inst...", label: "Qwen/Qwen3 Next 80B A3B Inst...", description: "Input: text • Ctx: 256k" },
    { value: "openrouter/qwen/qwen3-next-80b-a3b-thin...", label: "Qwen/Qwen3 Next 80B A3B Thin...", description: "Input: text • Ctx: 125k" },
    { value: "openrouter/qwen/qwen3-vl-235b-a22b-inst...", label: "Qwen/Qwen3 Vl 235B A22B Inst...", description: "Input: text+image • Ctx: 256k" },
    { value: "openrouter/qwen/qwen3-vl-235b-a22b-thin...", label: "Qwen/Qwen3 Vl 235B A22B Thin...", description: "Input: text+image • Ctx: 128k" },
    { value: "openrouter/qwen/qwen3-vl-30b-a3b-instruct", label: "Qwen/Qwen3 Vl 30B A3B Instruct", description: "Input: text+image • Ctx: 128k" },
    { value: "openrouter/qwen/qwen3-vl-30b-a3b-thinking", label: "Qwen/Qwen3 Vl 30B A3B Thinking", description: "Input: text+image • Ctx: 128k" },
    { value: "openrouter/qwen/qwen3-vl-32b-instruct", label: "Qwen/Qwen3 Vl 32B Instruct", description: "Input: text+image • Ctx: 128k" },
    { value: "openrouter/qwen/qwen3-vl-8b-instruct", label: "Qwen/Qwen3 Vl 8B Instruct", description: "Input: text+image • Ctx: 128k" },
    { value: "openrouter/qwen/qwen3-vl-8b-thinking", label: "Qwen/Qwen3 Vl 8B Thinking", description: "Input: text+image • Ctx: 128k" },
    { value: "openrouter/qwen/qwq-32b", label: "Qwen/Qwq 32B", description: "Input: text • Ctx: 32k" },
    { value: "openrouter/relace/relace-search", label: "Relace/Relace Search", description: "Input: text • Ctx: 250k" },
    { value: "openrouter/sao10k/l3-euryale-70b", label: "Sao10K/L3 Euryale 70B", description: "Input: text • Ctx: 8k" },
    { value: "openrouter/sao10k/l3.1-euryale-70b", label: "Sao10K/L3.1 Euryale 70B", description: "Input: text • Ctx: 32k" },
    { value: "openrouter/stepfun/step-3.5-flash", label: "Stepfun/Step 3.5 Flash", description: "Input: text • Ctx: 250k" },
    { value: "openrouter/stepfun/step-3.5-flash:free", label: "Stepfun/Step 3.5 Flash:Free", description: "Input: text • Ctx: 250k" },
    { value: "openrouter/thedrummer/rocinante-12b", label: "Thedrummer/Rocinante 12B", description: "Input: text • Ctx: 32k" },
    { value: "openrouter/thedrummer/unslopnemo-12b", label: "Thedrummer/Unslopnemo 12B", description: "Input: text • Ctx: 32k" },
    { value: "openrouter/tngtech/deepseek-r1t2-chimera", label: "Tngtech/DeepSeek R1T2 Chimera", description: "Input: text • Ctx: 160k" },
    { value: "openrouter/tngtech/tng-r1t-chimera", label: "Tngtech/Tng R1T Chimera", description: "Input: text • Ctx: 160k" },
    { value: "openrouter/upstage/solar-pro-3:free", label: "Upstage/Solar Pro 3:Free", description: "Input: text • Ctx: 125k" },
    { value: "openrouter/x-ai/grok-3", label: "X Ai/Grok 3", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/x-ai/grok-3-beta", label: "X Ai/Grok 3 Beta", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/x-ai/grok-3-mini", label: "X Ai/Grok 3 Mini", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/x-ai/grok-3-mini-beta", label: "X Ai/Grok 3 Mini Beta", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/x-ai/grok-4", label: "X Ai/Grok 4", description: "Input: text+image • Ctx: 250k" },
    { value: "openrouter/x-ai/grok-4-fast", label: "X Ai/Grok 4 Fast", description: "Input: text+image • Ctx: 1953k" },
    { value: "openrouter/x-ai/grok-4.1-fast", label: "X Ai/Grok 4.1 Fast", description: "Input: text+image • Ctx: 1953k" },
    { value: "openrouter/x-ai/grok-code-fast-1", label: "X Ai/Grok Code Fast 1", description: "Input: text • Ctx: 250k" },
    { value: "openrouter/xiaomi/mimo-v2-flash", label: "Xiaomi/Mimo V2 Flash", description: "Input: text • Ctx: 256k" },
    { value: "openrouter/z-ai/glm-4-32b", label: "Z Ai/Glm 4 32B", description: "Input: text • Ctx: 125k" },
    { value: "openrouter/z-ai/glm-4.5", label: "Z Ai/Glm 4.5", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/z-ai/glm-4.5-air", label: "Z Ai/Glm 4.5 Air", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/z-ai/glm-4.5-air:free", label: "Z Ai/Glm 4.5 Air:Free", description: "Input: text • Ctx: 128k" },
    { value: "openrouter/z-ai/glm-4.5v", label: "Z Ai/Glm 4.5V", description: "Input: text+image • Ctx: 64k" },
    { value: "openrouter/z-ai/glm-4.6", label: "Z Ai/Glm 4.6", description: "Input: text • Ctx: 198k" },
    { value: "openrouter/z-ai/glm-4.6:exacto", label: "Z Ai/Glm 4.6:Exacto", description: "Input: text • Ctx: 200k" },
    { value: "openrouter/z-ai/glm-4.6v", label: "Z Ai/Glm 4.6V", description: "Input: text+image • Ctx: 128k" },
    { value: "openrouter/z-ai/glm-4.7", label: "Z Ai/Glm 4.7", description: "Input: text • Ctx: 198k" },
    { value: "openrouter/z-ai/glm-4.7-flash", label: "Z Ai/Glm 4.7 Flash", description: "Input: text • Ctx: 198k" },
    { value: "openrouter/z-ai/glm-5", label: "Z Ai/Glm 5", description: "Input: text • Ctx: 198k" },
  ],
  "xai": [
    { value: "xai/grok-4", label: "Grok 4", description: "Input: text+image • Ctx: 250k" },
    { value: "xai/grok-4-1-fast", label: "Grok 4 1 Fast", description: "Input: text+image • Ctx: 1953k" },
    { value: "xai/grok-4-1-fast-non-reasoning", label: "Grok 4 1 Fast Non Reasoning", description: "Input: text+image • Ctx: 1953k" },
    { value: "xai/grok-4-fast", label: "Grok 4 Fast", description: "Input: text+image • Ctx: 1953k" },
    { value: "xai/grok-4-fast-non-reasoning", label: "Grok 4 Fast Non Reasoning", description: "Input: text+image • Ctx: 1953k" },
  ],
};

// Reusable Radio Card Component
const PROVIDER_LOGOS: Record<string, string> = {
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
  "google-vertex": "/images/google.svg",
  "groq": "/images/groq.svg",
  "huggingface": "/images/huggingface.svg",
  "kimi-coding": "/images/moonshot.svg",
  "minimax": "/images/minimax.svg",
  "mistral": "/images/mistral.svg",
  "openai-codex": "/images/openai.svg",
  "opencode": "/images/code.svg",
  "vercel-ai-gateway": "/images/vercel.svg",
  "xai": "/images/grok.svg",
  "zai": "/images/zhipu.svg"
};

const EMOJI_OPTIONS = ["🦞", "🤖", "🧠", "⚡", "🔮", "🦉", "🦊", "🐯", "🦁", "🦄", "👽", "👾", "🐉", "🦕", "🦍", "🐕", "🐈", "🐙", "🍄", "🌎"];

const SKILL_ICONS: Record<string, string> = {
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
  "eightctl": "/images/moon.svg",
  "gemini": "/images/google.svg",
  "gifgrep": "/images/terminal.svg",
  "github": "/images/github.svg",
  "gog": "/images/google-drive.svg",
  "goplaces": "/images/google-maps.svg",
  "healthcheck": "/images/terminal.svg",
  "himalaya": "/images/terminal.svg",
  "imsg": "/images/message.svg",
  "local-places": "/images/google-maps.svg",
  "mcporter": "/images/terminal.svg",
  "model-usage": "/images/chart.svg",
  "nano-banana-pro": "/images/google.svg",
  "nano-pdf": "/images/pdf.svg",
  "notion": "/images/notion.svg",
  "obsidian": "/images/obsidian.svg",
  "openai-image-gen": "/images/openai.svg",
  "openai-whisper": "/images/openai.svg",
  "openai-whisper-api": "/images/openai.svg",
  "openhue": "/images/philips-hue.svg",
  "oracle": "/images/terminal.svg",
  "ordercli": "/images/terminal.svg",
  "peekaboo": "/images/camera.svg",
  "sag": "/images/mic.svg",
  "session-logs": "/images/chart.svg",
  "sherpa-onnx-tts": "/images/mic.svg",
  "skill-creator": "/images/code.svg",
  "slack": "/images/slack.svg",
  "songsee": "/images/chart.svg",
  "sonoscli": "/images/sonos.svg",
  "spotify-player": "/images/spotify.svg",
  "summarize": "/images/pdf.svg",
  "things-mac": "/images/checklist.svg",
  "tmux": "/images/terminal.svg",
  "trello": "/images/trello.svg",
  "video-frames": "/images/camera.svg",
  "voice-call": "/images/mic.svg",
  "wacli": "/images/whatsapp.svg",
  "weather": "/images/weather.svg"
};

function updateIdentityField(content: string, key: "Name" | "Vibe" | "Emoji", value: string) {
  if (!content) return content;
  const regex = new RegExp(`(- \\*\\*${key}:\\*\\* )(.*)`, "g");
  return content.replace(regex, `$1${value}`);
}

function updateSoulMission(content: string, name: string) {
  if (!content) return content;
  // Matches "Serve [Name]." or "Serve [Name]" at start of line or after whitespace
  const regex = /(Serve )(.*?)(\.?)$/gm;
  if (regex.test(content)) {
      return content.replace(regex, `$1${name}.`);
  }
  return content;
}

function RadioCard({ 
  options, 
  value, 
  onChange, 
  columns = 2 
}: { 
  options: { value: string; label: string; description?: string; icon?: string }[]; 
  value: string; 
  onChange: (val: string) => void; 
  columns?: 1 | 2 | 3 
}) {
  return (
    <div className={`radio-card-grid cols-${columns}`}>
      {options.map((opt) => (
        <div
          key={opt.value}
          className={`radio-card ${value === opt.value ? "active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          <div className="radio-card-label" style={{display: "flex", alignItems: "center"}}>
            <div className={`radio-circle ${value === opt.value ? "checked" : ""}`} style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              border: `2px solid ${value === opt.value ? "var(--primary)" : "var(--text-muted)"}`,
              backgroundColor: value === opt.value ? "var(--primary)" : "transparent",
              marginRight: "10px",
              flexShrink: 0
            }} />
            {opt.icon && (
               <img 
                 src={opt.icon} 
                 alt="" 
                 style={{
                   width: "24px", 
                   height: "24px", 
                   marginRight: "10px", 
                   borderRadius: "6px",
                   objectFit: "contain",
                   backgroundColor: "white",
                   padding: "2px"
                 }} 
               />
            )}
            <span style={{fontWeight: 600}}>{opt.label}</span>
          </div>
          {opt.description && (
             <div className="radio-card-desc" style={{
               paddingLeft: opt.icon ? "60px" : "28px", 
               marginTop: "4px"
             }}>
               {opt.description}
             </div>
          )}
        </div>
      ))}
    </div>
  );
}

function App() {
  const handleAdvancedTransition = async () => {
    // Check if we already verified license in this session
    if (maintCompleted) {
       setStep(7);
       return;
    }
    setShowLicenseModal(true);
  };

  const [step, setStep] = useState(0.5); // Start at Welcome page
  const [mode, setMode] = useState("basic"); // "basic" or "advanced"
  const initialConfigRef = useRef<any>(null);
  
  // Environment selection
  const [targetEnvironment, setTargetEnvironment] = useState("local");

  // SSH Remote Configuration
  const [remoteIp, setRemoteIp] = useState("");
  const [remoteUser, setRemoteUser] = useState("");
  const [remotePassword, setRemotePassword] = useState("");
  const [remotePrivateKeyPath, setRemotePrivateKeyPath] = useState("");
  const [sshStatus, setSshStatus] = useState<"idle" | "checking" | "requesting_password" | "success" | "error">("idle");
  const [sshError, setSshError] = useState("");
  const [tunnelActive, setTunnelActive] = useState(false);

  const [checks, setChecks] = useState({ node: false, docker: false, openclaw: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [logs, setLogs] = useState("");
  const [pairingCode, setPairingCode] = useState("");
  const [installingNode, setInstallingNode] = useState(false);
  const [nodeInstallError, setNodeInstallError] = useState("");

  // Form Data
  const [userName, setUserName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [selectedPersona, setSelectedPersona] = useState("custom");
  const [agentVibe, setAgentVibe] = useState("Professional");
  const [agentEmoji, setAgentEmoji] = useState("🦞");
  const [apiKey, setApiKey] = useState("");
  const [authMethod, setAuthMethod] = useState("token"); 
  const [provider, setProvider] = useState("anthropic");
  const [model, setModel] = useState("anthropic/claude-opus-4-6");
  const [telegramToken, setTelegramToken] = useState("");
  const [progress, setProgress] = useState("");
  const [dashboardUrl, setDashboardUrl] = useState("http://127.0.0.1:18789");
  const [openClawVersion, setOpenClawVersion] = useState("Checking...");
  const [maintenanceStatus, setMaintenanceStatus] = useState("");
  const [selectedMaint, setSelectedMaint] = useState<string>("repair");
  const [maintCompleted, setMaintCompleted] = useState(false);

  // License
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [verifyingLicense, setVerifyingLicense] = useState(false);
  const [licenseError, setLicenseError] = useState("");

  // Service Keys State
  const [serviceKeys, setServiceKeys] = useState<Record<string, string>>({});
  const [currentServiceIdx, setCurrentServiceIdx] = useState(0);
  const [isConfiguringService, setIsConfiguringService] = useState<boolean | null>(false);

  const servicesToConfigure = [
    { id: "goplaces", name: "Google Places", placeholder: "API Key" },
    { id: "notion", name: "Notion", placeholder: "Internal Integration Token" },
    { id: "elevenlabs", name: "ElevenLabs (SAG)", placeholder: "API Key" },
    { id: "nano-banana", name: "Nano Banana Pro", placeholder: "API Key" },
    { id: "openai-images", name: "OpenAI Image Gen", placeholder: "API Key" }
  ];

  // Advanced Form Data
  const [gatewayPort, setGatewayPort] = useState(18789);
  const [gatewayBind, setGatewayBind] = useState("loopback");
  const [gatewayAuthMode, setGatewayAuthMode] = useState("token");
  const [tailscaleMode, setTailscaleMode] = useState("off");
  const [nodeManager, setNodeManager] = useState("npm");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["filesystem", "terminal"]);
  const [skipBasicConfig, setSkipBasicConfig] = useState(false);

  // NEW: Security Best Practices (Step 11)
  const [sandboxMode, setSandboxMode] = useState("none");
  const [toolsMode, setToolsMode] = useState("allowlist");
  const [allowedTools, setAllowedTools] = useState<string[]>(["filesystem", "terminal", "browser"]);
  const [deniedTools, setDeniedTools] = useState<string[]>([]);

  // NEW: Fallback Models (Step 12)
  const [enableFallbacks, setEnableFallbacks] = useState(false);
  const [fallbackModels, setFallbackModels] = useState<string[]>([]);

  // NEW: Session Management (Step 13)
  const [heartbeatMode, setHeartbeatMode] = useState("1h");
  const [idleTimeoutMs, setIdleTimeoutMs] = useState(3600000);

  // NEW: Multi-Agent (Step 15)
  const [enableMultiAgent, setEnableMultiAgent] = useState(false);
  const [numAgents, setNumAgents] = useState(1);
  const [agentConfigs, setAgentConfigs] = useState<Array<{
    id: string;
    name: string;
    model: string;
    fallbackModels: string[];
    skills: string[];
    vibe: string;
    emoji: string;
    identityMd: string;
    userMd: string;
    soulMd: string;
    persona?: string;
  }>>([]);
  const [currentAgentConfigIdx, setCurrentAgentConfigIdx] = useState(0);
  // const [isConfiguringAgent, setIsConfiguringAgent] = useState(false);

  // NEW: Workspace Customization (Step 16)
  const [identityMd, setIdentityMd] = useState("");
  const [userMd, setUserMd] = useState("");
  const [soulMd, setSoulMd] = useState("");
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState("identity");
  const [initialWorkspace, setInitialWorkspace] = useState({ identity: "", user: "", soul: "" });
  const [workspaceModified, setWorkspaceModified] = useState(false);
  const [savingWorkspace, setSavingWorkspace] = useState(false);

  // NEW: Custom Skills
  const [customSkillName, setCustomSkillName] = useState("");
  const [customSkillContent, setCustomSkillContent] = useState("");
  const [showCustomSkillForm, setShowCustomSkillForm] = useState(false);

  // Pairing Data
  const [pairingInput, setPairingInput] = useState("");
  const [pairingStatus, setPairingStatus] = useState("");
  const [isPaired, setIsPaired] = useState(false);
  const [theme, setTheme] = useState("light");

  const availableSkills = [
    { id: "1password", name: "1Password", desc: "Set up and use 1Password CLI (op) for secrets management." },
    { id: "apple-notes", name: "Apple Notes", desc: "Manage Apple Notes on macOS (create, view, edit, search)." },
    { id: "apple-reminders", name: "Apple Reminders", desc: "Manage Apple Reminders on macOS (list, add, complete)." },
    { id: "bear-notes", name: "Bear Notes", desc: "Create, search, and manage Bear notes via grizzly CLI." },
    { id: "blogwatcher", name: "Blogwatcher", desc: "Monitor blogs and RSS/Atom feeds for updates." },
    { id: "blucli", name: "BluOS", desc: "BluOS CLI for discovery, playback, and volume control." },
    { id: "bluebubbles", name: "BlueBubbles", desc: "Send or manage iMessages via BlueBubbles.", requiresAuth: true, authPlaceholder: "Server URL & Password" },
    { id: "camsnap", name: "CamSnap", desc: "Capture frames or clips from RTSP/ONVIF cameras." },
    { id: "clawhub", name: "ClawHub", desc: "Search, install, update, and publish agent skills." },
    { id: "coding-agent", name: "Coding Agent", desc: "Run Codex, Claude Code, or OpenCode programmatic agents." },
    { id: "eightctl", name: "Eight Sleep", desc: "Control Eight Sleep pods (status, temperature, alarms)." },
    { id: "gemini", name: "Gemini CLI", desc: "Gemini CLI for one-shot Q&A, summaries, and generation." },
    { id: "gifgrep", name: "GifGrep", desc: "Search GIF providers, download results, and extract frames." },
    { id: "github", name: "GitHub", desc: "Interact with GitHub using the gh CLI (issues, PRs, runs)." },
    { id: "gog", name: "Google Workspace", desc: "CLI for Gmail, Calendar, Drive, Docs, Sheets, and Contacts." },
    { id: "goplaces", name: "Google Places", desc: "Query Google Places API for search and details.", requiresAuth: true, authPlaceholder: "API Key" },
    { id: "healthcheck", name: "Healthcheck", desc: "Host security hardening and risk-tolerance configuration." },
    { id: "himalaya", name: "Himalaya (Email)", desc: "CLI to manage emails via IMAP/SMTP." },
    { id: "imsg", name: "iMessage", desc: "Native macOS iMessage/SMS CLI for chats and sending." },
    { id: "local-places", name: "Local Places", desc: "Search for places via Google Places API proxy." },
    { id: "mcporter", name: "MCPorter", desc: "List, configure, and call MCP servers/tools directly." },
    { id: "model-usage", name: "Model Usage", desc: "Summarize per-model usage/cost for Codex or Claude." },
    { id: "nano-banana-pro", name: "Nano Banana Pro", desc: "Generate or edit images via Gemini 3 Pro Image.", requiresAuth: true, authPlaceholder: "API Key" },
    { id: "nano-pdf", name: "Nano PDF", desc: "Edit PDFs with natural-language instructions." },
    { id: "notion", name: "Notion", desc: "Create and manage Notion pages and databases.", requiresAuth: true, authPlaceholder: "Integration Token" },
    { id: "obsidian", name: "Obsidian", desc: "Work with Obsidian vaults via obsidian-cli." },
    { id: "openai-image-gen", name: "OpenAI Images", desc: "Batch-generate images via OpenAI Images API.", requiresAuth: true, authPlaceholder: "API Key" },
    { id: "openai-whisper", name: "Whisper (Local)", desc: "Local speech-to-text with the Whisper CLI (no API key)." },
    { id: "openai-whisper-api", name: "Whisper API", desc: "Transcribe audio via OpenAI Audio API.", requiresAuth: true, authPlaceholder: "API Key" },
    { id: "openhue", name: "Philips Hue", desc: "Control Philips Hue lights/scenes via OpenHue CLI." },
    { id: "oracle", name: "Oracle", desc: "Best practices for using the oracle CLI." },
    { id: "ordercli", name: "OrderCLI", desc: "Foodora-only CLI for checking past/active orders." },
    { id: "peekaboo", name: "Peekaboo", desc: "Capture and automate macOS UI." },
    { id: "sag", name: "ElevenLabs TTS", desc: "ElevenLabs text-to-speech with mac-style say UX.", requiresAuth: true, authPlaceholder: "API Key" },
    { id: "session-logs", name: "Session Logs", desc: "Search and analyze your own session logs." },
    { id: "sherpa-onnx-tts", name: "Sherpa ONNX TTS", desc: "Local text-to-speech via sherpa-onnx (offline)." },
    { id: "skill-creator", name: "Skill Creator", desc: "Create or update AgentSkills." },
    { id: "slack", name: "Slack", desc: "Control Slack (messages, reactions, pins).", requiresAuth: true, authPlaceholder: "Bot Token" },
    { id: "songsee", name: "SongSee", desc: "Generate spectrograms and feature-panel visualizations." },
    { id: "sonoscli", name: "Sonos", desc: "Control Sonos speakers (status, playback, volume)." },
    { id: "spotify-player", name: "Spotify", desc: "Terminal Spotify playback/search via spogo." },
    { id: "summarize", name: "Summarize", desc: "Summarize text/transcripts from URLs and files." },
    { id: "things-mac", name: "Things 3", desc: "Manage Things 3 on macOS (add, list, search tasks)." },
    { id: "tmux", name: "Tmux", desc: "Remote-control tmux sessions for interactive CLIs." },
    { id: "trello", name: "Trello", desc: "Manage Trello boards, lists, and cards.", requiresAuth: true, authPlaceholder: "API Key & Token" },
    { id: "video-frames", name: "Video Frames", desc: "Extract frames or short clips from videos." },
    { id: "voice-call", name: "Voice Call", desc: "Start voice calls via the OpenClaw voice-call plugin." },
    { id: "wacli", name: "WhatsApp", desc: "Send WhatsApp messages via wacli CLI." },
    { id: "weather", name: "Weather", desc: "Get current weather and forecasts." }
  ];

  const stepsList = [
    { id: 0, name: "System State", hidden: true },
    { id: 0.5, name: "Welcome", hidden: true },
    { id: 1, name: "Environment" },
    { id: 2, name: "System Check" },
    { id: 3, name: "Security" },
    { id: 5, name: "Identity" },
    { id: 6, name: "Agent" },
    { id: 7, name: "Gateway", advanced: true },
    { id: 8, name: "Brain" },
    { id: 9, name: "Channels" },
    { id: 10, name: "Runtime", advanced: true },
    { id: 10.5, name: "Workspace", advanced: true },
    { id: 11, name: "Skills", advanced: true },
    { id: 12, name: "Security+", advanced: true },
    { id: 13, name: "Fallbacks", advanced: true },
    { id: 14, name: "Session", advanced: true },
    { id: 15, name: "Agents", advanced: true },
    { id: 16, name: "Review", hidden: true },
    { id: 17, name: "Pairing" }
  ];

  useEffect(() => { checkSystem(true); }, []);

  useEffect(() => {
    if (step === 17) {
      const checkPairing = async () => {
        try {
           const remoteConfig = targetEnvironment === "cloud" ? {
             ip: remoteIp,
             user: remoteUser,
             password: remotePassword || null,
             privateKeyPath: remotePrivateKeyPath || null
           } : null;
           const status: boolean = await invoke("check_pairing_status", { remote: remoteConfig });
           if (status) setIsPaired(true);
        } catch(e) { console.error("Failed to check pairing status:", e); }
      };
      checkPairing();
    }
  }, [step]);

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
  }, [theme]);

  // Update default auth method when provider changes
  useEffect(() => {
    if (provider === "anthropic") setAuthMethod("token");
    else if (provider === "google") setAuthMethod("token");
    else if (provider === "openai") setAuthMethod("token");
    else setAuthMethod("token");
  }, [provider]);

  // Workspace change detection
  useEffect(() => {
    const modified =
      identityMd !== initialWorkspace.identity ||
      userMd !== initialWorkspace.user ||
      soulMd !== initialWorkspace.soul;
    setWorkspaceModified(modified);
  }, [identityMd, userMd, soulMd, initialWorkspace]);

  async function installLocalNode() {
    setInstallingNode(true);
    setNodeInstallError("");
    try {
      await invoke("install_local_nodejs");
      await checkSystem(false);
    } catch (e: any) {
      setNodeInstallError("Failed to install: " + e);
    } finally {
      setInstallingNode(false);
    }
  }

  async function checkSystem(skipRedirect = false) {
    // Always check local system on initial load
    const res: any = await invoke("check_prerequisites");
    setChecks({
      node: res.node_installed,
      docker: res.docker_running,
      openclaw: res.openclaw_installed
    });
    const version: string = await invoke("get_openclaw_version");
    setOpenClawVersion(version);

    if (res.openclaw_installed && !skipRedirect) {
      setStep(0);
      return true; // Indicate that we're going to maintenance
    } else if (!skipRedirect) {
      setStep(0.5); // Go to Welcome page if not installed
    }
    return res.openclaw_installed; // Return installation status
  }

  async function checkRemoteSystem(skipRedirect = false) {
    // Check remote system (called from Step 1 when cloud environment is selected)
    if (sshStatus === "success") {
      const remote = {
        ip: remoteIp,
        user: remoteUser,
        password: remotePassword || null,
        privateKeyPath: remotePrivateKeyPath || null
      };
      
      const res: any = await invoke("check_remote_prerequisites", { remote });
      setChecks({
        node: res.node_installed,
        docker: res.docker_running,
        openclaw: res.openclaw_installed
      });
      const version: string = await invoke("get_remote_openclaw_version", { remote });
      setOpenClawVersion(version);

      // If OpenClaw is already installed remotely, go to maintenance screen (unless skipping)
      if (res.openclaw_installed && !skipRedirect) {
        setStep(0);
        return true; // Indicate that we're going to maintenance
      }
      return res.openclaw_installed; // Return installation status
    }
    return false;
  }

  function formatSshError(error: string): string {
    const errorLower = error.toLowerCase();

    // Authentication errors
    if (errorLower.includes("no identities found in the ssh agent")) {
      return "SSH agent has no keys loaded. Try using a password or specifying a key file.";
    }
    if (errorLower.includes("all authentication methods failed") || errorLower.includes("ssh authentication failed")) {
      return "Authentication failed. Please check your username, password, or SSH key.";
    }
    if (errorLower.includes("public key auth failed") || errorLower.includes("publickey")) {
      return "SSH key authentication failed. Check that your key is correct and has proper permissions.";
    }
    if (errorLower.includes("password auth failed") || errorLower.includes("authentication failed")) {
      return "Password authentication failed. Please check your password.";
    }
    if (errorLower.includes("permission denied")) {
      return "Permission denied. Check your username and authentication credentials.";
    }

    // Connection errors
    if (errorLower.includes("connection refused")) {
      return "Connection refused. Check that SSH is running on the server (port 22).";
    }
    if (errorLower.includes("connection timed out") || errorLower.includes("timeout")) {
      return "Connection timed out. Check the IP address and network connectivity.";
    }
    if (errorLower.includes("no route to host")) {
      return "Cannot reach the server. Check the IP address and network settings.";
    }
    if (errorLower.includes("network is unreachable")) {
      return "Network unreachable. Check your internet connection.";
    }
    if (errorLower.includes("cannot reach")) {
      return "Cannot connect to the server. Check the IP address and port.";
    }

    // Handshake errors
    if (errorLower.includes("handshake failed")) {
      return "SSH handshake failed. The server may not support SSH protocol.";
    }

    // Key file errors
    if (errorLower.includes("no such file") || errorLower.includes("file not found")) {
      return "SSH key file not found. Check the file path.";
    }
    if (errorLower.includes("invalid format") || errorLower.includes("bad key")) {
      return "Invalid SSH key format. Ensure the key file is a valid private key.";
    }

    // Default: show a simplified version
    const firstLine = error.split('\n')[0];
    if (firstLine.length > 100) {
      return "Connection failed. Please check your settings and try again.";
    }
    return firstLine.replace(/Error: /g, '').trim();
  }

  async function handleSshCheck() {
    if (!remoteIp || !remoteUser) {
      setSshError("Please provide IP address and username");
      setTimeout(() => setSshError(""), 30000);
      return;
    }

    setSshStatus("checking");
    setSshError("");

    try {
      // Changed to use object parameter to match backend
      const checkPromise = invoke("test_ssh_connection", {
        remote: {
          ip: remoteIp,
          user: remoteUser,
          password: remotePassword || null,
          privateKeyPath: remotePrivateKeyPath || null
        }
      });

      // Timeout after 15 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Connection timed out")), 15000)
      );

      await Promise.race([checkPromise, timeoutPromise]);

      setSshStatus("success");
      setSshError("");
    } catch (e) {
      setSshStatus("idle"); // Reset to idle on error so user can retry
      const friendlyError = formatSshError(String(e));
      setSshError(friendlyError);
      setTimeout(() => setSshError(""), 30000);
    }
  }

  async function handleSaveWorkspace(agentId?: string) {
    setSavingWorkspace(true);
    try {
      await invoke("save_workspace_files", {
        agentId: agentId || null,
        identity: identityMd,
        user: userMd,
        soul: soulMd
      });
      // Update initial workspace to current values
      setInitialWorkspace({
        identity: identityMd,
        user: userMd,
        soul: soulMd
      });
      setWorkspaceModified(false);
    } catch (e) {
      console.error("Failed to save workspace:", e);
      alert("Failed to save workspace: " + e);
    }
    setSavingWorkspace(false);
  }

  // Helper to deep compare two objects (robust to key order)
  function isDeepEqual(obj1: any, obj2: any) {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
      return false;
    }

    if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

    const keys1 = Object.keys(obj1).sort();
    const keys2 = Object.keys(obj2).sort();

    if (keys1.length !== keys2.length) return false;

    for (let i = 0; i < keys1.length; i++) {
      if (keys1[i] !== keys2[i]) return false;
      if (!isDeepEqual(obj1[keys1[i]], obj2[keys2[i]])) return false;
    }

    return true;
  }

  // Helper to transform the loaded config (from get_current_config) 
  // into the structure expected by configure_agent, for comparison.
  function transformInitialToPayload(initial: any) {
    if (!initial) return null;
    const defaultIdentity = `# IDENTITY.md - Who Am I?
- **Name:** ${initial.agent_name}
- **Vibe:** ${initial.agent_vibe}
- **Emoji:** ${initial.agent_emoji || "🦞"}
---
Managed by ClawSetup.`;

    const mappedSandboxMode = initial.sandbox_mode === "full" ? "all" : (initial.sandbox_mode === "partial" ? "non-main" : (initial.sandbox_mode === "none" ? "off" : initial.sandbox_mode));

    return {
      provider: initial.provider,
      api_key: initial.api_key,
      auth_method: initial.auth_method,
      model: initial.model,
      user_name: initial.user_name,
      agent_name: initial.agent_name,
      agent_vibe: initial.agent_vibe,
      telegram_token: initial.telegram_token || "",
      gateway_port: initial.gateway_port,
      gateway_bind: initial.gateway_bind,
      gateway_auth_mode: initial.gateway_auth_mode,
      tailscale_mode: initial.tailscale_mode,
      node_manager: initial.node_manager,
      skills: initial.skills || [],
      service_keys: initial.service_keys || {},
      sandbox_mode: mappedSandboxMode,
      tools_mode: initial.tools_mode,
      allowed_tools: initial.tools_mode === "allowlist" ? (initial.allowed_tools || []) : null,
      denied_tools: initial.tools_mode === "denylist" ? (initial.denied_tools || []) : null,
      fallback_models: (initial.fallback_models && initial.fallback_models.length > 0) ? initial.fallback_models : null,
      heartbeat_mode: initial.heartbeat_mode,
      idle_timeout_ms: initial.heartbeat_mode === "idle" ? initial.idle_timeout_ms : null,
      identity_md: initial.identity_md || defaultIdentity,
      user_md: initial.user_md || null,
      soul_md: initial.soul_md || null,
      agents: initial.enable_multi_agent && initial.agent_configs ? initial.agent_configs.map((a: any) => ({
        id: a.id,
        name: a.name,
        model: a.model,
        fallback_models: (a.fallback_models && a.fallback_models.length > 0) ? a.fallback_models : null,
        skills: (a.skills && a.skills.length > 0) ? a.skills : null,
        vibe: a.vibe,
        identity_md: a.identity_md || `# IDENTITY.md - Who Am I?
- **Name:** ${a.name}
- **Vibe:** ${a.vibe}
- **Emoji:** ${a.emoji || "🦞"}
---
Managed by ClawSetup.`,
        user_md: a.user_md || null,
        soul_md: a.soul_md || null
      })) : null,
      preserve_state: isPaired
    };
  }

  function constructConfigPayload() {
    const mappedSandboxMode = sandboxMode === "full" ? "all" : (sandboxMode === "partial" ? "non-main" : "off");
    const defaultIdentity = `# IDENTITY.md - Who Am I?
- **Name:** ${agentName}
- **Vibe:** ${agentVibe}
- **Emoji:** ${agentEmoji}
---
Managed by ClawSetup.`;

    return {
        provider,
        api_key: apiKey,
        auth_method: authMethod,
        model,
        user_name: userName,
        agent_name: agentName,
        agent_vibe: agentVibe,
        telegram_token: telegramToken,
        gateway_port: gatewayPort,
        gateway_bind: gatewayBind,
        gateway_auth_mode: gatewayAuthMode,
        tailscale_mode: tailscaleMode,
        node_manager: nodeManager,
        skills: selectedSkills,
        service_keys: serviceKeys,
        sandbox_mode: mode === "advanced" ? mappedSandboxMode : null,
        tools_mode: mode === "advanced" ? toolsMode : null,
        allowed_tools: mode === "advanced" && toolsMode === "allowlist" ? allowedTools : null,
        denied_tools: mode === "advanced" && toolsMode === "denylist" ? deniedTools : null,
        fallback_models: mode === "advanced" && enableFallbacks ? fallbackModels.filter(m => m) : null,
        heartbeat_mode: mode === "advanced" ? heartbeatMode : null,
        idle_timeout_ms: mode === "advanced" && heartbeatMode === "idle" ? idleTimeoutMs : null,
        identity_md: (mode === "advanced" && identityMd) ? identityMd : defaultIdentity,
        user_md: mode === "advanced" && userMd ? userMd : null,
        soul_md: mode === "advanced" && soulMd ? soulMd : null,
        agents: enableMultiAgent ? agentConfigs.map(a => ({
          id: a.id,
          name: a.name,
          model: a.model,
          fallback_models: a.fallbackModels.length > 0 ? a.fallbackModels : null,
          skills: a.skills.length > 0 ? a.skills : null,
          vibe: a.vibe,
          identity_md: a.identityMd || `# IDENTITY.md - Who Am I?
- **Name:** ${a.name}
- **Vibe:** ${a.vibe}
- **Emoji:** ${a.emoji || "🦞"}
---
Managed by ClawSetup.`,
          user_md: a.userMd || null,
          soul_md: a.soulMd || null
        })) : null,
        preserve_state: isPaired
    };
  }

  async function handleInstall() {
    setLoading(true);
    setError(false);
    
    const isUpdate = !!initialConfigRef.current;
    setProgress(isUpdate ? "Applying changes..." : "Starting setup...");

    const remoteConfig = targetEnvironment === "cloud" ? {
      ip: remoteIp,
      user: remoteUser,
      password: remotePassword || null,
      privateKeyPath: remotePrivateKeyPath || null
    } : null;

    // Check pairing status live before applying config to ensure we don't overwrite it
    let actualIsPaired = isPaired;
    if (checks.openclaw || isUpdate) {
      try {
        const status: boolean = await invoke("check_pairing_status", { remote: remoteConfig });
        if (status) {
          actualIsPaired = true;
          setIsPaired(true);
        }
      } catch (e) {
        console.warn("Pre-install pairing check failed:", e);
      }
    }

    const configPayload = constructConfigPayload();
    // Ensure we preserve state if we found it was paired
    configPayload.preserve_state = actualIsPaired;

    if (initialConfigRef.current) {
        const initialPayload = transformInitialToPayload(initialConfigRef.current);
        if (isDeepEqual(initialPayload, configPayload)) {
             setProgress("Configuration unchanged.");
             setTimeout(() => {
                 setLoading(false);
                 setStep(17);
             }, 500);
             return;
        }
    }

    try {
      if (targetEnvironment === "cloud") {
        // Remote installation flow
        setProgress(isUpdate ? "Updating remote configuration..." : "Deploying to remote server...");
        setLogs(isUpdate ? "Updating remote configuration..." : "Preparing remote environment...");

        await invoke("setup_remote_openclaw", {
          remote: remoteConfig,
          config: configPayload
        });

        // Install skills on remote server
        for (const skill of selectedSkills) {
          setProgress(`Installing skill on remote: ${skill}...`);
          setLogs(`Installing skill: ${skill}...`);
          try {
            await invoke("install_remote_skill", {
              remote: remoteConfig,
              name: skill
            });
          } catch (e) {
            console.error(`Failed to install skill ${skill}:`, e);
            setLogs(prev => prev + `\nWarning: Failed to install skill ${skill}: ${e}`);
          }
        }

        setProgress("Establishing SSH tunnel...");
        setLogs("Creating SSH tunnel to remote gateway...");
        try {
          await invoke("start_ssh_tunnel", { remote: remoteConfig });
        } catch (e: any) {
          if (String(e).includes("SSH tunnel is already running")) {
            setLogs(prev => prev + "\nTunnel already active.");
          } else {
            throw e;
          }
        }
        setTunnelActive(true);

        // Verify tunnel is working with HTTP connectivity test
        setProgress("Verifying tunnel connectivity...");
        try {
          const tunnelWorking: boolean = await invoke("verify_tunnel_connectivity", {
            remote: remoteConfig
          });
          if (!tunnelWorking) {
            // If we get here with the new binary, verify_tunnel_connectivity should have returned Err, not Ok(false).
            // So if we get Ok(false), it means we are definitely running the old binary.
            throw new Error("Backend update pending. Please restart the application (Ctrl+C and npm run tauri dev) to apply the latest fixes.");
          }
        } catch (e) {
          setProgress("");
          const errStr = String(e);
          if (errStr.includes("Backend update pending")) {
             setLogs("Error: " + errStr);
          } else {
             setLogs("Error: Tunnel verification failed - " + errStr);
          }
          setError(true);
          setTunnelActive(false);
          setLoading(false);
          return;
        }

        setProgress("Finalizing setup...");
        if (!actualIsPaired) {
          const instruction: string = await invoke("generate_pairing_code");
          setPairingCode(instruction);
        }

        // Get dashboard URL (tunneled)
        const url: string = await invoke("get_dashboard_url", {
          isRemote: true,
          remote: remoteConfig
        });
        setDashboardUrl(url);

        setProgress("");
        setStep(17);
      } else {
        // Local installation flow
        setProgress("Installing OpenClaw (this may take a minute)...");
        setLogs("Installing OpenClaw (this may take a minute)...");
        if (!checks.openclaw) {
          await invoke("install_openclaw");
          const version: string = await invoke("get_openclaw_version");
          setOpenClawVersion(version);
        }

        setProgress("Configuring agent...");
        setLogs("Configuring...");

        await invoke("configure_agent", {
          config: configPayload
        });

        for (const skill of selectedSkills) {
          setProgress(`Installing skill: ${skill}...`);
          setLogs(`Installing skill: ${skill}...`);
          try {
            await invoke("install_skill", { name: skill });
          } catch (e) {
            console.error(`Failed to install skill ${skill}:`, e);
            setLogs(prev => prev + `\nWarning: Failed to install skill ${skill}: ${e}`);
          }
        }

        setProgress("Starting Gateway (this may take 20-30 seconds)...");
        setLogs("Starting Gateway...");
        await invoke("start_gateway");

        setProgress("Finalizing setup...");
        if (!actualIsPaired) {
          const instruction: string = await invoke("generate_pairing_code");
          setPairingCode(instruction);
        }

        const url: string = await invoke("get_dashboard_url", {
          isRemote: false,
          remote: null
        });
        setDashboardUrl(url);

        setProgress("");
        setStep(17);
      }
    } catch (e) {
      setProgress("");
      setLogs("Error: " + e);
      setError(true);
    }
    setLoading(false);
  }

  async function handlePairing() {
    if (!pairingInput) return;
    setPairingStatus("Verifying...");
    try {
      const remoteConfig = targetEnvironment === "cloud" ? {
        ip: remoteIp,
        user: remoteUser,
        password: remotePassword || null,
        privateKeyPath: remotePrivateKeyPath || null
      } : null;

      await invoke("approve_pairing", {
        code: pairingInput,
        remote: remoteConfig
      });
      setPairingStatus("✅ Success! Bot paired.");
      setIsPaired(true);
      setPairingInput("");
    } catch (e) {
      setPairingStatus("❌ Error: " + e);
    }
  }

  async function handleMaintenanceAction(action: string) {
    setLoading(true);
    setMaintenanceStatus(`Running ${action}...`);
    setLogs(`Starting maintenance: ${action}...\n`);
    try {
      let res: string;

      // Build remote config if cloud environment
      const remoteConfig = targetEnvironment === "cloud" && sshStatus === "success" ? {
        ip: remoteIp,
        user: remoteUser,
        password: remotePassword || null,
        privateKeyPath: remotePrivateKeyPath || null
      } : null;

      if (action === "repair") {
        res = remoteConfig
          ? await invoke("run_remote_doctor_repair", { remote: remoteConfig })
          : await invoke("run_doctor_repair");
        setMaintenanceStatus(`✅ Repair completed successfully.`);
      } else if (action === "audit") {
        res = remoteConfig
          ? await invoke("run_remote_security_audit_fix", { remote: remoteConfig })
          : await invoke("run_security_audit_fix");
        setMaintenanceStatus(`✅ Security Audit completed successfully.`);
      } else if (action === "update") {
        if (remoteConfig) {
           res = await invoke("update_remote_openclaw", { remote: remoteConfig });
           setMaintenanceStatus(`✅ Remote OpenClaw updated.`);
        } else {
           res = await invoke("install_openclaw"); // Re-run install to update
           setMaintenanceStatus(`✅ OpenClaw updated.`);
        }
      } else {
        res = remoteConfig
          ? await invoke("uninstall_remote_openclaw", { remote: remoteConfig })
          : await invoke("uninstall_openclaw");
        // Reset everything after uninstall
        setChecks(prev => ({ ...prev, openclaw: false }));
        setMaintenanceStatus(`✅ Uninstall completed successfully.`);
      }
      setLogs(prev => prev + (res || ""));
      setMaintCompleted(true);
    } catch (e) {
      setLogs(prev => prev + `\nError: ${e}`);
      setMaintenanceStatus(`❌ ${action} failed.`);
    }
    setLoading(false);
  }

  async function loadExistingConfig() {
    setLoading(true);
    setMaintenanceStatus("Loading existing configuration...");
    try {
      const remoteConfig = targetEnvironment === "cloud" ? {
        ip: remoteIp,
        user: remoteUser,
        password: remotePassword || null,
        privateKeyPath: remotePrivateKeyPath || null
      } : null;

      const config: any = await invoke("get_current_config", { remote: remoteConfig });
      initialConfigRef.current = config;
      
      // Populate state
      setProvider(config.provider);
      setApiKey(config.api_key);
      setAuthMethod(config.auth_method);
      setModel(config.model);
      setUserName(config.user_name);
      setAgentName(config.agent_name);
      setAgentVibe(config.agent_vibe);
      setAgentEmoji(config.agent_emoji || "🦞");
      setTelegramToken(config.telegram_token);
      
      setGatewayPort(config.gateway_port);
      setGatewayBind(config.gateway_bind);
      setGatewayAuthMode(config.gateway_auth_mode);
      setTailscaleMode(config.tailscale_mode);
      setNodeManager(config.node_manager);
      
      setSelectedSkills(config.skills);
      // Service keys might be partial, merge them?
      setServiceKeys(config.service_keys);
      
      setSandboxMode(config.sandbox_mode);
      setToolsMode(config.tools_mode);
      setAllowedTools(config.allowed_tools);
      setDeniedTools(config.denied_tools);
      
      setFallbackModels(config.fallback_models);
      setEnableFallbacks(config.fallback_models.length > 0);
      
      setHeartbeatMode(config.heartbeat_mode);
      setIdleTimeoutMs(config.idle_timeout_ms);
      
      setIdentityMd(config.identity_md);
      setUserMd(config.user_md);
      setSoulMd(config.soul_md);
      setInitialWorkspace({
        identity: config.identity_md,
        user: config.user_md,
        soul: config.soul_md
      });

      setEnableMultiAgent(config.enable_multi_agent);
      if (config.enable_multi_agent && config.agent_configs) {
          setNumAgents(config.agent_configs.length);
          setAgentConfigs(config.agent_configs.map((a: any) => ({
              id: a.id,
              name: a.name,
              model: a.model,
              fallbackModels: a.fallback_models || [],
              skills: a.skills || [],
              vibe: a.vibe,
              emoji: a.emoji || "🦞",
              identityMd: a.identity_md || "",
              userMd: a.user_md || "",
              soulMd: a.soul_md || ""
          })));
      }

      if (config.is_paired !== undefined) {
        setIsPaired(config.is_paired);
      }

      setMaintenanceStatus("✅ Configuration loaded.");
      setMode("advanced"); // Switch to advanced mode to show all settings
      return true;
    } catch (e) {
      console.error("Failed to load config:", e);
      setMaintenanceStatus(`❌ Failed to load config: ${e}`);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleTunnel() {
    setLoading(true);
    if (tunnelActive) {
      try {
        await invoke("stop_ssh_tunnel");
        setTunnelActive(false);
        setMaintenanceStatus("✅ SSH Tunnel disconnected.");
      } catch (e) {
        setMaintenanceStatus(`❌ Failed to stop tunnel: ${e}`);
      }
    } else {
      setMaintenanceStatus("Establishing SSH tunnel...");
      try {
        const remote = { 
          ip: remoteIp, 
          user: remoteUser, 
          password: remotePassword || null, 
          privateKeyPath: remotePrivateKeyPath || null 
        };
        await invoke("start_ssh_tunnel", { remote });
        setTunnelActive(true);
        setMaintenanceStatus("✅ SSH Tunnel established on port 18789.");
      } catch (e) {
        setMaintenanceStatus(`❌ Failed to establish tunnel: ${e}`);
      }
    }
    setLoading(false);
  }

  const toggleSkill = (id: string) => {
    setSelectedSkills(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const getStepStatus = (stepId: number) => {
    if (step === stepId) return "active";
    if (step > stepId) return "completed";
    return "";
  };



  const currentPayload = constructConfigPayload();
  const initialPayload = transformInitialToPayload(initialConfigRef.current);
  const hasChanges = !initialConfigRef.current || !isDeepEqual(initialPayload, currentPayload);

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="step-view">
            <h2>Welcome Back</h2>
            <p className="step-description">
              OpenClaw is already installed {targetEnvironment === "cloud" ? `on ${remoteIp}` : "on your system"}. What would you like to do?
            </p>

            {/* Quick Action Buttons */}
            <div className="button-group" style={{gap: "10px", marginBottom: "2rem"}}>
              <button
                className="primary"
                style={{flex: 1}}
                onClick={async () => {
                  try {
                    const url: string = await invoke("get_dashboard_url", {
                      isRemote: targetEnvironment === "cloud",
                      remote: targetEnvironment === "cloud" ? {
                        ip: remoteIp,
                        user: remoteUser,
                        password: remotePassword || null,
                        privateKeyPath: remotePrivateKeyPath || null
                      } : null
                    });
                    await open(url);
                  } catch (e) {
                    setMaintenanceStatus(`❌ Failed to get dashboard URL: ${e}`);
                  }
                }}
                disabled={targetEnvironment === "cloud" && !tunnelActive}
              >
                🌐 Open Dashboard
              </button>

              {targetEnvironment === "cloud" && (
                <button
                  className="secondary"
                  style={{flex: 1}}
                  onClick={async () => {
                    if (tunnelActive) {
                      // Stop tunnel
                      try {
                        await invoke("stop_ssh_tunnel");
                        setTunnelActive(false);
                        setMaintenanceStatus("✅ SSH tunnel stopped.");
                      } catch (e) {
                        setMaintenanceStatus(`❌ Failed to stop tunnel: ${e}`);
                      }
                    } else {
                      // Start tunnel - check if we have SSH config
                      if (!remoteIp || !remoteUser) {
                        setMaintenanceStatus("❌ SSH configuration missing. Please reconfigure to set up remote connection.");
                        return;
                      }

                      try {
                        // Test connection first if not already successful
                        if (sshStatus !== "success") {
                          setMaintenanceStatus("Testing SSH connection...");
                          await invoke("test_ssh_connection", {
                            remote: {
                              ip: remoteIp,
                              user: remoteUser,
                              password: remotePassword || null,
                              privateKeyPath: remotePrivateKeyPath || null
                            }
                          });
                          setSshStatus("success");
                        }

                        // Establish tunnel
                        setMaintenanceStatus("Establishing SSH tunnel...");
                        await invoke("start_ssh_tunnel", {
                          remote: {
                            ip: remoteIp,
                            user: remoteUser,
                            password: remotePassword || null,
                            privateKeyPath: remotePrivateKeyPath || null
                          }
                        });
                        setTunnelActive(true);
                        setMaintenanceStatus("✅ SSH tunnel established successfully. Dashboard is now accessible.");
                      } catch (e) {
                        const friendlyError = formatSshError(String(e));
                        setMaintenanceStatus(`❌ Failed to establish tunnel: ${friendlyError}`);
                        setSshStatus("idle");
                      }
                    }
                  }}
                >
                  {tunnelActive ? "🔓 Stop SSH Tunnel" : "🔒 Establish SSH Tunnel"}
                </button>
              )}
            </div>

            {/* Maintenance Options */}
            <h3 style={{marginBottom: "1rem"}}>Maintenance Options</h3>
            <div className="mode-card-container" style={{gridTemplateColumns: "1fr", gap: "1rem"}}>
              <div
                className={`mode-card ${selectedMaint === "repair" ? "active" : ""}`}
                onClick={() => !loading && setSelectedMaint("repair")}
              >
                <h3>🛠 Repair System</h3>
                <p>Run <code>openclaw doctor --repair</code> to fix configuration and service issues.</p>
              </div>

              <div
                className={`mode-card ${selectedMaint === "audit" ? "active" : ""}`}
                onClick={() => !loading && setSelectedMaint("audit")}
              >
                <h3>🛡 Security Audit</h3>
                <p>Run <code>openclaw security audit --fix</code> to audit and tighten system permissions.</p>
              </div>

              <div 
                className={`mode-card ${selectedMaint === "update" ? "active" : ""}`} 
                onClick={() => !loading && setSelectedMaint("update")}
              >
                <h3>🚀 Upgrade OpenClaw Version</h3>
                <p>Upgrade to the latest version of OpenClaw.</p>
              </div>

              <div
                className={`mode-card ${selectedMaint === "reconfigure" ? "active" : ""}`}
                onClick={() => !loading && setSelectedMaint("reconfigure")}
              >
                <h3>⚙️ Reconfigure OpenClaw</h3>
                <p>Proceed to the standard setup wizard to re-configure your agent and channels.</p>
              </div>

              <div
                className={`mode-card ${selectedMaint === "uninstall" ? "active" : ""}`}
                style={selectedMaint === "uninstall" ? {borderColor: "var(--error)", backgroundColor: "rgba(239, 68, 68, 0.05)"} : {}}
                onClick={() => !loading && setSelectedMaint("uninstall")}
              >
                <h3 style={selectedMaint === "uninstall" ? {color: "var(--error)"} : {}}>🗑 Uninstall Completely</h3>
                <p>Remove the OpenClaw CLI and all {targetEnvironment === "local" ? "local" : "remote"} configuration/data files.</p>
              </div>
            </div>

            {!loading && (
              <div className="button-group" style={{gap: "10px", marginTop: "1.5rem"}}>
                <button
                  className="primary"
                  style={{flex: 1}}
                  onClick={async () => {
                    if (selectedMaint === "reconfigure") {
                      // Load existing config first
                      const loaded = await loadExistingConfig();
                      if (loaded) {
                         // Go to Configuration Mode (Step 3 or 5 depending on preference)
                         // Step 3 is security check, usually good to show again.
                         setMode("advanced"); setStep(6); 
                      }
                    } else if (selectedMaint === "uninstall") {
                      if (confirm("Are you absolutely sure you want to completely remove OpenClaw and all its data?")) {
                        handleMaintenanceAction("uninstall");
                      }
                    } else if (selectedMaint) {
                      handleMaintenanceAction(selectedMaint);
                    }
                  }}
                  disabled={!selectedMaint}
                >
                  Confirm Action
                </button>
                {maintCompleted && (
                  <button className="secondary" style={{flex: 1}} onClick={() => invoke("close_app")}>Exit Setup</button>
                )}
              </div>
            )}

            {maintenanceStatus && (
              <div className="progress-container" style={{marginTop: "2rem"}}>
                <p style={{fontSize: "0.9rem", color: maintenanceStatus.includes("❌") ? "var(--error)" : maintenanceStatus.includes("✅") ? "var(--success)" : "var(--primary)"}}>{maintenanceStatus}</p>
                <div className="logs-container">
                  <pre>{logs}</pre>
                </div>
              </div>
            )}
          </div>
        );
      case 0.5:
        return (
          <div className="step-view welcome-view">
            <div className="welcome-logo">🦞</div>
            <h1 className="welcome-title">Welcome to ClawSetup</h1>
            <p className="welcome-text">
              The fastest way to deploy your AI agent. Get started in minutes.
            </p>
            <div className="button-group" style={{justifyContent: "center"}}>
              <button 
                className="primary" 
                style={{minWidth: "200px", padding: "1rem 2rem", fontSize: "1.1rem"}}
                onClick={() => setStep(1)}
              >
                Start Setup
              </button>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="step-view">
            <h2>Target Environment</h2>
            <p className="step-description">Where will you be running OpenClaw?</p>
            <div className="mode-card-container">
              <div className={`mode-card ${targetEnvironment === "local" ? "active" : ""}`} onClick={() => {
                setTargetEnvironment("local");
                setSshStatus("idle");
              }}>
                <h3>💻 Local Machine</h3>
                <p>Run OpenClaw directly on your computer (macOS/Linux/Windows)</p>
              </div>
              <div className={`mode-card ${targetEnvironment === "cloud" ? "active" : ""}`} onClick={() => setTargetEnvironment("cloud")}>
                <h3>☁️ Cloud Server</h3>
                <p>Deploy to a cloud VM (AWS, GCP, Azure, etc.)</p>
              </div>
            </div>

            {targetEnvironment === "cloud" && (
              <div className="remote-config" style={{marginTop: "2rem"}}>
                <h3 style={{marginBottom: "1rem"}}>SSH Configuration</h3>
                <div className="form-group">
                  <label>Server IP Address</label>
                  <input
                    placeholder="192.168.1.100"
                    value={remoteIp}
                    onChange={(e) => setRemoteIp(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>SSH Username</label>
                  <input
                    placeholder="ubuntu"
                    value={remoteUser}
                    onChange={(e) => setRemoteUser(e.target.value)}
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </div>
                <div className="form-group">
                  <label>SSH Private Key (Optional)</label>
                  <div style={{display: "flex", gap: "0.5rem"}}>
                    <input
                      placeholder="/Users/you/.ssh/id_rsa"
                      value={remotePrivateKeyPath}
                      onChange={(e) => setRemotePrivateKeyPath(e.target.value)}
                      style={{flex: 1}}
                    />
                    <button
                      className="secondary"
                      onClick={async () => {
                        const path = await openDialog({
                          title: "Select SSH Private Key",
                          directory: false,
                          multiple: false,
                          defaultPath: "~/.ssh",
                        });
                        if (path && typeof path === "string") {
                          setRemotePrivateKeyPath(path);
                        }
                      }}
                    >
                      Browse
                    </button>
                  </div>
                  <p className="input-hint">Leave empty to use default keys (~/.ssh/id_rsa, id_ed25519) or SSH agent</p>
                </div>
                <div className="form-group">
                  <label>SSH Password (if not using key)</label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={remotePassword}
                    onChange={(e) => setRemotePassword(e.target.value)}
                  />
                </div>

                <button
                  className="secondary"
                  onClick={handleSshCheck}
                  disabled={!remoteIp || !remoteUser || sshStatus === "checking"}
                  style={{width: "100%", marginTop: "1rem"}}
                >
                  {sshStatus === "checking" ? "Testing..." : "Test Connection"}
                </button>

                {sshStatus === "success" && (
                  <div style={{marginTop: "1rem", padding: "0.75rem", backgroundColor: "rgba(34, 197, 94, 0.1)", borderRadius: "8px", border: "1px solid rgba(34, 197, 94, 0.3)"}}>
                    <strong style={{color: "rgb(34, 197, 94)"}}>✅ Success:</strong> <span style={{color: "var(--text)"}}>SSH connection established successfully!</span>
                  </div>
                )}

                {sshError && (
                  <div className="error" style={{marginTop: "1rem", padding: "0.75rem", backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.3)"}}>
                    <strong style={{color: "rgb(239, 68, 68)"}}>❌ Error:</strong> <span style={{color: "var(--text)"}}>{sshError}</span>
                  </div>
                )}
              </div>
            )}

            <div className="button-group" style={{marginTop: "2rem"}}>
              <button
                className="primary"
                onClick={async () => {
                  if (targetEnvironment === "cloud") {
                    const redirected = await checkRemoteSystem(false);
                    if (!redirected) {
                      setStep(2);
                    }
                  } else {
                    // Local environment - check local system and redirect if installed
                    const redirected = await checkSystem(false);
                    if (!redirected) {
                      setStep(2);
                    }
                  }
                }}
                disabled={targetEnvironment === "cloud" && sshStatus !== "success"}
              >
                Continue
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-view">
            <h2>System Check</h2>
            <p className="step-description">
              {targetEnvironment === "cloud"
                ? `Checking remote server (${remoteIp})...`
                : "We need to make sure your system is ready for OpenClaw."}
            </p>
            <div className="check-item">
              <span className="check-status">{checks.node ? "✅" : "❌"}</span>
              Node.js {checks.node ? "detected" : "not found"} {targetEnvironment === "cloud" && `(on ${remoteIp})`}
            </div>
            <div className="check-item">
              <span className="check-status">{checks.openclaw ? "✅" : "⏳"}</span>
              OpenClaw {checks.openclaw ? "Installed" : "Ready to install"} {targetEnvironment === "cloud" && `(on ${remoteIp})`}
            </div>
            {!checks.node && (
              <div className="error" style={{marginTop: "1rem", color: "var(--error)"}}>
                <p>Node.js is required.</p>
                {targetEnvironment === "local" && (
                   <div style={{display: "flex", gap: "10px", alignItems: "center", marginTop: "5px"}}>
                     <button
                       className="secondary small"
                       onClick={installLocalNode}
                       disabled={installingNode}
                       style={{padding: "4px 10px", fontSize: "0.8rem", cursor: "pointer"}}
                     >
                       {installingNode ? "Installing..." : "Install Now"}
                     </button>
                     {nodeInstallError && <span style={{fontSize: "0.8rem"}}>{nodeInstallError}</span>}
                   </div>
                )}
                {targetEnvironment === "cloud" && (
                   <p>It will be installed automatically in the Setup step.</p>
                )}
              </div>
            )}
            <div className="button-group">
              <button 
                className="primary" 
                disabled={targetEnvironment === "local" && !checks.node} 
                onClick={() => setStep(3)}
              >
                Continue
              </button>
              <button className="secondary" onClick={() => setStep(1)}>Back</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-view">
            <h2>Security Baseline</h2>
            <p className="step-description">Please read this carefully before proceeding.</p>
            <div className="security-alert">
              <p>OpenClaw is a powerful agent system that can execute code and manage files.</p>
              <p>A malicious prompt could potentially trick the agent into performing unsafe actions. We recommend running it in a sandboxed environment if possible.</p>
              <p>Keep your API keys secure and never share your gateway token.</p>
            </div>
            <p style={{fontWeight: 600}}>Do you understand the risks and wish to continue?</p>
            <div className="button-group">
              <button className="primary" onClick={() => setStep(5)}>I Understand</button>
              <button className="secondary" onClick={() => setStep(2)}>Back</button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="step-view">
            <h2>Your Identity</h2>
            <p className="step-description">What should the agent call you?</p>
            <div className="form-group">
              <label>Your Name</label>
              <input 
                autoFocus 
                autoCapitalize="none" 
                autoCorrect="off" 
                spellCheck="false" 
                autoComplete="off" 
                placeholder="e.g. David" 
                value={userName} 
                onChange={(e) => {
                  const val = e.target.value;
                  setUserName(val);
                  if (userMd) {
                    setUserMd(updateIdentityField(userMd, "Name", val));
                  }
                  if (soulMd) {
                    setSoulMd(updateSoulMission(soulMd, val));
                  }
                }} 
              />
            </div>
            <div className="button-group">
              <button className="primary" disabled={!userName} onClick={() => setStep(6)}>Next</button>
              <button className="secondary" onClick={() => setStep(3)}>Back</button>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="step-view">
            <h2>Agent Profile</h2>
            <p className="step-description">Give your agent a name and a personality.</p>
            <div className="form-group">
              <label>Agent Name</label>
              <input autoFocus placeholder="e.g. Jeeves" value={agentName} onChange={(e) => {
                const val = e.target.value;
                setAgentName(val);
                if (identityMd) {
                  setIdentityMd(updateIdentityField(identityMd, "Name", val));
                }
              }} />
            </div>
            <div className="form-group">
              <label>Agent Emoji</label>
              <div className="emoji-grid" style={{display: "flex", gap: "0.5rem", flexWrap: "wrap"}}>
                {EMOJI_OPTIONS.map(e => (
                  <button 
                    key={e}
                    className={`emoji-btn`}
                    onClick={() => {
                      setAgentEmoji(e);
                      if (identityMd) {
                        setIdentityMd(updateIdentityField(identityMd, "Emoji", e));
                      }
                    }}
                    style={{
                      fontSize: "1.25rem", 
                      padding: "0.4rem", 
                      borderRadius: "8px", 
                      border: agentEmoji === e ? "2px solid var(--primary)" : "1px solid var(--border)",
                      background: agentEmoji === e ? "rgba(255, 75, 43, 0.1)" : "var(--bg-card)",
                      cursor: "pointer",
                      minWidth: "40px"
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Agent Vibe</label>
              <RadioCard
                value={agentVibe}
                onChange={(val) => {
                  setAgentVibe(val);
                  if (identityMd) {
                    setIdentityMd(updateIdentityField(identityMd, "Vibe", val));
                  }
                }}
                columns={2}
                options={[
                  { value: "Professional", label: "Professional" },
                  { value: "Friendly", label: "Friendly" },
                  { value: "Chaos", label: "Chaos" },
                  { value: "Helpful Assistant", label: "Helpful Assistant" }
                ]}
              />
            </div>
            <div className="button-group">
              <button className="primary" disabled={!agentName} onClick={() => setStep(8)}>Next</button>
              <button className="secondary" onClick={() => setStep(skipBasicConfig ? 0 : 5)}>Back</button>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="step-view">
            <h2>Gateway Settings</h2>
            <p className="step-description">Configure the network bridge for your agent.</p>
            <div className="form-group">
              <label>Port</label>
              <input type="number" value={gatewayPort} onChange={(e) => setGatewayPort(parseInt(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Bind Address</label>
              <RadioCard
                value={gatewayBind}
                onChange={setGatewayBind}
                columns={2}
                options={[
                  { value: "loopback", label: "Loopback (127.0.0.1)", description: "Only accessible from this machine" },
                  { value: "all", label: "All Interfaces (0.0.0.0)", description: "Accessible from local network" }
                ]}
              />
            </div>
            <div className="form-group" style={{marginTop: "1.5rem"}}>
              <label>Auth Mode</label>
              <RadioCard
                value={gatewayAuthMode}
                onChange={setGatewayAuthMode}
                columns={2}
                options={[
                  { value: "token", label: "Token (Secure)", description: "Requires authentication token" },
                  { value: "none", label: "None (Insecure)", description: "No authentication required" }
                ]}
              />
            </div>
            <div className="form-group" style={{marginTop: "1.5rem"}}>
              <label>Tailscale</label>
              <RadioCard
                value={tailscaleMode}
                onChange={setTailscaleMode}
                columns={2}
                options={[
                  { value: "off", label: "Disabled", description: "Standard networking" },
                  { value: "on", label: "Enabled", description: "Expose securely via Tailscale" }
                ]}
              />
            </div>
            <div className="button-group">
              <button className="primary" onClick={() => {
                setStep(10);
              }}>Continue</button>
              <button className="secondary" onClick={() => setStep(6)}>Back</button>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="step-view">
            <h2>Connect Brain</h2>
            <p className="step-description">Select your AI provider and authentication method.</p>
            
            <div className="form-group">
              <label>AI Provider</label>
              <div style={{maxHeight: "300px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "12px", padding: "0.5rem"}}>
                <RadioCard
                  value={provider}
                  onChange={(p) => {
                    setProvider(p);
                    if (MODELS_BY_PROVIDER[p] && MODELS_BY_PROVIDER[p].length > 0) {
                      setModel(MODELS_BY_PROVIDER[p][0].value);
                    }
                  }}
                  columns={2}
                  options={[
                    // Core providers
                    { value: "anthropic", label: "Anthropic", icon: PROVIDER_LOGOS["anthropic"] },
                    { value: "openai", label: "OpenAI", icon: PROVIDER_LOGOS["openai"] },
                    { value: "google", label: "Google Gemini", icon: PROVIDER_LOGOS["google"] },
                    { value: "google-vertex", label: "Google Vertex AI", icon: PROVIDER_LOGOS["google-vertex"] },
                    { value: "openrouter", label: "OpenRouter", icon: PROVIDER_LOGOS["openrouter"] },
                    { value: "xai", label: "xAI (Grok)", icon: PROVIDER_LOGOS["xai"] },
                  ]}
                />
              </div>
            </div>
            
            <div className="form-group" style={{marginTop: "1.5rem"}}>
              <label>Auth Method</label>
              <RadioCard
                value={authMethod}
                onChange={setAuthMethod}
                columns={1}
                options={[
                  ...(provider === "anthropic" ? [
                    { value: "token", label: "Anthropic API Key", description: "Standard API Key starting with sk-ant-..." },
                    { value: "setup-token", label: "Anthropic Token (from setup-token)", description: "Temporary token from CLI setup" }
                  ] : []),
                  ...(provider === "google" ? [
                    { value: "token", label: "Google Gemini API Key", description: "Standard API Key" }
                  ] : []),
                  ...(provider === "openai" ? [
                    { value: "token", label: "OpenAI API Key", description: "Standard API Key starting with sk-..." }
                  ] : []),
                  ...(!["anthropic", "google", "openai"].includes(provider) ? [
                     { value: "token", label: "API Key (Standard)", description: "Standard API Key for this provider" }
                  ] : [])
                ]}
              />
            </div>

            <div className="form-group" style={{marginTop: "1.5rem"}}>
              <label>Primary Model</label>
              {MODELS_BY_PROVIDER[provider] ? (
                 <div style={{maxHeight: "300px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "12px", padding: "0.5rem"}}>
                   <RadioCard
                     value={model}
                     onChange={setModel}
                     columns={1}
                     options={MODELS_BY_PROVIDER[provider].map(m => ({ value: m.value, label: m.label, description: m.description }))}
                   />
                 </div>
              ) : (
                <RadioCard
                   value={model}
                   onChange={setModel}
                   columns={1}
                   options={provider === "ollama" ? [
                     { value: "ollama/llama3.1", label: "Llama 3.1 (Local)" },
                     { value: "ollama/deepseek-r1", label: "DeepSeek R1 (Local)" }
                   ] : [
                     { value: model, label: model }
                   ]}
                />
              )}
            </div>

              <div className="form-group" style={{marginTop: "1.5rem"}}>
                <label>{authMethod === "setup-token" ? "Anthropic Setup Token" : "API Key"}</label>
                <input 
                  type="password" 
                  placeholder="Paste here..." 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)} 
                />
                {authMethod === "setup-token" && (
                  <p className="input-hint">
                    Run <code>claude setup-token</code> in your terminal and paste the result here.
                  </p>
                )}
              </div>

            
            <p className="input-hint" style={{marginBottom: "1rem", textAlign: "center"}}>
              You can skip this for now and configure it later via 'Reconfigure'.
            </p>
            <div className="button-group">
              <button className="primary" onClick={() => setStep(9)}>Next</button>
              <button className="secondary" onClick={() => setStep(mode === "advanced" ? 7 : 6)}>Back</button>
            </div>
          </div>
        );
      case 9:
        return (
          <div className="step-view">
            <h2>Messaging Channels</h2>
            <p className="step-description">Connect your agent to Telegram for easy access.</p>
            <div className="form-group">
              <label>Telegram Bot Token</label>
              <input type="password" placeholder="123456:ABC-..." value={telegramToken} onChange={(e) => setTelegramToken(e.target.value)} />
              <p className="input-hint">Get one from @BotFather on Telegram.</p>
            </div>
            
            <div className="button-group">
              <button className="primary" onClick={() => {
                if (mode === "advanced" || skipBasicConfig) handleAdvancedTransition();
                else setStep(16);
              }} disabled={loading}>
                {mode === "advanced" ? "Continue" : "Next"}
              </button>
              <button className="secondary" onClick={() => setStep(8)} disabled={loading}>Back</button>
            </div>
          </div>
        );
      case 10:
        return (
          <div className="step-view">
            <h2>Runtime Environment</h2>
            <p className="step-description">Configure how the agent executes tools and skills.</p>
            <div className="form-group">
              <label>Node Package Manager</label>
              <RadioCard
                value={nodeManager}
                onChange={setNodeManager}
                columns={3}
                options={[
                  { value: "npm", label: "npm" },
                  { value: "pnpm", label: "pnpm" },
                  { value: "bun", label: "bun" }
                ]}
              />
            </div>
            <div className="button-group">
              <button className="primary" onClick={() => setStep(10.5)}>Next</button>
              <button className="secondary" onClick={() => {
                if (skipBasicConfig) {
                  setStep(7);
                } else {
                  setStep(9);
                }
              }}>Back</button>
            </div>
          </div>
        );
      case 11:
        return (
          <div className="step-view">
            <h2>Select Skills</h2>
            <p className="step-description">Enable capabilities and configure required keys.</p>
            <div className="skills-container" style={{maxHeight: "450px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "12px", padding: "0.5rem"}}>
              <div className="skills-grid">
                {availableSkills.map(skill => (
                  <div
                    key={skill.id}
                    className={`skill-card ${selectedSkills.includes(skill.id) ? "active" : ""}`}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).tagName === "INPUT") return;
                      toggleSkill(skill.id);
                    }}
                    style={{
                      cursor: "pointer", 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "0.5rem",
                      minHeight: "100px"
                    }}
                  >
                    <div className="skill-header" style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                      <div style={{display: "flex", alignItems: "center"}}>
                        {SKILL_ICONS[skill.id] && (
                          <img 
                            src={SKILL_ICONS[skill.id]} 
                            alt="" 
                            style={{
                              width: "20px", 
                              height: "20px", 
                              objectFit: "contain", 
                              borderRadius: "4px", 
                              backgroundColor: "white", 
                              padding: "2px",
                              marginRight: "8px"
                            }} 
                          />
                        )}
                        <div className="skill-name" style={{fontWeight: 700}}>{skill.name}</div>
                      </div>
                      <div className={`radio-circle ${selectedSkills.includes(skill.id) ? "checked" : ""}`} style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        border: `2px solid ${selectedSkills.includes(skill.id) ? "var(--primary)" : "var(--text-muted)"}`,
                        backgroundColor: selectedSkills.includes(skill.id) ? "var(--primary)" : "transparent",
                        flexShrink: 0
                      }} />
                    </div>
                    <div className="skill-desc" style={{fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: "1.4"}}>{skill.desc}</div>
                    
                    {skill.requiresAuth && selectedSkills.includes(skill.id) && (
                      <div className="skill-auth" style={{marginTop: "auto", paddingTop: "0.5rem"}}>
                        <input
                          type="password"
                          placeholder={skill.authPlaceholder || "API Key"}
                          value={serviceKeys[skill.id] || ""}
                          onChange={(e) => setServiceKeys({...serviceKeys, [skill.id]: e.target.value})}
                          onClick={(e) => e.stopPropagation()}
                          style={{width: "100%", fontSize: "0.8rem", padding: "0.5rem", borderRadius: "8px"}}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{marginTop: "1.5rem"}}>
              <button className="secondary" onClick={() => setShowCustomSkillForm(!showCustomSkillForm)}>
                {showCustomSkillForm ? "Hide" : "+ Add"} Custom Skill
              </button>
            </div>

            {showCustomSkillForm && (
              <div className="custom-skill-form" style={{marginTop: "1.5rem"}}>
                <div className="form-group">
                  <label>Skill Name</label>
                  <input
                    placeholder="my-custom-skill"
                    value={customSkillName}
                    onChange={e => setCustomSkillName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Skill Content (YAML + Markdown)</label>
                  <textarea
                    className="markdown-editor"
                    rows={8}
                    value={customSkillContent}
                    onChange={e => setCustomSkillContent(e.target.value)}
                    placeholder={`---\nname: My Custom Skill\ndescription: A useful skill\n---\n\n# Instructions\nAdd skill documentation here...`}
                  />
                </div>
                <button
                  className="primary"
                  disabled={!customSkillName || !customSkillContent}
                  onClick={async () => {
                    try {
                      await invoke("create_custom_skill", { name: customSkillName, content: customSkillContent });
                      setSelectedSkills([...selectedSkills, customSkillName]);
                      setCustomSkillName("");
                      setCustomSkillContent("");
                      setShowCustomSkillForm(false);
                    } catch (e) {
                      alert("Failed to create skill: " + e);
                    }
                  }}
                >
                  Save Custom Skill
                </button>
              </div>
            )}

            <div className="button-group">
              <button className="primary" onClick={() => {
                // Skip Step 11.5 as auth is handled inline
                if (mode === "advanced") {
                  setStep(12);
                } else {
                  handleInstall();
                }
              }}>Continue</button>
              <button className="secondary" onClick={() => setStep(10.5)}>Back</button>
            </div>
          </div>
        );
      case 11.5:
        return (
          <div className="step-view">
            <h2>Service Key: {servicesToConfigure[currentServiceIdx].name}</h2>
            <p className="step-description">Would you like to provide a key for this optional service now?</p>
            
            <div style={{marginBottom: "2rem"}}>
              <RadioCard
                value={isConfiguringService === true ? "yes" : "no"}
                onChange={(val) => setIsConfiguringService(val === "yes")}
                columns={2}
                options={[
                  { value: "yes", label: "Yes", description: `Configure ${servicesToConfigure[currentServiceIdx].name} now.` },
                  { value: "no", label: "Skip", description: "I'll configure this later in the dashboard." }
                ]}
              />
            </div>

            {isConfiguringService === true && (
              <div className="form-group animate-fadeIn">
                <label>{servicesToConfigure[currentServiceIdx].name} API Key</label>
                <input 
                  type="password" 
                  autoFocus
                  placeholder={servicesToConfigure[currentServiceIdx].placeholder} 
                  value={serviceKeys[servicesToConfigure[currentServiceIdx].id] || ""} 
                  onChange={(e) => setServiceKeys({...serviceKeys, [servicesToConfigure[currentServiceIdx].id]: e.target.value})} 
                />
              </div>
            )}

            <div className="button-group">
              <button
                className="primary"
                disabled={isConfiguringService === true && !serviceKeys[servicesToConfigure[currentServiceIdx].id]}
                onClick={() => {
                  const sid = servicesToConfigure[currentServiceIdx].id;
                  const newKeys = { ...serviceKeys };
                  if (!isConfiguringService) delete newKeys[sid];
                  setServiceKeys(newKeys);

                  if (currentServiceIdx < servicesToConfigure.length - 1) {
                    setCurrentServiceIdx(currentServiceIdx + 1);
                    setIsConfiguringService(false);
                  } else {
                    // After last service, go to Step 12 if advanced, otherwise install
                    if (mode === "advanced") {
                      setStep(12);
                    } else {
                      setStep(16);
                    }
                  }
                }}
              >
                {currentServiceIdx < servicesToConfigure.length - 1 ? "Next Service" : (mode === "advanced" ? "Continue to Advanced Settings" : "Next")}
              </button>
              <button className="secondary" onClick={() => {
                if (currentServiceIdx > 0) {
                  setCurrentServiceIdx(currentServiceIdx - 1);
                  setIsConfiguringService(serviceKeys[servicesToConfigure[currentServiceIdx - 1].id] ? true : false);
                } else {
                  setStep(11);
                }
              }} disabled={loading}>Back</button>
            </div>
          </div>
        );
      case 12:
        return (
          <div className="step-view">
            <h2>Security Configuration</h2>
            <p className="step-description">Configure security policies for your agent.</p>

            <div className="form-group">
              <label>Sandbox Mode</label>
              <RadioCard
                value={sandboxMode}
                onChange={setSandboxMode}
                columns={1}
                options={[
                  { value: "full", label: "Full Sandbox", description: "REQUIRES DOCKER! Select only if Docker is installed, otherwise this will break." },
                  { value: "partial", label: "Partial Sandbox", description: "Standard isolation." },
                  { value: "none", label: "No Sandbox", description: "Unrestricted access." }
                ]}
              />
            </div>

            <div className="form-group" style={{marginTop: "1.5rem"}}>
              <label>Tools Policy</label>
              <RadioCard
                value={toolsMode}
                onChange={setToolsMode}
                columns={1}
                options={[
                  { value: "allowlist", label: "Allowlist (Recommended)", description: "Only enable explicitly selected tools." },
                  { value: "denylist", label: "Denylist", description: "Block specific tools." },
                  { value: "all", label: "All Tools", description: "Enable all available tools." }
                ]}
              />
            </div>

            {toolsMode === "allowlist" && (
              <div className="form-group">
                <label>Allowed Tools</label>
                <div className="skills-grid">
                  {[
                    {id: "filesystem", name: "File System"},
                    {id: "terminal", name: "Terminal"},
                    {id: "browser", name: "Browser"},
                    {id: "network", name: "Network"}
                  ].map(tool => (
                    <div
                      key={tool.id}
                      className={`skill-card ${allowedTools.includes(tool.id) ? "active" : ""}`}
                      onClick={() => {
                        setAllowedTools(prev =>
                          prev.includes(tool.id)
                            ? prev.filter(t => t !== tool.id)
                            : [...prev, tool.id]
                        );
                      }}
                    >
                      <div className="skill-name">{tool.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="button-group">
              <button className="primary" onClick={() => setStep(13)}>Continue</button>
              <button className="secondary" onClick={() => setStep(11.5)}>Back</button>
            </div>
          </div>
        );
      case 13:
        return (
          <div className="step-view">
            <h2>Fallback Models</h2>
            <p className="step-description">Configure backup models for increased reliability.</p>

            <div className="mode-card-container">
              <div className={`mode-card ${enableFallbacks ? "active" : ""}`} onClick={() => setEnableFallbacks(true)}>
                <h3>Enable Fallbacks</h3>
                <p>Chain multiple models for automatic failover.</p>
              </div>
              <div className={`mode-card ${!enableFallbacks ? "active" : ""}`} onClick={() => setEnableFallbacks(false)}>
                <h3>No Fallbacks</h3>
                <p>Use only the primary model.</p>
              </div>
            </div>

            {enableFallbacks && (
              <>
                {[0, 1].map(idx => {
                  const currentModel = fallbackModels[idx] || "";
                  const currentProvider = currentModel.split('/')[0];
                  const needsAuth = currentProvider && currentProvider !== provider && !serviceKeys[currentProvider];
                  
                  return (
                    <div key={idx} className="form-group" style={{marginTop: "1.5rem", padding: "1rem", border: "1px solid var(--border)", borderRadius: "12px"}}>
                      <label>Fallback Model {idx + 1} {idx === 1 && "(Optional)"}</label>
                      
                      {/* Provider Selection */}
                      <label style={{fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem"}}>Provider</label>
                      <div style={{maxHeight: "200px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "12px", padding: "0.5rem", marginBottom: "1rem"}}>
                        <RadioCard
                          value={currentProvider || ""}
                          onChange={(newProv) => {
                            if (!newProv) return;
                            // Set default model for this provider
                            if (MODELS_BY_PROVIDER[newProv] && MODELS_BY_PROVIDER[newProv].length > 0) {
                              const newModels = [...fallbackModels];
                              newModels[idx] = MODELS_BY_PROVIDER[newProv][0].value;
                              setFallbackModels(newModels);
                            }
                          }}
                          columns={2}
                          options={Object.keys(MODELS_BY_PROVIDER).sort().map(p => ({
                            value: p,
                            label: p.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                            icon: PROVIDER_LOGOS[p]
                          }))}
                        />
                      </div>

                      {/* Model Selection */}
                      {currentProvider && MODELS_BY_PROVIDER[currentProvider] && (
                        <>
                          <label style={{fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem"}}>Model</label>
                          <div style={{maxHeight: "200px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "12px", padding: "0.5rem", marginBottom: "1rem"}}>
                            <RadioCard
                              value={currentModel}
                              onChange={(val) => {
                                const newModels = [...fallbackModels];
                                newModels[idx] = val;
                                setFallbackModels(newModels);
                              }}
                              columns={1}
                              options={MODELS_BY_PROVIDER[currentProvider].map(m => ({ value: m.value, label: m.label }))}
                            />
                          </div>
                        </>
                      )}

                      {/* Auth Selection */}
                      {currentModel && currentProvider && currentProvider !== provider && !["ollama"].includes(currentProvider) && (
                        <div style={{marginTop: "0.5rem"}}>
                          <label style={{fontSize: "0.85rem", color: "var(--text-muted)"}}>API Key for {currentProvider}</label>
                          <input
                            type="password"
                            placeholder={`API Key for ${currentProvider}`}
                            value={serviceKeys[currentProvider] || ""}
                            onChange={(e) => setServiceKeys({...serviceKeys, [currentProvider]: e.target.value})}
                            autoComplete="off"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            <div className="button-group">
              <button className="primary" onClick={() => setStep(14)}>Continue</button>
              <button className="secondary" onClick={() => setStep(12)}>Back</button>
            </div>
          </div>
        );
      case 14:
        return (
          <div className="step-view">
            <h2>Session Management</h2>
            <p className="step-description">Control when the agent resets context to save costs.</p>

            <div className="mode-card-container" style={{gridTemplateColumns: "1fr 1fr"}}>
              {[
                {mode: "1h", label: "Hourly", desc: "Reset every hour"},
                {mode: "4h", label: "4 Hours", desc: "Reset every 4 hours"},
                {mode: "24h", label: "Daily", desc: "Reset once per day"},
                {mode: "idle", label: "Idle Timeout", desc: "Reset after inactivity"},
                {mode: "never", label: "Never", desc: "Manual reset only"}
              ].map(item => (
                <div
                  key={item.mode}
                  className={`mode-card ${heartbeatMode === item.mode ? "active" : ""}`}
                  onClick={() => setHeartbeatMode(item.mode)}
                >
                  <h3>{item.label}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>

            {heartbeatMode === "idle" && (
              <div className="form-group" style={{marginTop: "1.5rem"}}>
                <label>Idle Timeout (minutes)</label>
                <input
                  type="number"
                  value={idleTimeoutMs / 60000}
                  onChange={e => setIdleTimeoutMs(Number(e.target.value) * 60000)}
                  min="1"
                  max="1440"
                />
                <p className="input-hint">Agent will reset context after this many minutes of inactivity.</p>
              </div>
            )}

            <div className="button-group">
              <button className="primary" onClick={() => setStep(15)}>Continue</button>
              <button className="secondary" onClick={() => setStep(13)}>Back</button>
            </div>
          </div>
        );
      case 15:
        return (
          <div className="step-view">
            <h2>Multiple Agents</h2>
            <p className="step-description">Configure multiple specialized agents with unique models and skills.</p>

            <div className="mode-card-container">
              <div className={`mode-card ${!enableMultiAgent ? "active" : ""}`} onClick={() => setEnableMultiAgent(false)}>
                <h3>Single Agent</h3>
                <p>Use one agent with the configured settings.</p>
              </div>
              <div className={`mode-card ${enableMultiAgent ? "active" : ""}`} onClick={() => setEnableMultiAgent(true)}>
                <h3>Multi-Agent</h3>
                <p>Configure multiple agents (2-5) with different configurations.</p>
              </div>
            </div>

            {enableMultiAgent && (
              <div className="form-group" style={{marginTop: "2rem"}}>
                <label>Number of Agents</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={numAgents}
                  onChange={(e) => {
                    const num = parseInt(e.target.value) || 1;
                    setNumAgents(Math.max(1, Math.min(5, num)));
                  }}
                  autoComplete="off"
                />
                <p className="input-hint">You can configure 1-5 specialized agents</p>
              </div>
            )}

            <div className="button-group">
              <button className="primary" onClick={() => {
                if (enableMultiAgent) {
                  // Only initialize agent configs if they don't exist or are empty
                  // This preserves configs loaded from reconfigure
                  if (agentConfigs.length === 0 || agentConfigs.length !== numAgents) {
                    const configs = Array.from({ length: numAgents }, (_, i) => {
                      // Check if we already have a config for this index (from loaded data)
                      const existingConfig = agentConfigs[i];
                      if (existingConfig && existingConfig.id) {
                        // Preserve existing config
                        return existingConfig;
                      }
                      // Create new default config
                      return {
                        id: `agent-${i + 1}`,
                        name: `Agent ${i + 1}`,
                        model: model, // Default to main model
                        fallbackModels: [],
                        skills: [], // Start empty
                        vibe: agentVibe,
                        emoji: agentEmoji,
                        identityMd: "",
                        userMd: "",
                        soulMd: ""
                      };
                    });
                    setAgentConfigs(configs);
                  }
                  setCurrentAgentConfigIdx(0);
                  setActiveWorkspaceTab("identity"); // Reset tab
                  setStep(15.5);
                } else {
                  setStep(16);
                }
              }} disabled={loading}>
                {enableMultiAgent ? "Continue" : "Next"}
              </button>
              <button className="secondary" onClick={() => setStep(14)} disabled={loading}>Back</button>
            </div>
          </div>
        );
      case 15.5:

        // Agent Configuration Loop
        if (!enableMultiAgent || currentAgentConfigIdx >= agentConfigs.length) {
          setStep(16);
          return null;
        }
        const currentAgent = agentConfigs[currentAgentConfigIdx];
        const currentAgentProvider = currentAgent.model.split('/')[0];

        return (
          <div className="step-view">
            <h2>Configure Agent {currentAgentConfigIdx + 1} of {agentConfigs.length}</h2>
            <p className="step-description">Set up the model, skills, and personality for {currentAgent.name || "this agent"}.</p>

            <div className="form-group">
              <label>Agent Name</label>
              <input
                value={currentAgent.name}
                onChange={(e) => {
                  const val = e.target.value;
                  const updated = [...agentConfigs];
                  updated[currentAgentConfigIdx].name = val;
                  if (updated[currentAgentConfigIdx].identityMd) {
                      updated[currentAgentConfigIdx].identityMd = updateIdentityField(updated[currentAgentConfigIdx].identityMd, "Name", val);
                  }
                  setAgentConfigs(updated);
                }}
                placeholder="e.g., CodeBot"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label>Agent Emoji</label>
              <div className="emoji-grid" style={{display: "flex", gap: "0.5rem", flexWrap: "wrap"}}>
                {EMOJI_OPTIONS.map(e => (
                  <button 
                    key={e}
                    className={`emoji-btn`}
                    onClick={() => {
                      const updated = [...agentConfigs];
                      updated[currentAgentConfigIdx].emoji = e;
                      if (updated[currentAgentConfigIdx].identityMd) {
                          updated[currentAgentConfigIdx].identityMd = updateIdentityField(updated[currentAgentConfigIdx].identityMd, "Emoji", e);
                      }
                      setAgentConfigs(updated);
                    }}
                    style={{
                      fontSize: "1.25rem", 
                      padding: "0.4rem", 
                      borderRadius: "8px", 
                      border: currentAgent.emoji === e ? "2px solid var(--primary)" : "1px solid var(--border)",
                      background: currentAgent.emoji === e ? "rgba(255, 75, 43, 0.1)" : "var(--bg-card)",
                      cursor: "pointer",
                      minWidth: "40px"
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{marginBottom: "1.5rem"}}>
              <label>Persona Template</label>
              <div style={{maxHeight: "150px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "12px", padding: "0.5rem"}}>
                <RadioCard
                  value={currentAgent.persona || "custom"}
                  onChange={(val) => {
                    const updated = [...agentConfigs];
                    updated[currentAgentConfigIdx].persona = val;
                    
                    if (val !== "custom" && PERSONA_TEMPLATES[val]) {
                      const t = PERSONA_TEMPLATES[val];
                      let newIdentity = t.identity;
                      let newSoul = t.soul;
                      
                      if (updated[currentAgentConfigIdx].name) {
                         newIdentity = updateIdentityField(newIdentity, "Name", updated[currentAgentConfigIdx].name);
                         newSoul = updateSoulMission(newSoul, updated[currentAgentConfigIdx].name);
                      }
                      
                      updated[currentAgentConfigIdx].identityMd = newIdentity;
                      updated[currentAgentConfigIdx].soulMd = newSoul;
                    }
                    setAgentConfigs(updated);
                  }}
                  columns={2}
                  options={[
                    { value: "custom", label: "Custom / Empty" },
                    ...Object.keys(PERSONA_TEMPLATES).filter(k => k !== "custom").sort().map(k => ({
                      value: k,
                      label: PERSONA_TEMPLATES[k].name
                    }))
                  ]}
                />
              </div>
            </div>

            <h3 style={{marginTop: "2rem"}}>Agent Workspace</h3>
            <div className="workspace-tabs">
              {[
                {id: "identity", label: "IDENTITY.md"},
                {id: "soul", label: "SOUL.md"}
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`tab ${activeWorkspaceTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveWorkspaceTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="workspace-editor" style={{marginBottom: "2rem"}}>
              {activeWorkspaceTab === "identity" && (
                <textarea
                  className="markdown-editor"
                  rows={8}
                  value={currentAgent.identityMd}
                  onChange={e => {
                    const updated = [...agentConfigs];
                    updated[currentAgentConfigIdx].identityMd = e.target.value;
                    setAgentConfigs(updated);
                  }}
                  placeholder={`# IDENTITY.md\n- **Name:** ${currentAgent.name}\n- **Emoji:** ${currentAgent.emoji}`}
                />
              )}
              
              {activeWorkspaceTab === "soul" && (
                <textarea
                  className="markdown-editor"
                  rows={8}
                  value={currentAgent.soulMd}
                  onChange={e => {
                    const updated = [...agentConfigs];
                    updated[currentAgentConfigIdx].soulMd = e.target.value;
                    setAgentConfigs(updated);
                  }}
                  placeholder={`# SOUL.md\n## Mission\nServe ${userName}.`}
                />
              )}
            </div>

            <div className="form-group" style={{padding: "1rem", border: "1px solid var(--border)", borderRadius: "12px", marginBottom: "1rem"}}>
              <label>Primary Model</label>
              
              <label style={{fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem"}}>Provider</label>
              <div style={{maxHeight: "200px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "12px", padding: "0.5rem", marginBottom: "1rem"}}>
                <RadioCard
                   value={currentAgentProvider}
                   onChange={(newProv) => {
                     if (MODELS_BY_PROVIDER[newProv] && MODELS_BY_PROVIDER[newProv].length > 0) {
                       const updated = [...agentConfigs];
                       updated[currentAgentConfigIdx].model = MODELS_BY_PROVIDER[newProv][0].value;
                       setAgentConfigs(updated);
                     }
                   }}
                   columns={2}
                   options={Object.keys(MODELS_BY_PROVIDER).sort().map(p => ({
                     value: p,
                     label: p.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                     icon: PROVIDER_LOGOS[p]
                   }))}
                />
              </div>
              
              {currentAgentProvider && MODELS_BY_PROVIDER[currentAgentProvider] && (
                <>
                  <label style={{fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem"}}>Model</label>
                  <div style={{maxHeight: "200px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "12px", padding: "0.5rem", marginBottom: "1rem"}}>
                    <RadioCard
                       value={currentAgent.model}
                       onChange={(val) => {
                         const updated = [...agentConfigs];
                         updated[currentAgentConfigIdx].model = val;
                         setAgentConfigs(updated);
                       }}
                       columns={1}
                       options={MODELS_BY_PROVIDER[currentAgentProvider].map(m => ({ value: m.value, label: m.label }))}
                    />
                  </div>
                </>
              )}
              
              {currentAgentProvider && currentAgentProvider !== provider && !serviceKeys[currentAgentProvider] && !["ollama"].includes(currentAgentProvider) && (
                 <div style={{marginTop: "0.5rem"}}>
                   <label style={{fontSize: "0.85rem", color: "var(--text-muted)"}}>API Key for {currentAgentProvider}</label>
                   <input
                     type="password"
                     placeholder={`API Key for ${currentAgentProvider}`}
                     value={serviceKeys[currentAgentProvider] || ""}
                     onChange={(e) => setServiceKeys({...serviceKeys, [currentAgentProvider]: e.target.value})}
                     autoComplete="off"
                   />
                 </div>
              )}
            </div>
            
             <div className="form-group" style={{padding: "1rem", border: "1px solid var(--border)", borderRadius: "12px", marginBottom: "1rem"}}>
               <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                 <label>Fallback Model (Optional)</label>
                 {currentAgent.fallbackModels[0] && (
                   <button className="secondary small" style={{padding: "2px 8px", fontSize: "0.75rem", height: "auto"}} onClick={() => {
                     const updated = [...agentConfigs];
                     updated[currentAgentConfigIdx].fallbackModels = [];
                     setAgentConfigs(updated);
                   }}>Clear</button>
                 )}
               </div>

               {(() => {
                 const currentFallbackModel = currentAgent.fallbackModels[0] || "";
                 const currentFallbackProvider = currentFallbackModel.split('/')[0];
                 
                 return (
                   <>
                     <label style={{fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem"}}>Provider</label>
                     <div style={{maxHeight: "200px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "12px", padding: "0.5rem", marginBottom: "1rem"}}>
                       <RadioCard
                         value={currentFallbackProvider || ""}
                         onChange={(newProv) => {
                           if (!newProv) return;
                           if (MODELS_BY_PROVIDER[newProv] && MODELS_BY_PROVIDER[newProv].length > 0) {
                             const updated = [...agentConfigs];
                             updated[currentAgentConfigIdx].fallbackModels = [MODELS_BY_PROVIDER[newProv][0].value];
                             setAgentConfigs(updated);
                           }
                         }}
                         columns={2}
                         options={Object.keys(MODELS_BY_PROVIDER).sort().map(p => ({
                           value: p,
                           label: p.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                           icon: PROVIDER_LOGOS[p]
                         }))}
                       />
                     </div>

                     {currentFallbackProvider && MODELS_BY_PROVIDER[currentFallbackProvider] && (
                       <>
                         <label style={{fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem"}}>Model</label>
                         <div style={{maxHeight: "200px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "12px", padding: "0.5rem", marginBottom: "1rem"}}>
                           <RadioCard
                             value={currentFallbackModel}
                             onChange={(val) => {
                               const updated = [...agentConfigs];
                               updated[currentAgentConfigIdx].fallbackModels = [val];
                               setAgentConfigs(updated);
                             }}
                             columns={1}
                             options={MODELS_BY_PROVIDER[currentFallbackProvider].map(m => ({ value: m.value, label: m.label }))}
                           />
                         </div>
                       </>
                     )}

                     {currentFallbackProvider && currentFallbackProvider !== provider && currentFallbackProvider !== currentAgentProvider && !serviceKeys[currentFallbackProvider] && !["ollama"].includes(currentFallbackProvider) && (
                       <div style={{marginTop: "0.5rem"}}>
                          <label style={{fontSize: "0.85rem", color: "var(--text-muted)"}}>API Key for {currentFallbackProvider}</label>
                          <input
                            type="password"
                            placeholder={`API Key for ${currentFallbackProvider}`}
                            value={serviceKeys[currentFallbackProvider] || ""}
                            onChange={(e) => setServiceKeys({...serviceKeys, [currentFallbackProvider]: e.target.value})}
                            autoComplete="off"
                          />
                       </div>
                     )}
                   </>
                 );
               })()}
             </div>

            <div className="form-group">
              <label>Skills</label>
              <div className="skills-grid" style={{marginTop: "0.5rem", maxHeight: "200px", overflowY: "auto"}}>
                {availableSkills.map(skill => (
                  <div
                    key={skill.id}
                    className={`skill-card ${currentAgent.skills.includes(skill.id) ? "active" : ""}`}
                    onClick={() => {
                      const updated = [...agentConfigs];
                      const skills = updated[currentAgentConfigIdx].skills;
                      if (skills.includes(skill.id)) {
                        updated[currentAgentConfigIdx].skills = skills.filter(s => s !== skill.id);
                      } else {
                        updated[currentAgentConfigIdx].skills.push(skill.id);
                      }
                      setAgentConfigs(updated);
                    }}
                    style={{padding: "0.75rem"}}
                  >
                    <div style={{display: "flex", alignItems: "center"}}>
                      {SKILL_ICONS[skill.id] && (
                        <img 
                          src={SKILL_ICONS[skill.id]} 
                          alt="" 
                          style={{
                            width: "16px", 
                            height: "16px", 
                            objectFit: "contain", 
                            borderRadius: "3px", 
                            backgroundColor: "white", 
                            padding: "1px", 
                            marginRight: "6px"
                          }} 
                        />
                      )}
                      <div className="skill-name" style={{fontSize: "0.85rem"}}>{skill.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="button-group" style={{marginTop: "1.5rem"}}>
              <button className="primary" onClick={() => {
                if (currentAgentConfigIdx < agentConfigs.length - 1) {
                  setCurrentAgentConfigIdx(currentAgentConfigIdx + 1);
                  setActiveWorkspaceTab("identity");
                } else {
                  setStep(16);
                }
              }} disabled={loading}>
                {currentAgentConfigIdx < agentConfigs.length - 1 ? "Next Agent" : "Next"}
              </button>
              <button className="secondary" onClick={() => {
                if (currentAgentConfigIdx > 0) {
                  setCurrentAgentConfigIdx(currentAgentConfigIdx - 1);
                  setActiveWorkspaceTab("identity");
                } else {
                  setStep(15);
                }
              }} disabled={loading}>Back</button>
            </div>
          </div>
        );


case 16:
        return (
          <div className="step-view">
            <h2>{initialConfigRef.current ? "Review Configuration" : "Deploy Your AI Agent"}</h2>
            <p className="step-description">{initialConfigRef.current ? "Review your changes before applying." : "Your agent is ready to be deployed."}</p>
            
            <div className="status-card" style={{
              padding: "1.5rem", 
              backgroundColor: hasChanges ? "rgba(59, 130, 246, 0.1)" : "rgba(34, 197, 94, 0.1)",
              border: `1px solid ${hasChanges ? "var(--primary)" : "var(--success)"}`,
              borderRadius: "12px",
              marginBottom: "2rem",
              textAlign: "center"
            }}>
               <div style={{fontSize: "2rem", marginBottom: "1rem"}}>
                 {hasChanges ? (initialConfigRef.current ? "📝" : "🚀") : "✅"}
               </div>
               <h3>{hasChanges ? (initialConfigRef.current ? "Configuration Updated" : "Ready to Deploy") : "No Changes Detected"}</h3>
               <p style={{color: "var(--text-muted)"}}>
                 {hasChanges 
                   ? (initialConfigRef.current ? "You have modified the agent configuration. Click below to apply these changes." : "Your configuration is complete. Click below to deploy your agent.")
                   : "Your configuration matches the current active settings."}
               </p>
            </div>

            {(loading || error) && (
              <div className="progress-container" style={{marginBottom: "2rem"}}>
                {loading && (
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: progress.includes("Gateway") ? "80%" : (progress.includes("skill") ? "50%" : "20%")}} />
                  </div>
                )}
                <p style={{fontSize: "0.9rem", color: error ? "var(--error)" : "var(--primary)"}}>{error ? "Installation Failed" : progress}</p>
                <div className="logs-container">
                  <pre>{logs}</pre>
                </div>
              </div>
            )}

            <div className="button-group">
              {hasChanges ? (
                <button className="primary" onClick={handleInstall} disabled={loading}>
                  {loading ? (initialConfigRef.current ? "Updating..." : "Installing...") : (initialConfigRef.current ? "Update Configuration" : "Finish Setup")}
                </button>
              ) : (
                <button className="primary" onClick={() => setStep(17)}>
                  Next
                </button>
              )}
              <button className="secondary" onClick={() => setStep(mode === "advanced" ? 15.5 : 9)} disabled={loading}>Back</button>
            </div>
          </div>
        );

      case 10.5:
        return (
          <div className="step-view">
            <h2>Customize Workspace</h2>
            <p className="step-description">Edit your agent's identity, personality, and mission.</p>

            <div className="form-group" style={{marginBottom: "1.5rem"}}>
              <label>Persona Template</label>
              <div style={{maxHeight: "150px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "12px", padding: "0.5rem"}}>
                <RadioCard
                  value={selectedPersona}
                  onChange={(val) => {
                    setSelectedPersona(val);
                    if (val !== "custom" && PERSONA_TEMPLATES[val]) {
                      const t = PERSONA_TEMPLATES[val];
                      let newIdentity = t.identity;
                      let newSoul = t.soul;
                      
                      if (agentName) {
                         newIdentity = updateIdentityField(newIdentity, "Name", agentName);
                         newSoul = updateSoulMission(newSoul, agentName);
                      }
                      
                      setIdentityMd(newIdentity);
                      setSoulMd(newSoul);
                    }
                  }}
                  columns={2}
                  options={[
                    { value: "custom", label: "Custom / Empty" },
                    ...Object.keys(PERSONA_TEMPLATES).filter(k => k !== "custom").sort().map(k => ({
                      value: k,
                      label: PERSONA_TEMPLATES[k].name
                    }))
                  ]}
                />
              </div>
            </div>

            <div className="workspace-tabs">
              {[
                {id: "identity", label: "IDENTITY.md"},
                {id: "user", label: "USER.md"},
                {id: "soul", label: "SOUL.md"}
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`tab ${activeWorkspaceTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveWorkspaceTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="workspace-editor">
              {activeWorkspaceTab === "identity" && (
                <textarea
                  className="markdown-editor"
                  rows={12}
                  value={identityMd}
                  onChange={e => setIdentityMd(e.target.value)}
                  placeholder={`# IDENTITY.md - Who Am I?\n- **Name:** ${agentName}\n- **Vibe:** ${agentVibe}\n- **Emoji:** ${agentEmoji}\n\nAdd more details about your agent's identity...`}
                />
              )}
              {activeWorkspaceTab === "user" && (
                <textarea
                  className="markdown-editor"
                  rows={12}
                  value={userMd}
                  onChange={e => setUserMd(e.target.value)}
                  placeholder={`# USER.md - About Your Human\n- **Name:** ${userName}\n\nAdd more details about yourself...`}
                />
              )}
              {activeWorkspaceTab === "soul" && (
                <textarea
                  className="markdown-editor"
                  rows={12}
                  value={soulMd}
                  onChange={e => setSoulMd(e.target.value)}
                  placeholder={`# SOUL.md\n## Mission\nServe ${userName}.\n\nAdd your agent's mission statement and guiding principles...`}
                />
              )}
            </div>

            <p className="input-hint" style={{marginTop: "1rem"}}>
              Leave blank to use auto-generated defaults. Changes can be edited later in the workspace folder.
            </p>

            <div className="button-group" style={{gap: "0.5rem"}}>
              <button
                className="secondary"
                disabled={!workspaceModified || savingWorkspace}
                onClick={() => handleSaveWorkspace()}
                style={{flex: "0 0 auto", minWidth: "150px"}}
              >
                {savingWorkspace ? "Saving..." : "💾 Save Changes"}
              </button>
              <button className="primary" onClick={() => setStep(11)} style={{flex: 1}}>
                Next
              </button>
              <button className="secondary" onClick={() => setStep(10)} style={{flex: "0 0 auto"}}>Back</button>
            </div>
          </div>
        );
      case 17:
        return (
          <div className="step-view">
            <h2>Setup Complete! 🦞</h2>
            <p className="step-description">
              OpenClaw is running {targetEnvironment === "cloud" ? `on ${remoteIp}` : "locally"} and ready for your commands.
            </p>

            {targetEnvironment === "cloud" && (
              <div style={{
                padding: "1rem",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                border: "1px solid rgba(59, 130, 246, 0.3)"
              }}>
                <h4 style={{margin: "0 0 0.5rem 0", color: "var(--primary)"}}>
                  {tunnelActive ? "🔒 SSH Tunnel Active" : "⚠️ Tunnel Inactive"}
                </h4>
                <p style={{fontSize: "0.85rem", color: "var(--text-muted)", margin: 0}}>
                  {tunnelActive
                    ? `Remote gateway (${remoteIp}:18789) is forwarded to localhost:18789`
                    : "SSH tunnel is not active"}
                </p>
                {tunnelActive ? (
                  <button
                    className="secondary"
                    style={{marginTop: "1rem", width: "100%"}}
                    onClick={async () => {
                      try {
                        await invoke("stop_ssh_tunnel");
                        setTunnelActive(false);
                      } catch (e) {
                        console.error("Failed to stop tunnel:", e);
                      }
                    }}
                  >
                    Stop SSH Tunnel
                  </button>
                ) : (
                  <button
                    className="primary"
                    style={{marginTop: "1rem", width: "100%"}}
                    onClick={() => handleToggleTunnel()}
                  >
                    Establish SSH Tunnel
                  </button>
                )}
              </div>
            )}

            <div className="pairing-result">
               {!isPaired && (
                 <>
                   <h3>Telegram Pairing</h3>
                   <p style={{color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.5rem"}}>
                     Send any message to your bot to receive your code.
                   </p>
                   <div className="pairing-code-display">{pairingCode.includes("Ready") ? "READY" : pairingCode}</div>

                   {telegramToken && (
                     <div className="form-group" style={{marginTop: "2rem"}}>
                       <input
                         type="text"
                         placeholder="Enter code (e.g. 3RQ8EBFE)"
                         value={pairingInput}
                         onChange={(e) => setPairingInput(e.target.value.toUpperCase())}
                         style={{textAlign: "center", letterSpacing: "2px", fontWeight: "bold"}}
                       />
                       <button className="primary" style={{width: "100%", marginTop: "1rem"}} onClick={handlePairing} disabled={!pairingInput || pairingStatus === "Verifying..."}>
                         {pairingStatus === "Verifying..." ? "Verifying..." : "Pair Agent"}
                       </button>
                       {pairingStatus && (
                         <p style={{marginTop: "1rem", fontWeight: "bold", color: pairingStatus.includes("Error") ? "var(--error)" : "var(--success)"}}>
                           {pairingStatus}
                         </p>
                       )}
                     </div>
                   )}
                 </>
               )}
               
               {true && (
                  <div className="advanced-setup-prompt" style={{marginTop: "2rem", padding: "1.5rem", backgroundColor: "rgba(59, 130, 246, 0.1)", borderRadius: "12px", border: "1px solid var(--primary)"}}>
                    <h3 style={{marginTop: 0, marginBottom: "0.5rem"}}>Configuration Complete</h3>
                    <p style={{marginBottom: "1.5rem"}}>Your agent is paired and ready. {mode !== "advanced" && "Would you like to configure advanced settings (Gateway, Skills, Security, Multi-Agent) now?"}</p>
                    <div className="button-group" style={{gap: "1rem"}}>
                       <button className="primary" onClick={() => open(dashboardUrl)}>
                         Open Web Dashboard
                       </button>
                       {mode !== "advanced" && (
                         <button className="secondary" onClick={() => setShowLicenseModal(true)}>
                           Configure Advanced
                         </button>
                       )}
                       <button className="secondary" onClick={() => invoke("close_app")}>
                         Exit Setup
                       </button>
                    </div>
                  </div>
               )}
            </div>

            {false && (
              <div className="button-group" style={{flexDirection: "column", gap: "10px"}}>
                <button className="primary" style={{width: "100%"}} onClick={() => open(dashboardUrl)}>
                  Open Web Dashboard {targetEnvironment === "cloud" && "(via Tunnel)"}
                </button>
                <button className="secondary" style={{width: "100%"}} onClick={() => invoke("close_app")}>Exit Setup</button>
              </div>
            )}
            <p style={{ marginTop: "2rem", fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center" }}>
              Terminal access: <code>openclaw tui</code> {targetEnvironment === "cloud" && `(SSH to ${remoteIp})`}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          🦞 ClawSetup
        </div>
        <ul className="step-list">
          {stepsList
            .filter(s => !s.hidden)
            .filter(s => mode === "advanced" || !s.advanced)
            .filter(s => !skipBasicConfig || (s.id !== 8 && s.id !== 9))
            .map((s, idx) => (
              <li key={s.id} className={`step-indicator ${getStepStatus(s.id)}`}>
                <span className="step-number">{idx + 1}</span>
                {s.name}
              </li>
            ))}
        </ul>
        <div style={{marginTop: "auto", paddingTop: "1rem"}}>
          <button 
            className="secondary" 
            style={{width: "100%", justifyContent: "space-between", padding: "0.5rem 1rem"}}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <span style={{fontSize: "0.85rem"}}>Theme</span>
            <span>{theme === "dark" ? "🌙" : "☀️"}</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-wrapper">
          {renderStep()}
        </div>
      </main>

      {showLicenseModal && (
        <div className="modal-overlay" style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1000,
          display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div className="modal-content" style={{
            backgroundColor: "var(--bg-card)", padding: "2rem", borderRadius: "12px",
            width: "400px", maxWidth: "90%", border: "1px solid var(--border)"
          }}>
            <h3 style={{marginTop: 0}}>Advanced Setup License</h3>
            <p style={{fontSize: "0.9rem", color: "var(--text-muted)"}}>
              Advanced features require a license key. You can purchase one from Gumroad.
            </p>
            
            <div className="form-group" style={{marginTop: "1.5rem"}}>
              <label>License Key</label>
              <input 
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
                autoFocus
              />
            </div>
            
            <div style={{marginTop: "1rem", fontSize: "0.85rem"}}>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); open("https://aimodelscompass.gumroad.com/l/clawsetup"); }}
                style={{color: "var(--primary)"}}
              >
                Get a license key &rarr;
              </a>
            </div>

            {licenseError && (
              <div className="error" style={{marginTop: "1rem", fontSize: "0.85rem", color: "var(--error)"}}>
                {licenseError}
              </div>
            )}

            <div className="button-group" style={{marginTop: "2rem"}}>
              <button 
                className="primary" 
                disabled={!licenseKey || verifyingLicense}
                onClick={async () => {
                  setVerifyingLicense(true);
                  setLicenseError("");
                  try {
                    await invoke("verify_license", { key: licenseKey.trim() });
                    // Success
                    setVerifyingLicense(false);
                    setShowLicenseModal(false);
                    setMode("advanced");
                    setPairingStatus("");
                    setSkipBasicConfig(true); setMaintCompleted(true);
                    setStep(7);
                  } catch (e) {
                    setVerifyingLicense(false);
                    setLicenseError(String(e));
                  }
                }}
              >
                {verifyingLicense ? "Verifying..." : "Verify & Continue"}
              </button>
              <button 
                className="secondary" 
                onClick={() => {
                  setShowLicenseModal(false);
                  setLicenseError("");
                }}
                disabled={verifyingLicense}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    
    </div>
  );
}

export default App;
