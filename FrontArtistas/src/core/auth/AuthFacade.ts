import { BehaviorSubject } from "rxjs";
import { tokenStore, type Tokens } from "./tokenStore";
import * as authApi from "./authApi";
import { notificationsFacade } from "../notifications/NotificationsFacade";

export type AuthState = {
  isAuthenticated: boolean;
  loading: boolean;
  error?: string;
};

const initialState: AuthState = {
  isAuthenticated: !!tokenStore.getAccessToken(),
  loading: false,
};

export class AuthFacade {
  private readonly stateSubject = new BehaviorSubject<AuthState>(initialState);
  public readonly state$ = this.stateSubject.asObservable();

  getSnapshot() {
    return this.stateSubject.value;
  }

  private setState(patch: Partial<AuthState>) {
    this.stateSubject.next({ ...this.stateSubject.value, ...patch });
  }

  async login(login: string, senha: string) {
    this.setState({ loading: true, error: undefined });
    try {
      const tokens: Tokens = await authApi.login({ login, senha  });
      tokenStore.setTokens(tokens);
      notificationsFacade.connect();

      this.setState({ isAuthenticated: true, loading: false });
    } catch (e: any) {
      this.setState({ loading: false, error: e?.message ?? "Falha no login" });
      throw e;
    }
  }

  logout() {
    tokenStore.clear();
    notificationsFacade.disconnect();
notificationsFacade.clear();
    this.setState({ isAuthenticated: false });
  }
}

export const authFacade = new AuthFacade();
