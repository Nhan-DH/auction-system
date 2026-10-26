import { SocketMessage, ServerMessageType, ClientMessageType } from '../types/auction';

type MessageHandler = (payload: any, message: SocketMessage) => void;

class SocketService {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<MessageHandler>>();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private currentUserId: string | null = null;
  private isConnecting: boolean = false;
  private onConnectCallbacks = new Set<() => void>();

  public connect(userId?: string) {
    if (typeof window === 'undefined') return;
    if (userId) this.currentUserId = userId;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      if (this.ws.readyState === WebSocket.OPEN && this.currentUserId) {
        this.send('auth', { userId: this.currentUserId });
      }
      return;
    }

    this.isConnecting = true;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }

        if (this.currentUserId) {
          this.send('auth', { userId: this.currentUserId });
        }

        this.onConnectCallbacks.forEach((cb) => cb());
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: SocketMessage = JSON.parse(event.data);
          const typeHandlers = this.handlers.get(msg.type);
          if (typeHandlers) {
            typeHandlers.forEach((handler) => handler(msg.payload, msg));
          }
          // Also invoke wildcard handlers
          const wildcard = this.handlers.get('*');
          if (wildcard) {
            wildcard.forEach((handler) => handler(msg.payload, msg));
          }
        } catch (e) {
          console.error('Failed to parse socket message:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.isConnecting = false;
        this.scheduleReconnect();
      };
    } catch (e) {
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 2500);
  }

  public on(type: ServerMessageType | '*', handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    return () => {
      const set = this.handlers.get(type);
      if (set) {
        set.delete(handler);
      }
    };
  }

  public onConnect(callback: () => void) {
    this.onConnectCallbacks.add(callback);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      callback();
    }
    return () => {
      this.onConnectCallbacks.delete(callback);
    };
  }

  public send(type: ClientMessageType, payload: any = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload, timestamp: Date.now() }));
    } else {
      // Reconnect and send after open
      this.connect();
      const sendWhenOpen = () => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type, payload, timestamp: Date.now() }));
          this.onConnectCallbacks.delete(sendWhenOpen);
        }
      };
      this.onConnectCallbacks.add(sendWhenOpen);
    }
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const socketService = new SocketService();
