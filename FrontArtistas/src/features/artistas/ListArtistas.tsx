import { useEffect, useState } from "react";
import { Box, Button, Paper, Stack, Typography, Alert } from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ArtistasFilter } from "./components/ArtistasFilter";
import { ArtistasTable } from "./components/ArtistasTable";
import type { ArtistaDto } from "./artistasTypes";
import { deletarArtista, listarArtistas } from "./artistasSlice";

type Order = "asc" | "desc";

type QueryState = {
  pesquisa: string;
  page: number;
  size: number;
  sortField: "id" | "nome" | "genero";
  sortOrder: Order;
};

type DraftState = {
  pesquisa: string;
};

const LS_KEY = "artists.list.state.v2";

function loadState(): QueryState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) throw new Error("empty");
    return JSON.parse(raw) as QueryState;
  } catch {
    return { pesquisa: "", page: 0, size: 10, sortField: "id", sortOrder: "asc" };
  }
}

function saveState(s: QueryState) {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

export default function ListArtistas() {
  const navigate = useNavigate();

  const [query, setQuery] = useState<QueryState>(() => loadState());
  const [draft, setDraft] = useState<DraftState>(() => ({ pesquisa: query.pesquisa }));

  const [rows, setRows] = useState<ArtistaDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<ArtistaDto | null>(null);
  const [deleting, setDeleting] = useState(false);



  async function fetchData(s: QueryState) {
    setLoading(true);
    setError(undefined);
    try {
      const page = await listarArtistas({
        pesquisa: s.pesquisa,
        page: s.page,
        size: s.size,
        sort: `${s.sortField},${s.sortOrder}`,
      });

      setRows(page.content);
      setTotal(page.totalElements);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao carregar artistas");
    } finally {
      setLoading(false);
    }
  }

  // só roda quando query muda (não quando digita)
  useEffect(() => {
    saveState(query);
    fetchData(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.page, query.size, query.pesquisa, query.sortField, query.sortOrder]);

  function onSearch() {
    setQuery((prev) => ({
      ...prev,
      page: 0,
      pesquisa: draft.pesquisa,
    }));
  }

  function onClear() {
    setDraft({ pesquisa: "" });
    setQuery((prev) => ({ ...prev, page: 0, pesquisa: "" }));
  }

  function onChangeSort(field: QueryState["sortField"]) {
    setQuery((prev) => {
      const isSame = prev.sortField === field;
      const nextOrder: Order = isSame ? (prev.sortOrder === "asc" ? "desc" : "asc") : "asc";
      return { ...prev, sortField: field, sortOrder: nextOrder, page: 0 };
    });
  }

  function onAskDelete(row: ArtistaDto) {
    setRowToDelete(row);
    setConfirmOpen(true);
  }

  async function onConfirmDelete() {
    if (!rowToDelete?.id) return;

    setDeleting(true);
    setError(undefined);

    try {
      await deletarArtista(rowToDelete.id);
      setConfirmOpen(false);
      setRowToDelete(null);
      await fetchData(query);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao excluir artista");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">Artistas</Typography>
        <Button variant="contained" onClick={() => navigate("/artists/new")}>
          Novo artista
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <ArtistasFilter
          pesquisa={draft.pesquisa}
          loading={loading}
          onPesquisaChange={(v) => setDraft({ pesquisa: v })}
          onSearch={onSearch}
          onClear={onClear}
        />

        {error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : null}

        <ArtistasTable
          rows={rows}
          total={total}
          loading={loading}
          page={query.page}
          pageSize={query.size}
          sortField={query.sortField}
          sortOrder={query.sortOrder}
          onChangePage={(p) => setQuery((prev) => ({ ...prev, page: p }))}
          onChangePageSize={(size) => setQuery((prev) => ({ ...prev, size, page: 0 }))}
          onChangeSort={onChangeSort}
          onView={(r) => navigate(`/artists/view/${r.id}`)}
          onEdit={(r) => navigate(`/artists/edit/${r.id}`)}
          onDelete={onAskDelete}
        />

        <Dialog open={confirmOpen} onClose={() => (deleting ? null : setConfirmOpen(false))}>
          <DialogTitle>Confirmação</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Deseja realmente remover o artista <strong>{rowToDelete?.nome ?? ""}</strong>?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)} disabled={deleting} variant="outlined">
              Não
            </Button>
            <Button onClick={onConfirmDelete} disabled={deleting} variant="contained">
              {deleting ? "Excluindo..." : "Sim"}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
