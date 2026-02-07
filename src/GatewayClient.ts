// Simplified Gateway Client for OpenClaw Desktop
export type GatewayEventFrame = {
  type: "event";
  event: string;
  payload?: any;
  seq?: number;
};

export type GatewayResponseFrame = {
  type: "res";
  id: string;
  ok: boolean;
  payload?: any;
  error?: { code: string; message: string; details?: any };
};

export class GatewayClient {
  private ws: WebSocket | null = null;
  private pending = new Map<string, { resolve: (v: any) => void; reject: (e: any) => void }>();
  private reconnectTimer: any = null;

  constructor(
    private url: string,
    private token: string,
    private onEvent: (event: string, payload: any) => void,
    private onStatusChange: (connected: boolean) => void
  ) { }

  connect() {
    console.log("Connecting to gateway:", this.url);
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.onStatusChange(true);
      this.authenticate();
    };

    this.ws.onmessage = (event) => {
      const frame = JSON.parse(event.data);
      if (frame.type === "res") {
        const p = this.pending.get(frame.id);
        if (p) {
          this.pending.delete(frame.id);
          if (frame.ok) p.resolve(frame.payload);
          else p.reject(frame.error);
        }
      } else if (frame.type === "event") {
        this.onEvent(frame.event, frame.payload);
      }
    };

    this.ws.onclose = () => {
      this.onStatusChange(false);
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }

  private async authenticate() {
    try {
      await this.request("connect", {
        minProtocol: 3,
        maxProtocol: 3,
        client: { id: "openclaw-macos", version: "0.1.0", platform: "macos", mode: "webchat" },
        role: "operator",
        auth: { token: this.token }
      });
      console.log("Authenticated with gateway");
    } catch (e) {
      console.error("Authentication failed:", e);
    }
  }

  async request(method: string, params: any = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("Not connected to gateway");
    }
    const id = Math.random().toString(36).substring(2);
    const frame = { type: "req", id, method, params };

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws!.send(JSON.stringify(frame));
    });
  }

  disconnect() {
    this.ws?.close();
  }
}
