import { useEffect, useState } from "react";
import { Alert, Box, Paper, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import type { AlbumDto } from "./albumsTypes";
import { buscarAlbumPorId } from "./albumsSlice";
import { AlbumForm } from "./components/AlbumForm";
import { AlbumImages } from "./components/AlbumImages";

export default function ViewAlbum() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const { control, handleSubmit, reset } = useForm<AlbumDto>({
    defaultValues: { titulo: "", dataLancamento: null, artistasIds: [] },
  });

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(undefined);

    buscarAlbumPorId(id)
      .then((data) => {
        reset({
          titulo: data.titulo ?? "",
          dataLancamento: data.dataLancamento ?? null,
          artistasIds: data.artistasIds ?? [],
        });
      })
      .catch((err: any) => setError(err?.message ?? "Erro ao carregar álbum"))
      .finally(() => setLoading(false));
  }, [id, reset]);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Visualizar álbum
      </Typography>

      <Paper sx={{ p: 2 }}>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <AlbumForm
          control={control}
          onSubmit={handleSubmit(() => {})}
          isLoading={loading}
          isView
          onGoBack={() => navigate(-1)}
        />

        {id ? <AlbumImages albumId={id} readOnly /> : null}
      </Paper>
    </Box>
  );
}
