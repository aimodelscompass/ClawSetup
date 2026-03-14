import { describe, expect, it } from "vitest";

import {
  getTelegramPairingDisplayCode,
  getMessagingChannelFromConfig,
  hasMessagingSettingsChanged,
  isMessagingLinked,
  shouldShowTelegramPairing,
  shouldShowWhatsAppPairing,
} from "../utils/messagingPairing";

describe("messagingPairing utilities", () => {
  it("treats unchanged Telegram reconfigure as unchanged messaging settings", () => {
    expect(hasMessagingSettingsChanged(
      {
        channel: "telegram",
        telegramToken: "123456:ABC",
      },
      {
        channel: "telegram",
        telegramToken: "123456:ABC",
      },
    )).toBe(false);
  });

  it("treats unchanged WhatsApp reconfigure as unchanged messaging settings", () => {
    expect(hasMessagingSettingsChanged(
      {
        channel: "whatsapp",
        whatsappDmPolicy: "allowlist",
        whatsappPhoneNumber: "+15551234567",
      },
      {
        channel: "whatsapp",
        whatsappDmPolicy: "allowlist",
        whatsappPhoneNumber: "+15551234567",
      },
    )).toBe(false);
  });

  it("detects channel switches between Telegram and WhatsApp", () => {
    expect(hasMessagingSettingsChanged(
      {
        channel: "telegram",
        telegramToken: "123456:ABC",
      },
      {
        channel: "whatsapp",
        whatsappDmPolicy: "allowlist",
        whatsappPhoneNumber: "+15551234567",
      },
    )).toBe(true);

    expect(hasMessagingSettingsChanged(
      {
        channel: "whatsapp",
        whatsappDmPolicy: "allowlist",
        whatsappPhoneNumber: "+15551234567",
      },
      {
        channel: "telegram",
        telegramToken: "123456:ABC",
      },
    )).toBe(true);
  });

  it("never requires pairing for the none channel", () => {
    expect(isMessagingLinked("none", { telegramPaired: false, whatsappPaired: false })).toBe(true);
    expect(shouldShowTelegramPairing("none", false)).toBe(false);
    expect(shouldShowWhatsAppPairing("none", false)).toBe(false);
  });

  it("shows only the pairing UI for the selected channel", () => {
    expect(shouldShowTelegramPairing("telegram", false)).toBe(true);
    expect(shouldShowTelegramPairing("telegram", true)).toBe(false);
    expect(shouldShowTelegramPairing("whatsapp", false)).toBe(false);
    expect(shouldShowWhatsAppPairing("whatsapp", false)).toBe(true);
    expect(shouldShowWhatsAppPairing("telegram", false)).toBe(false);
  });

  it("does not infer Telegram readiness from instruction text", () => {
    expect(getTelegramPairingDisplayCode("Ready! Send any message to your Telegram bot.")).toBe(
      "READY",
    );
  });

  it("derives the active messaging channel from loaded config", () => {
    expect(getMessagingChannelFromConfig({ whatsapp_enabled: true, telegram_token: "token" })).toBe("whatsapp");
    expect(getMessagingChannelFromConfig({ whatsapp_enabled: false, telegram_token: "token" })).toBe("telegram");
    expect(getMessagingChannelFromConfig({ whatsapp_enabled: false, telegram_token: "" })).toBe("none");
  });
});
