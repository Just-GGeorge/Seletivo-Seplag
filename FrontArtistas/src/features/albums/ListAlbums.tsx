import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';

import type { AlbumDto, ImagemAlbumComUrlDto } from "./albumsTypes";
import {
  deletarAlbum,
  listarAlbuns,
  listarArtistasOptions,
  listarImagensComUrls,
  type ArtistaOption,
} from "./albumsSlice";
import { AlbumsCards } from "./components/AlbumsCards";

type Order = "asc" | "desc";

type QueryState = {
  titulo: string;
  artistasIds: number[];
  page: number;
  size: number;
  sortField: "id" | "titulo" | "dataLancamento";
  sortOrder: Order;
};

type DraftState = {
  titulo: string;
  artistasIds: number[];
};

const DEFAULT_QUERY: QueryState = {
  titulo: "",
  artistasIds: [],
  page: 0,
  size: 9,
  sortField: "id",
  sortOrder: "asc",
};

const DEFAULT_DRAFT: DraftState = {
  titulo: "",
  artistasIds: [],
};

export default function ListAlbums() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<AlbumDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const [imagesByAlbumId, setImagesByAlbumId] = useState<Record<number, ImagemAlbumComUrlDto[]>>(
    {}
  );

  const [query, setQuery] = useState<QueryState>(DEFAULT_QUERY);
  const [draft, setDraft] = useState<DraftState>(DEFAULT_DRAFT);

  const sortParam = useMemo(
    () => `${query.sortField},${query.sortOrder}`,
    [query.sortField, query.sortOrder]
  );

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState<AlbumDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [artists, setArtists] = useState<ArtistaOption[]>([]);

  async function fetchAlbums(s: QueryState) {
    setLoading(true);
    setError(undefined);

    try {
      const page = await listarAlbuns({
        artistasIds: s.artistasIds.length ? s.artistasIds : undefined,
        titulo: s.titulo,
        page: s.page,
        size: s.size,
        sort: `${s.sortField},${s.sortOrder}`,
      });

      setRows(page.content);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao carregar álbuns");
    } finally {
      setLoading(false);
    }
  }

  function onSearch() {
    setQuery((prev) => ({
      ...prev,
      page: 0,
      titulo: draft.titulo,
      artistasIds: draft.artistasIds,
    }));
  }

  function onClear() {
    setDraft(DEFAULT_DRAFT);
    setQuery((prev) => ({
      ...prev,
      page: 0,
      titulo: DEFAULT_QUERY.titulo,
      artistasIds: DEFAULT_QUERY.artistasIds,
    }));
    setImagesByAlbumId({});
    setError(undefined);
  }

  function askDelete(album: AlbumDto) {
    setAlbumToDelete(album);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!albumToDelete?.id) return;

    setDeleting(true);
    setError(undefined);

    try {
      await deletarAlbum(albumToDelete.id);
      setConfirmOpen(false);
      setAlbumToDelete(null);
      await fetchAlbums(query);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao excluir álbum");
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    listarArtistasOptions()
      .then(setArtists)
      .catch(() => setArtists([]));
  }, []);

  useEffect(() => {
    fetchAlbums(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.page, query.size, query.titulo, sortParam, query.artistasIds]);

  useEffect(() => {
    if (rows.length === 0) return;

    const ids = rows
      .map((a) => a.id)
      .filter((id): id is number => typeof id === "number" && id > 0);

    const missing = ids.filter((id) => !imagesByAlbumId[id]);
    if (missing.length === 0) return;

    Promise.all(
      missing.map(async (albumId) => {
        try {
          const imgs = await listarImagensComUrls(albumId);
          return { albumId, imgs };
        } catch {
          return { albumId, imgs: [] as ImagemAlbumComUrlDto[] };
        }
      })
    ).then((results) => {
      const next: Record<number, ImagemAlbumComUrlDto[]> = {};
      results.forEach((r) => {
        next[r.albumId] = r.imgs;
      });
      setImagesByAlbumId((prev) => ({ ...prev, ...next }));
    });
  }, [rows]);

  return (
    <Box>
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5">Álbuns</Typography>

          <Button variant="contained" onClick={() => navigate("/albums/new")}
            sx={{
              borderRadius: '50px'
            }}
            startIcon={<PlaylistAddIcon />}>
            Novo álbum
          </Button>
        </Stack>

        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            onSearch();
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              label="Título"
              value={draft.titulo}
              onChange={(e) => setDraft((p) => ({ ...p, titulo: e.target.value }))}
            />

            <Autocomplete
              multiple
              options={artists}
              getOptionLabel={(o) => `${o.id} - ${o.nome}`}
              value={artists.filter((o) => draft.artistasIds.includes(o.id))}
              onChange={(_, selected) =>
                setDraft((p) => ({ ...p, artistasIds: selected.map((s) => s.id) }))
              }
              renderInput={(params) => (
                <TextField {...params} label="Artistas" placeholder="Selecione..." fullWidth />
              )}
              sx={{ width: { xs: "100%", sm: 420 } }}
            />

            <Stack direction="row" spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
              <Button type="submit" variant="contained" disabled={!!loading}
                sx={{
                  borderRadius: '50px'
                }}
                startIcon={<SearchIcon />}
              >
                {loading ? "Consultando..." : "Consultar"}

              </Button>

              {draft.titulo.trim() || draft.artistasIds.length > 0 ? (
                <Button variant="outlined" onClick={onClear} disabled={loading}>
                  Limpar
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        {!loading && rows.length === 0 ? (
          <Typography color="text.secondary">Nenhum álbum encontrado.</Typography>
        ) : null}

        {rows.length > 0 ? (
          <AlbumsCards
            rows={rows}
            loading={loading}
            imagesByAlbumId={imagesByAlbumId}
            onView={(a) => navigate(`/albums/view/${a.id}`)}
            onEdit={(a) => navigate(`/albums/edit/${a.id}`)}
            onDelete={askDelete}
          />
        ) : null}

        <Dialog open={confirmOpen} onClose={() => (deleting ? null : setConfirmOpen(false))}>
          <DialogTitle>Confirmação</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Deseja realmente remover o álbum <strong>{albumToDelete?.titulo ?? ""}</strong>?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" disabled={deleting} onClick={() => setConfirmOpen(false)}>
              Não
            </Button>
            <Button variant="contained" disabled={deleting} onClick={confirmDelete}>
              {deleting ? "Excluindo..." : "Sim"}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
