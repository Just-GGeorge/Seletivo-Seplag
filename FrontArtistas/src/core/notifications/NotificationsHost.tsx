import { useEffect, useRef, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import type { NotificationDto } from "./notificationsTypes";
import { notificationsFacade } from "./NotificationsFacade";
import { tokenStore } from "../auth/tokenStore";

export function NotificationsHost() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<NotificationDto | undefined>();
  const [error, setError] = useState<string | undefined>();

  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (tokenStore.getAccessToken()) {
      notificationsFacade.connect();
    }

    const sub = notificationsFacade.state$.subscribe((s) => {
      if (s.error) setError(s.error);

      if (s.last) {
        const key = `${s.last.type}:${s.last.entity}:${s.last.entityId}:${s.last.timestamp}`;
        if (lastKeyRef.current !== key) {
          lastKeyRef.current = key;
          setLast(s.last);
          setOpen(true);
        }
      }
    });

    return () => {
      sub.unsubscribe();
      notificationsFacade.disconnect();
    };
  }, []);

  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setOpen(false)} severity="info" variant="filled">
          {last?.message ?? "Nova atualização"}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(undefined)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setError(undefined)} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
