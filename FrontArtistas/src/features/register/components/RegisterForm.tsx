import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
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
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  loading: boolean;
  error?: string;
  onNomeChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onSenhaChange: (v: string) => void;
  onConfirmarSenhaChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoLogin: () => void;
};

export default function RegisterForm({
  nome,
  email,
  senha,
  confirmarSenha,
  loading,
  error,
  onNomeChange,
  onEmailChange,
  onSenhaChange,
  onConfirmarSenhaChange,
  onSubmit,
  onGoLogin,
}: Props) {
  return (
    <Paper elevation={2} sx={{ p: 4, width: "100%", maxWidth: 420 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Avatar sx={{ mb: 1 }}>
          <PersonAddAltIcon />
        </Avatar>

        <Typography component="h1" variant="h5">
          Registrar
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, mb: 2, textAlign: "center" }}
        >
          Crie sua conta para acessar o sistema.
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
            label="Nome"
            autoComplete="name"
            value={nome}
            onChange={(e) => onNomeChange(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Senha"
            type="password"
            autoComplete="new-password"
            value={senha}
            onChange={(e) => onSenhaChange(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirmar senha"
            type="password"
            autoComplete="new-password"
            value={confirmarSenha}
            onChange={(e) => onConfirmarSenhaChange(e.target.value)}
          />

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
              type="button"
              fullWidth
              variant="outlined"
              disabled={loading}
              onClick={onGoLogin}
            >
              Voltar
            </Button>

            <Button type="submit" fullWidth variant="contained" disabled={loading}>
              {loading ? "Criando..." : "Criar conta"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}
