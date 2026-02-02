import  { useEffect, useMemo, useState } from "react";
import {
  Alert,
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

import type { AlbumDto } from "./albumsTypes";
import { deletarAlbum, listarAlbuns, listarImagensComUrls } from "./albumsSlice";
import { AlbumsTable } from "./components/AlbumsTable";

type Order = "asc" | "desc";

type QueryState = {
  titulo: string;
  page: number;
  size: number;
  sortField: "id" | "titulo" | "dataLancamento";
  sortOrder: Order;
};

type DraftState = {
  titulo: string;
};

type Props = {
  artistId: number;
};

export default function ArtistAlbums({ artistId }: Props) {
  const navigate = useNavigate();

  const [rows, setRows] = useState<AlbumDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const [coversByAlbumId, setCoversByAlbumId] = useState<Record<number, string>>({});

  const [query, setQuery] = useState<QueryState>({
    titulo: "",
    page: 0,
    size: 10,
    sortField: "id",
    sortOrder: "asc",
  });

  const [draft, setDraft] = useState<DraftState>({ titulo: "" });

  const sortParam = useMemo(() => `${query.sortField},${query.sortOrder}`, [query.sortField, query.sortOrder]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState<AlbumDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchAlbums(s: QueryState) {
    if (!artistId) return;

    setLoading(true);
    setError(undefined);

    try {
      const page = await listarAlbuns({
        artistaId: artistId,
        titulo: s.titulo,
        page: s.page,
        size: s.size,
        sort: `${s.sortField},${s.sortOrder}`,
      });

      setRows(page.content);
      setTotal(page.totalElements);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao carregar álbuns");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAlbums(query);
  }, [artistId, query.page, query.size, query.titulo, sortParam]);

  useEffect(() => {
    const ids = rows
      .map((a) => a.id)
      .filter((id): id is number => typeof id === "number" && id > 0);

    const missing = ids.filter((id) => !coversByAlbumId[id]);
    if (missing.length === 0) return;

    Promise.all(
      missing.map(async (albumId) => {
        try {
          const imgs = await listarImagensComUrls(albumId);
          const capa = imgs.find((x) => x.ehCapa) ?? imgs[0];
          if (!capa?.url) return null;
          return { albumId, url: capa.url };
        } catch {
          return null;
        }
      })
    ).then((results) => {
      const next: Record<number, string> = {};
      results.forEach((r) => {
        if (r?.albumId && r.url) next[r.albumId] = r.url;
      });
      if (Object.keys(next).length) {
        setCoversByAlbumId((prev) => ({ ...prev, ...next }));
      }
    });
  }, [rows]);

  function onSearch() {
    setQuery((prev) => ({ ...prev, page: 0, titulo: draft.titulo }));
  }

  function onClear() {
    setDraft({ titulo: "" });
    setQuery((prev) => ({ ...prev, page: 0, titulo: "" }));
  }

  function onSort(field: QueryState["sortField"]) {
    setQuery((prev) => {
      const isSame = prev.sortField === field;
      const nextOrder: Order = isSame ? (prev.sortOrder === "asc" ? "desc" : "asc") : "asc";
      return { ...prev, sortField: field, sortOrder: nextOrder, page: 0 };
    });
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

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">Álbuns</Typography>
        <Button variant="contained" onClick={() => navigate(`/albums/new?artistaId=${artistId}`)}>
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
            onChange={(e) => setDraft({ titulo: e.target.value })}
          />

          <Stack direction="row" spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Consultando..." : "Consultar"}
            </Button>
            {draft.titulo.trim() ? (
              <Button variant="outlined" onClick={onClear}>
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

      {rows.length === 0 && !loading ? (
        <Typography color="text.secondary">Este artista ainda não possui álbuns.</Typography>
      ) : (
        <AlbumsTable
          rows={rows}
          total={total}
          loading={loading}
          page={query.page}
          pageSize={query.size}
          sortField={query.sortField}
          sortOrder={query.sortOrder}
          coverUrlById={coversByAlbumId}
          onChangePage={(p) => setQuery((prev) => ({ ...prev, page: p }))}
          onChangePageSize={(size) => setQuery((prev) => ({ ...prev, size, page: 0 }))}
          onChangeSort={onSort}
          onView={(r) => navigate(`/albums/view/${r.id}`)}
          onEdit={(r) => navigate(`/albums/edit/${r.id}`)}
          onDelete={askDelete}
        />
      )}

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
  );
}
