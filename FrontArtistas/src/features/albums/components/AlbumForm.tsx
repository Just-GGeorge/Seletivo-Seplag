import { Box, Button, Stack, TextField } from "@mui/material";
import React from "react";
import { Controller, type Control } from "react-hook-form";
import type { AlbumDto } from "../albumsTypes";

type Props = {
  control: Control<AlbumDto>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  isLoading: boolean;
  isView?: boolean;
  hideActions?: boolean;
  onCancel?: () => void;
};

export function AlbumForm({ control, onSubmit, isLoading, isView, hideActions, onCancel }: Props) {

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={2} sx={{ maxWidth: 520 }}>
        <Controller
          name="titulo"
          control={control}
          rules={{ required: "Informe o título" }}
          render={({ field, fieldState }) => (
            <TextField
              label="Título"
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              disabled={!!isView}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="dataLancamento"
          control={control}
          render={({ field }) => (
            <TextField
              label="Data de lançamento"
              type="date"
              value={(field.value ?? "") as string}
              onChange={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              disabled={!!isView}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          )}
        />

        {!hideActions ? (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {onCancel ? (
              <Button variant="outlined" disabled={isLoading} onClick={onCancel}>
                Cancelar
              </Button>
            ) : null}
            {!isView ? (
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
            ) : null}
          </Stack>
        ) : null}
        
      </Stack>
    </Box>
  );
}
