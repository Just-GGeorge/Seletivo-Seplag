import { useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

type Props = {
  files: File[];
  indiceCapa?: number;
  onFilesChange: (files: File[]) => void;
  onIndiceCapaChange: (idx: number | undefined) => void;
  disabled?: boolean;
};

export function AlbumImagesPicker({
  files,
  indiceCapa,
  onFilesChange,
  onIndiceCapaChange,
  disabled,
}: Props) {
  const previews = useMemo(() => {
    return files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
    }));
  }, [files]);

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const next = [...files, ...Array.from(list)];
    onFilesChange(next);
    if (indiceCapa === undefined && next.length > 0) onIndiceCapaChange(0);
  }

  function removeAt(index: number) {
    const next = files.filter((_, i) => i !== index);
    onFilesChange(next);

    if (next.length === 0) {
      onIndiceCapaChange(undefined);
      return;
    }

    if (indiceCapa === undefined) return;

    if (index === indiceCapa) {
      onIndiceCapaChange(0);
      return;
    }

    if (index < indiceCapa) {
      onIndiceCapaChange(indiceCapa - 1);
    }
  }

  function setCover(index: number) {
    onIndiceCapaChange(index);
  }

  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle1">Imagens</Typography>

        <Button
          variant="outlined"
          startIcon={<PhotoLibraryIcon />}
          component="label"
          disabled={!!disabled}
        >
          Adicionar
          <input
            hidden
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={(e) => addFiles(e.target.files)}
          />
        </Button>
      </Stack>

      {files.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Nenhuma imagem selecionada (opcional).
        </Typography>
      ) : (
        <>
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
            <Chip
              size="small"
              label={`${files.length} arquivo(s)`}
              variant="outlined"
            />
            {indiceCapa !== undefined ? (
              <Chip
                size="small"
                label={`Capa: ${indiceCapa + 1}`}
                variant="outlined"
              />
            ) : null}
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
            {previews.map((p, idx) => {
              const isCover = indiceCapa === idx;

              return (
                <Box key={`${p.file.name}-${idx}`}>
                  <Box
                    sx={{
                      position: "relative",
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: isCover ? "primary.main" : "divider",
                      bgcolor: "action.hover",
                      height: 140,
                    }}
                  >
                    <Box
                      component="img"
                      src={p.url}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                        bgcolor: "action.hover",
                      }}
                    />

                    <Box
                      sx={{
                        position: "absolute",
                        top: 6,
                        left: 6,
                        display: "flex",
                        gap: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => setCover(idx)}
                        disabled={!!disabled}
                        sx={{ bgcolor: "background.paper" }}
                      >
                        {isCover ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                      </IconButton>
                    </Box>

                    <Box
                      sx={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        display: "flex",
                        gap: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => removeAt(idx)}
                        disabled={!!disabled}
                        sx={{ bgcolor: "background.paper" }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {isCover ? (
                      <Box sx={{ position: "absolute", bottom: 6, left: 6 }}>
                        <Chip size="small" label="Capa" color="primary" />
                      </Box>
                    ) : null}
                  </Box>

                  <Typography variant="caption" color="text.secondary" noWrap sx={{ mt: 0.5, display: "block" }}>
                    {p.file.name}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </>
      )}
    </Paper>
  );
}
