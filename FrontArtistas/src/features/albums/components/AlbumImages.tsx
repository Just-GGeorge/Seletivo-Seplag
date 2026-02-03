import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
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

  const capaId = useMemo(() => items.find((x) => x.ehCapa)?.id, [items]);

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
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">Imagens</Typography>

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
            <Card key={it.id} sx={{ width: 220, overflow: "hidden" }}>
              <Box sx={{ position: "relative" }}>
                <CardMedia
                  component="img"
                  image={it.url}
                  sx={{
                    height: 150,
                    objectFit: "contain",
                    bgcolor: "action.hover",
                    display: "block",
                  }}
                />

                {!readOnly ? (
                  <>
                    <IconButton
                      size="small"
                      disabled={loading}
                      onClick={() => onSetCapa(it.id)}
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        bgcolor: "background.paper",
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
                        top: 8,
                        right: 8,
                        bgcolor: "background.paper",
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>

                    {isCover ? (
                      <Box sx={{ position: "absolute", bottom: 8, left: 8 }}>
                        <Chip size="small" label="Capa" color="primary" />
                      </Box>
                    ) : null}
                  </>
                ) : (
                  isCover ? (
                    <Box sx={{ position: "absolute", bottom: 8, left: 8 }}>
                      <Chip size="small" label="Capa" color="primary" />
                    </Box>
                  ) : null
                )}
              </Box>

              <CardContent sx={{ pb: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  {!isCover && capaId ? <Chip size="small" label="Imagem" /> : null}
                </Stack>
              </CardContent>

              {/* {!readOnly ? (
                <CardActions sx={{ pt: 0 }}>
                  <Button
                    size="small"
                    color="error"
                    disabled={loading}
                    onClick={() => onAskDelete(it)}
                  >
                    Remover
                  </Button>
                </CardActions>
              ) : null} */}
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
