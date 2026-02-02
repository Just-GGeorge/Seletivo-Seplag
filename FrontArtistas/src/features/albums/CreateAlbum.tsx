import { useState } from "react";
import { Alert, Box, Paper, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { AlbumDto } from "./albumsTypes";
import { criarAlbum } from "./albumsSlice";
import { AlbumForm } from "./components/AlbumForm";
import { AlbumImages } from "./components/AlbumImages";

export default function CreateAlbum() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const artistaId = Number(params.get("artistaId") ?? "");

  const [savedAlbumId, setSavedAlbumId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const { control, handleSubmit } = useForm<AlbumDto>({
    defaultValues: {
      titulo: "",
      dataLancamento: null,
      artistasIds: artistaId ? [artistaId] : [],
    },
  });

  async function onSubmit(values: AlbumDto) {
    setLoading(true);
    setError(undefined);

    try {
      const created = await criarAlbum({
        titulo: values.titulo.trim(),
        dataLancamento: values.dataLancamento ?? null,
        artistasIds: values.artistasIds ?? [],
      });

      if (created.id) setSavedAlbumId(created.id);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao criar álbum");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Cadastrar álbum
      </Typography>

      <Paper sx={{ p: 2 }}>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <AlbumForm
          control={control}
          onSubmit={handleSubmit(onSubmit)}
          isLoading={loading}
          onGoBack={() => navigate(-1)}
        />

        {savedAlbumId ? <AlbumImages albumId={savedAlbumId} /> : null}
      </Paper>
    </Box>
  );
}
