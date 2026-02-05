import { Navigate } from "react-router-dom";
import { authFacade } from "../../core/auth/AuthFacade";
import { useObservableState } from "../../core/hooks/useObservableState";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useObservableState(authFacade.state$, authFacade.getSnapshot()); // ✅

  if (!auth.isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
