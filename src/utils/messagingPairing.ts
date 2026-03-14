export type MessagingChannel = "none" | "telegram" | "whatsapp";

export function getMessagingChannelFromConfig(config: {
  whatsapp_enabled?: boolean | null;
  telegram_token?: string | null;
}): MessagingChannel {
  if (config.whatsapp_enabled) return "whatsapp";
  if ((config.telegram_token || "").trim()) return "telegram";
  return "none";
}

export function isMessagingLinked(channel: MessagingChannel, status: {
  telegramPaired: boolean;
  whatsappPaired: boolean;
}): boolean {
  if (channel === "telegram") return status.telegramPaired;
  if (channel === "whatsapp") return status.whatsappPaired;
  return true;
}

export function shouldShowTelegramPairing(channel: MessagingChannel, telegramPaired: boolean): boolean {
  return channel === "telegram" && !telegramPaired;
}

export function shouldShowWhatsAppPairing(channel: MessagingChannel, whatsappPaired: boolean): boolean {
  return channel === "whatsapp" && !whatsappPaired;
}

export function normalizeMessagingSettings(input: {
  channel: MessagingChannel;
  telegramToken?: string | null;
  whatsappDmPolicy?: string | null;
  whatsappPhoneNumber?: string | null;
}) {
  if (input.channel === "telegram") {
    return {
      channel: "telegram" as const,
      telegramToken: (input.telegramToken || "").trim(),
    };
  }

  if (input.channel === "whatsapp") {
    return {
      channel: "whatsapp" as const,
      whatsappDmPolicy: input.whatsappDmPolicy || "allowlist",
      whatsappPhoneNumber: (input.whatsappPhoneNumber || "").trim(),
    };
  }

  return { channel: "none" as const };
}

export function hasMessagingSettingsChanged(
  initial: {
    channel: MessagingChannel;
    telegramToken?: string | null;
    whatsappDmPolicy?: string | null;
    whatsappPhoneNumber?: string | null;
  },
  current: {
    channel: MessagingChannel;
    telegramToken?: string | null;
    whatsappDmPolicy?: string | null;
    whatsappPhoneNumber?: string | null;
  },
): boolean {
  const normalizedInitial = normalizeMessagingSettings(initial);
  const normalizedCurrent = normalizeMessagingSettings(current);
  return JSON.stringify(normalizedInitial) !== JSON.stringify(normalizedCurrent);
}
