import { useEffect, useState } from "react";
import { Alert, Box, Paper, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import type { AlbumDto } from "./albumsTypes";
import { atualizarAlbum, buscarAlbumPorId } from "./albumsSlice";
import { AlbumForm } from "./components/AlbumForm";
import { AlbumImages } from "./components/AlbumImages";

export default function EditAlbum() {
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

  async function onSubmit(values: AlbumDto) {
    if (!id) return;

    setLoading(true);
    setError(undefined);

    try {
      await atualizarAlbum(id, {
        titulo: values.titulo.trim(),
        dataLancamento: values.dataLancamento ?? null,
        artistasIds: values.artistasIds ?? [],
      });
      navigate(-1);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao atualizar álbum");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Editar álbum
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

        {id ? <AlbumImages albumId={id} /> : null}
      </Paper>
    </Box>
  );
}
