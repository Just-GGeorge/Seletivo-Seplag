import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Box, Container, Typography, Link } from "@mui/material";

import { authFacade } from "../../core/auth/AuthFacade";
import { useObservableState } from "../../core/hooks/useObservableState";
import { registrar } from "./registerSlice";
import RegisterForm from "./components/RegisterForm";

export default function RegisterPage() {
  const navigate = useNavigate();
  const initial = useMemo(() => authFacade.getSnapshot(), []);
  const auth = useObservableState(authFacade.state$, initial);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  if (auth.isAuthenticated) return <Navigate to="/" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);

    if (senha !== confirmarSenha) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      await registrar({
        nome: nome.trim(),
        email: email.trim(),
        senha,
      });

      navigate("/login", { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Erro ao registrar usuário");
    } finally {
      setLoading(false);
    }
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
      <Container maxWidth="xs" sx={{ display: "flex", justifyContent: "center" }}>
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <RegisterForm
            nome={nome}
            email={email}
            senha={senha}
            confirmarSenha={confirmarSenha}
            loading={loading}
            error={error}
            onNomeChange={setNome}
            onEmailChange={setEmail}
            onSenhaChange={setSenha}
            onConfirmarSenhaChange={setConfirmarSenha}
            onSubmit={onSubmit}
            onGoLogin={() => navigate("/login")}
          />

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
            Sistema de Discografia
          </Typography>

          <Link
            component="button"
            type="button"
            onClick={() => navigate("/login")}
            sx={{ mt: 1 }}
            underline="hover"
          >
            Já tem conta? Entrar
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
