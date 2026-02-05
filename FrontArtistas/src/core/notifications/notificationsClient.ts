import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import axios from "axios";
import { tokenStore } from "../auth/tokenStore";
import type { NotificationDto } from "./notificationsTypes";

type Options = {
  onNotification: (n: NotificationDto) => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (msg: string) => void;
};

function resolveApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? "/api/v1";
}

function resolveWsUrl(): string {
  const explicit = import.meta.env.VITE_WS_URL as string | undefined;
  if (explicit) return explicit; // ex: ws://localhost:8080/ws

  // padrão: dev -> backend no 8080; prod -> mesmo host
  const { protocol, hostname } = window.location;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  const wsProto = protocol === "https:" ? "wss" : "ws";

  if (isLocal) return `${wsProto}://localhost:8080/ws`;
  return `${wsProto}://${window.location.host}/ws`;
}

async function refreshTokens(): Promise<string> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) throw new Error("Missing refresh token");

  const apiBase = resolveApiBaseUrl();

  const res = await axios.post(
    `${apiBase}/auth/refresh`,
    { refreshToken },
    { timeout: 20000 }
  );

  const newAccess = res.data.accessToken as string;
  const newRefresh = (res.data.refreshToken as string) ?? refreshToken;

  tokenStore.setTokens({ accessToken: newAccess, refreshToken: newRefresh });
  return newAccess;
}

export class NotificationsClient {
  private client: Client | null = null;
  private sub: StompSubscription | null = null;
  private connecting = false;
  private stopped = false;

  // evita loop infinito de refresh
  private refreshAttempted = false;

  private opts: Options;

  constructor(opts: Options) {
    this.opts = opts;
  }

  connect() {
    if (this.connecting || this.client?.active) return;
    this.connecting = true;
    this.stopped = false;

    const wsUrl = resolveWsUrl();

    const buildClient = (token: string) => {
      const c = new Client({
        brokerURL: wsUrl,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        // Reconexão do próprio stompjs (ms)
        reconnectDelay: 3000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,

        onConnect: () => {
          this.refreshAttempted = false;
          this.opts.onConnectionChange?.(true);

          this.sub?.unsubscribe();
          this.sub = c.subscribe("/topic/notifications", (msg: IMessage) => {
            try {
              const n = JSON.parse(msg.body) as NotificationDto;
              this.opts.onNotification(n);
            } catch (e) {
              this.opts.onError?.("Falha ao ler notificação");
            }
          });
        },

        onStompError: async (frame) => {
          const m = frame.headers["message"] ?? "STOMP error";
          await this.handleAuthOrDisconnect(m);
        },

        onWebSocketClose: async () => {
          this.opts.onConnectionChange?.(false);
          if (this.stopped) return;
          // quando fecha por auth, tentamos refresh 1x e reconectar
          await this.handleAuthOrDisconnect("WebSocket closed");
        },

        onWebSocketError: () => {
          this.opts.onConnectionChange?.(false);
        },
      });

      return c;
    };

    const token = tokenStore.getAccessToken();
    if (!token) {
      this.connecting = false;
      this.opts.onConnectionChange?.(false);
      return;
    }

    this.client = buildClient(token);
    this.client.activate();
    this.connecting = false;
  }

  disconnect() {
    this.stopped = true;
    this.opts.onConnectionChange?.(false);

    try {
      this.sub?.unsubscribe();
      this.sub = null;
    } catch {}

    if (this.client?.active) {
      this.client.deactivate();
    }
    this.client = null;
  }

  private async handleAuthOrDisconnect(_reason: string) {
    const hasRefresh = !!tokenStore.getRefreshToken();
    if (!hasRefresh) {
      this.opts.onError?.("Sessão expirada. Faça login novamente.");
      return;
    }

    if (this.refreshAttempted) return;
    this.refreshAttempted = true;

    try {
      const newAccess = await refreshTokens();

      // reconecta com novo token
      this.disconnect();
      if (this.stopped) return;

      // reativar
      this.client = new Client({
        brokerURL: resolveWsUrl(),
        connectHeaders: { Authorization: `Bearer ${newAccess}` },
        reconnectDelay: 3000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        onConnect: () => {
          this.refreshAttempted = false;
          this.opts.onConnectionChange?.(true);
          this.sub?.unsubscribe();
          this.sub = this.client!.subscribe("/topic/notifications", (msg) => {
            try {
              const n = JSON.parse(msg.body) as NotificationDto;
              this.opts.onNotification(n);
            } catch {
              this.opts.onError?.("Falha ao ler notificação");
            }
          });
        },
        onStompError: () => {
          this.opts.onError?.("Falha na conexão de notificações (auth).");
        },
        onWebSocketClose: () => {
          this.opts.onConnectionChange?.(false);
        },
      });

      this.client.activate();
    } catch (e: any) {
      tokenStore.clear();
      this.opts.onError?.("Sessão expirada. Faça login novamente.");
    }
  }
}
