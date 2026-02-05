import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Stack,
} from "@mui/material";

type Props = {
  login: string;
  senha: string;
  loading: boolean;
  error?: string;
  onLoginChange: (value: string) => void;
  onSenhaChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoRegister: () => void;
};

export default function LoginForm({
  login,
  senha,
  loading,
  error,
  onLoginChange,
  onSenhaChange,
  onSubmit,
  onGoRegister,
}: Props) {
  return (
    <Paper elevation={2} sx={{ p: 4, width: "100%", maxWidth: 420 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Avatar sx={{ mb: 1 }}>
          <LockOutlinedIcon />
        </Avatar>

        <Typography component="h1" variant="h5">
          Sign in
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, mb: 2, textAlign: "center" }}
        >
          Acesse para gerenciar artistas, álbuns e imagens.
        </Typography>

        {error ? (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Box component="form" onSubmit={onSubmit} sx={{ width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Login"
            autoComplete="username"
            value={login}
            onChange={(e) => onLoginChange(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => onSenhaChange(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <Stack sx={{ mt: 1 }}>
            <Button
              type="button"
              fullWidth
              variant="text"
              disabled={loading}
              onClick={onGoRegister}
            >
              Criar conta
            </Button>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}
