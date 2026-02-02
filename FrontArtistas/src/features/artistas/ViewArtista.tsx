import { useEffect, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import type { ArtistaDto } from "./artistasTypes";
import { buscarArtistaPorId } from "./artistasSlice";
import { ArtistaForm } from "./components/ArtistaForm";

export default function ViewArtista() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm<ArtistaDto>({
    defaultValues: { nome: "", genero: "" },
  });

  useEffect(() => {
    const id = Number(params.id);
    if (!id) return;

    setLoading(true);
    buscarArtistaPorId(id)
      .then((data) => reset({ nome: data.nome, genero: data.genero }))
      .finally(() => setLoading(false));
  }, [params.id, reset]);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Visualizar artista</Typography>
      <Paper sx={{ p: 2 }}>
        <ArtistaForm
          control={control}
          onSubmit={handleSubmit(() => { })}
          isLoading={loading}
          isView
          onGoBack={() => navigate("/artists")}
        />
      </Paper>
    </Box>
  );
}
