import { useEffect, useState } from "react";
import { Alert, Box, Paper, Stack, Tooltip, Typography, IconButton, Button, Divider } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import type { AlbumDto } from "./albumsTypes";
import { atualizarAlbum, buscarAlbumPorId, listarArtistasOptions, type ArtistaOption } from "./albumsSlice";
import { AlbumForm } from "./components/AlbumForm";
import { AlbumImages } from "./components/AlbumImages";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIosNewOutlined from "@mui/icons-material/ArrowBackIosNewOutlined";

export default function EditAlbum() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isEditing, setIsEditing] = useState(false);

  const [initial, setInitial] = useState<AlbumDto | null>(null);

  const [artistOptions, setArtistOptions] = useState<ArtistaOption[]>([]);

  useEffect(() => {
    listarArtistasOptions().then(setArtistOptions).catch(() => setArtistOptions([]));
  }, []);

  const { control, handleSubmit, reset } = useForm<AlbumDto>({
    defaultValues: { titulo: "", dataLancamento: null, artistasIds: [] },
  });

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(undefined);

    buscarAlbumPorId(id)
      .then((data) => {
        const values: AlbumDto = {
          id: data.id,
          titulo: data.titulo ?? "",
          dataLancamento: data.dataLancamento ?? null,
          artistasIds: data.artistasIds ?? [],
        };

        setInitial(values);
        reset(values);
      })
      .catch((err: any) => setError(err?.message ?? "Erro ao carregar álbum"))
      .finally(() => setLoading(false));
  }, [id, reset]);

  function onStartEdit() {
    setIsEditing(true);
  }

  function onCancelEdit() {
    if (initial) reset(initial);
    setIsEditing(false);
    setError(undefined);
  }

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


      <Paper sx={{ p: 2 }}>

        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Typography variant="h5">Editar álbum</Typography>

          {!isEditing ? (
            <Tooltip title="Editar">
              <IconButton
                onClick={onStartEdit}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                  borderRadius: 2,
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <AlbumForm
          control={control}
          onSubmit={handleSubmit(onSubmit)}
          isLoading={loading}
          isView={!isEditing}
          hideActions={!isEditing}
          onCancel={onCancelEdit}
          artistOptions={artistOptions}

        />

        <Divider sx={{ my: 3 }} />

        {id ? <AlbumImages albumId={id} readOnly={isEditing} /> : null}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIosNewOutlined />}
            onClick={() => navigate(-1)}
          >
            Voltar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
