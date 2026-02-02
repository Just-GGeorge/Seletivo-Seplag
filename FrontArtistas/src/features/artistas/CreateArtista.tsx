import  {  useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import type { ArtistaDto } from "./artistasTypes";
import { criarArtista } from "./artistasSlice";
import { ArtistaForm } from "./components/ArtistaForm";


export default function CreateArtista() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm<ArtistaDto>({
    defaultValues: { nome: "", genero: "" },
  });

  async function onSubmit(values: ArtistaDto) {
    setLoading(true);
    try {
      await criarArtista({ nome: values.nome.trim(), genero: values.genero.trim() });
      navigate("/artists", { replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Cadastrar artista</Typography>
      <Paper sx={{ p: 2 }}>
        <ArtistaForm
          control={control}
          onSubmit={handleSubmit(onSubmit)}
          isLoading={loading}
          onGoBack={() => navigate("/artists")}
        />
      </Paper>
    </Box>
  );
}
