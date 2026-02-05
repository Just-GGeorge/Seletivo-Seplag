import { useEffect, useState } from "react";
import { Alert, Box, Paper, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";

import type { AlbumDto } from "./albumsTypes";
import { criarAlbumComUpload, listarArtistasOptions, type ArtistaOption } from "./albumsSlice";
import { AlbumForm } from "./components/AlbumForm";
import { AlbumImagesPicker } from "./components/AlbumImagesPicker";

export default function CreateAlbum() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const artistaId = Number(params.get("artistaId") ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const [files, setFiles] = useState<File[]>([]);
  const [indiceCapa, setIndiceCapa] = useState<number | undefined>(undefined);

  const [artistOptions, setArtistOptions] = useState<ArtistaOption[]>([]);

  useEffect(() => {
    listarArtistasOptions().then(setArtistOptions).catch(() => setArtistOptions([]));
  }, []);

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

      const res = await criarAlbumComUpload(
        {
          titulo: values.titulo.trim(),
          dataLancamento: values.dataLancamento ?? null,
          artistasIds: values.artistasIds ?? [],
        },
        files,
        indiceCapa
      );

      if (res.album?.id) {
        if (artistaId) navigate(`/artists/view/${artistaId}`, { replace: true });
        else navigate("/artists", { replace: true });
      }
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
          onCancel={() => navigate(-1)}
          artistOptions={artistOptions}
        />


        <AlbumImagesPicker
          files={files}
          indiceCapa={indiceCapa}
          onFilesChange={setFiles}
          onIndiceCapaChange={setIndiceCapa}
          disabled={loading}
        />
      </Paper>
    </Box>
  );
}
