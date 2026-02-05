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
import type { AlbumDto } from "../albumsTypes";

type Order = "asc" | "desc";

type Props = {
  rows: AlbumDto[];
  loading: boolean;

  page: number;
  pageSize: number;
  total: number;

  sortField: "id" | "titulo" | "dataLancamento";
  sortOrder: Order;

  coverUrlById?: Record<number, string>;

  onChangePage: (page: number) => void;
  onChangePageSize: (size: number) => void;
  onChangeSort: (field: Props["sortField"]) => void;

  onView: (row: AlbumDto) => void;
  onEdit?: (row: AlbumDto) => void;
  onDelete?: (row: AlbumDto) => void;
};

export function AlbumsTable({
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

            <TableCell sortDirection={sortField === "titulo" ? sortOrder : false}>
              <TableSortLabel
                active={sortField === "titulo"}
                direction={sortField === "titulo" ? sortOrder : "asc"}
                onClick={createSortHandler("titulo")}
              >
                Título
              </TableSortLabel>
            </TableCell>

            <TableCell sortDirection={sortField === "dataLancamento" ? sortOrder : false}>
              <TableSortLabel
                active={sortField === "dataLancamento"}
                direction={sortField === "dataLancamento" ? sortOrder : "asc"}
                onClick={createSortHandler("dataLancamento")}
              >
                Lançamento
              </TableSortLabel>
            </TableCell>

            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.id}</TableCell>
              <TableCell>{r.titulo}</TableCell>
              <TableCell>{r.dataLancamento ?? ""}</TableCell>
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
                Nenhum álbum encontrado.
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
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Linhas"
      />
    </TableContainer>
  );
}
