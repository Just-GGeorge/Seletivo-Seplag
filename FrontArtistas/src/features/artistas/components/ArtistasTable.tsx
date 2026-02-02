import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { ArtistaDto } from "../artistasTypes";

type Order = "asc" | "desc";

type Props = {
  rows: ArtistaDto[];
  loading: boolean;

  page: number;
  pageSize: number;
  total: number;

  sortField: "id" | "nome" | "genero";
  sortOrder: Order;

  onChangePage: (page: number) => void;
  onChangePageSize: (size: number) => void;
  onChangeSort: (field: Props["sortField"]) => void;

  onView: (row: ArtistaDto) => void;
  onEdit?: (row: ArtistaDto) => void;
  onDelete?: (row: ArtistaDto) => void;
};

export function ArtistasTable({
  rows,
  loading,
  page,
  pageSize,
  total,
  sortField,
  sortOrder,
  onChangePage,
  onChangePageSize,
  onChangeSort,
  onView,
  onEdit,
  onDelete,
}: Props) {
  const createSortHandler = (field: Props["sortField"]) => () => onChangeSort(field);

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sortDirection={sortField === "id" ? sortOrder : false}>
              <TableSortLabel
                active={sortField === "id"}
                direction={sortField === "id" ? sortOrder : "asc"}
                onClick={createSortHandler("id")}
              >
                ID
              </TableSortLabel>
            </TableCell>

            <TableCell sortDirection={sortField === "nome" ? sortOrder : false}>
              <TableSortLabel
                active={sortField === "nome"}
                direction={sortField === "nome" ? sortOrder : "asc"}
                onClick={createSortHandler("nome")}
              >
                Nome
              </TableSortLabel>
            </TableCell>

            <TableCell sortDirection={sortField === "genero" ? sortOrder : false}>
              <TableSortLabel
                active={sortField === "genero"}
                direction={sortField === "genero" ? sortOrder : "asc"}
                onClick={createSortHandler("genero")}
              >
                Gênero
              </TableSortLabel>
            </TableCell>

            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.id}</TableCell>
              <TableCell>{r.nome}</TableCell>
              <TableCell>{r.genero}</TableCell>
              <TableCell align="right">
                <Tooltip title="Visualizar">
                  <IconButton onClick={() => onView(r)} size="small">
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {onEdit ? (
                  <Tooltip title="Editar">
                    <IconButton onClick={() => onEdit(r)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : null}

                {onDelete ? (
                  <Tooltip title="Excluir">
                    <IconButton onClick={() => onDelete(r)} size="small" disabled={loading}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : null}
              </TableCell>
            </TableRow>
          ))}

          {!loading && rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                Nenhum artista encontrado.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, newPage) => onChangePage(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => onChangePageSize(Number(e.target.value))}
        rowsPerPageOptions={[2, 10, 25, 50]}
        labelRowsPerPage="Linhas"
      />
    </TableContainer>
  );
}
