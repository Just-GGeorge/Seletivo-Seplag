import { useEffect, useState } from "react";
import { Alert, Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import type { ArtistaDto } from "./artistasTypes";
import { buscarArtistaPorId } from "./artistasSlice";
import { ArtistaForm } from "./components/ArtistaForm";
import ArtistAlbums from "../albums/ArtistAlbums";
import ArrowBackIosNewOutlined from "@mui/icons-material/ArrowBackIosNewOutlined";



export default function ViewArtista() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const artistaId = Number(params.id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const { control, handleSubmit, reset } = useForm<ArtistaDto>({
    defaultValues: { nome: "", genero: "" },
  });

  useEffect(() => {
    if (!artistaId) return;

    setLoading(true);
    setError(undefined);

    buscarArtistaPorId(artistaId)
      .then((data) => reset({ nome: data.nome, genero: data.genero }))
      .catch((err: any) => setError(err?.message ?? "Erro ao carregar artista"))
      .finally(() => setLoading(false));
  }, [artistaId, reset]);

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Detalhes do artista
          </Typography>
        </Stack>

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <ArtistaForm
          control={control}
          onSubmit={handleSubmit(() => { })}
          isLoading={loading}
          isView
          onGoBack={() => navigate("/artists")}
        />

        <Divider sx={{ my: 3 }} />

        <ArtistAlbums artistId={artistaId} />


        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIosNewOutlined />}
            onClick={() => navigate("/artists")}
          >
            Voltar
          </Button>
        </Box>
      </Paper>



    </Box>
  );
}
