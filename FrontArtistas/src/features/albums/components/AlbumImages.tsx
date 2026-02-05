import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import type { ImagemAlbumComUrlDto } from "../albumsTypes";
import { definirCapa, deletarImagem, listarImagensComUrls, uploadImagens } from "../albumsSlice";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { IconButton } from "@mui/material";
type Props = {
  albumId: number;
  readOnly?: boolean;
};

export function AlbumImages({ albumId, readOnly }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [items, setItems] = useState<ImagemAlbumComUrlDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [target, setTarget] = useState<ImagemAlbumComUrlDto | null>(null);
  const [deleting, setDeleting] = useState(false);


  async function refresh() {
    setLoading(true);
    setError(undefined);
    try {
      const data = await listarImagensComUrls(albumId);
      setItems(data);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao carregar imagens");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [albumId]);

  async function onUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    const arr = Array.from(files);

    setLoading(true);
    setError(undefined);

    try {
      await uploadImagens(albumId, arr, 0);
      await refresh();
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      setError(err?.message ?? "Erro no upload");
    } finally {
      setLoading(false);
    }
  }

  async function onSetCapa(imagemId: number) {
    setLoading(true);
    setError(undefined);

    try {
      await definirCapa(albumId, imagemId);
      await refresh();
    } catch (err: any) {
      setError(err?.message ?? "Erro ao definir capa");
    } finally {
      setLoading(false);
    }
  }

  function onAskDelete(it: ImagemAlbumComUrlDto) {
    setTarget(it);
    setConfirmOpen(true);
  }

  async function onConfirmDelete() {
    if (!target?.id) return;

    setDeleting(true);
    setError(undefined);

    try {
      await deletarImagem(albumId, target.id);
      setConfirmOpen(false);
      setTarget(null);
      await refresh();
    } catch (err: any) {
      setError(err?.message ?? "Erro ao excluir imagem");
    } finally {
      setDeleting(false);
    }
  }

  return (
  <Box sx={{ mt: 3 }}>
    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
      <Typography variant="h6">Imagens do Álbum</Typography>

      {!readOnly ? (
        <>
          <input
            ref={fileRef}
            type="file"
            multiple
            hidden
            onChange={(e) => onUpload(e.target.files)}
            accept="image/*"
          />
          <Button
            variant="contained"
            disabled={loading}
            onClick={() => fileRef.current?.click()}
            sx={{ borderRadius: "50px" }}
            startIcon={<AddPhotoAlternateIcon />}
          >
            Adicionar
          </Button>
        </>
      ) : null}
    </Stack>

    {error ? (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    ) : null}

    {items.length === 0 && !loading ? (
      <Typography color="text.secondary">Nenhuma imagem cadastrada.</Typography>
    ) : null}

    <Stack direction="row" flexWrap="wrap" gap={2}>
      {items.map((it) => {
        const isCover = it.ehCapa === true;

        return (
          <Card
            key={it.id}
            sx={{
              width: 220,
              overflow: "hidden",
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.08)",
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ position: "relative", p: 1.25, pb: 1.5 }}>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1 / 1",
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                  p: 1,
                  overflow: "hidden",
                }}
              >
                {it.url ? (
                  <Box
                    component="img"
                    src={it.url}
                    alt="imagem do álbum"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                      borderRadius: 2,
                      bgcolor: "rgba(0,0,0,0.25)",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 2,
                      bgcolor: "rgba(0,0,0,0.20)",
                    }}
                  />
                )}

                {!readOnly ? (
                  <>
                    <IconButton
                      size="small"
                      disabled={loading}
                      onClick={() => onSetCapa(it.id)}
                      sx={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        bgcolor: "rgba(17,24,39,0.72)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        backdropFilter: "blur(6px)",
                        "&:hover": { bgcolor: "rgba(17,24,39,0.88)" },
                      }}
                    >
                      {isCover ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                    </IconButton>

                    <IconButton
                      size="small"
                      disabled={loading}
                      onClick={() => onAskDelete(it)}
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        bgcolor: "rgba(17,24,39,0.72)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        backdropFilter: "blur(6px)",
                        "&:hover": { bgcolor: "rgba(17,24,39,0.88)" },
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : null}

                {isCover ? (
                  <Box sx={{ position: "absolute", bottom: 10, left: 10 }}>
                    <Chip
                      size="small"
                      label="Capa"
                      color="primary"
                      sx={{
                        bgcolor: "#22c55e",
                        border: "1px solid rgba(255,255,255,0.10)",
                        backdropFilter: "blur(6px)",
                      }}
                    />
                  </Box>
                ) : null}
              </Box>
            </Box>

            
          </Card>
        );
      })}
    </Stack>

    <Dialog open={confirmOpen} onClose={() => (deleting ? null : setConfirmOpen(false))}>
      <DialogTitle>Confirmação</DialogTitle>
      <DialogContent>
        <DialogContentText>Deseja realmente remover esta imagem?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" disabled={deleting} onClick={() => setConfirmOpen(false)}>
          Não
        </Button>
        <Button variant="contained" disabled={deleting} onClick={onConfirmDelete}>
          {deleting ? "Removendo..." : "Sim"}
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
);


}
