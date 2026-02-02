import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Box, Container, Typography } from "@mui/material";

import { authFacade } from "../../core/auth/AuthFacade";
import { useObservableState } from "../../core/hooks/useObservableState";
import LoginForm from "./components/LoginForm";

export default function LoginPage() {
  const navigate = useNavigate();
  const initial = useMemo(() => authFacade.getSnapshot(), []);
  const auth = useObservableState(authFacade.state$, initial);

  const [login, setLogin] = useState("admin@local.com");
  const [senha, setSenha] = useState("Admin@123");

  if (auth.isAuthenticated) return <Navigate to="/" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await authFacade.login(login.trim(), senha);
    navigate("/", { replace: true });
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Container
        maxWidth="xs"
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <LoginForm
            login={login}
            senha={senha}
            loading={auth.loading}
            error={auth.error}
            onLoginChange={setLogin}
            onSenhaChange={setSenha}
            onSubmit={onSubmit}
          />

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, textAlign: "center" }}
          >
            CRUD Artistas/Álbuns
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
