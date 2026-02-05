import { BehaviorSubject } from "rxjs";
import type { NotificationDto } from "./notificationsTypes";
import { NotificationsClient } from "./notificationsClient";

export type NotificationsState = {
  connected: boolean;
  items: NotificationDto[];
  unread: number;
  last?: NotificationDto;
  error?: string;
};

const initial: NotificationsState = {
  connected: false,
  items: [],
  unread: 0,
};

export class NotificationsFacade {
  private readonly subject = new BehaviorSubject<NotificationsState>(initial);
  public readonly state$ = this.subject.asObservable();

  private client = new NotificationsClient({
    onNotification: (n) => this.push(n),
    onConnectionChange: (connected) => this.patch({ connected }),
    onError: (msg) => this.patch({ error: msg }),
  });

  getSnapshot() {
    return this.subject.value;
  }

  private patch(p: Partial<NotificationsState>) {
    this.subject.next({ ...this.subject.value, ...p });
  }

  connect() {
    this.client.connect();
  }

  disconnect() {
    this.client.disconnect();
    this.patch({ connected: false });
  }

  markAllRead() {
    this.patch({ unread: 0 });
  }

  clear() {
    this.patch({ items: [], unread: 0, last: undefined, error: undefined });
  }

  private push(n: NotificationDto) {
    const prev = this.subject.value;
    const nextItems = [n, ...prev.items].slice(0, 50); 
    this.subject.next({
      ...prev,
      items: nextItems,
      unread: prev.unread + 1,
      last: n,
      error: undefined,
    });
  }
}

export const notificationsFacade = new NotificationsFacade();
