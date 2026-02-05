import { Box, Button, Stack, TextField } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

type Props = {
  pesquisa: string;
  loading?: boolean;
  onPesquisaChange: (v: string) => void;
  onSearch: () => void;
  onClear?: () => void;
};

export function ArtistasFilter({ pesquisa, loading, onPesquisaChange, onSearch, onClear }: Props) {
  return (
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
          label="Pesquisa"
          placeholder="Nome ou gênero"
          value={pesquisa}
          onChange={(e) => onPesquisaChange(e.target.value)}
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

          {onClear && pesquisa.trim() !== "" ? (
            <Button variant="outlined" onClick={onClear}
              sx={{
                borderRadius: '50px'
              }}
              startIcon={<CloseIcon />}>
              Limpar
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
}
