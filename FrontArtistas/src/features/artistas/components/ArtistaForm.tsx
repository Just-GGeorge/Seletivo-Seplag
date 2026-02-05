import { Box, Button, Stack, TextField } from "@mui/material";
import React from "react";
import type { ArtistaDto } from "../artistasTypes";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";

type Props = {
  control: Control<ArtistaDto>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onGoBack: () => void;
  isLoading: boolean;
  isView?: boolean;
};

export function ArtistaForm({ control, onSubmit, onGoBack, isLoading, isView }: Props) {
  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={2} sx={{ maxWidth: 520 }}>
        <Controller
          name="nome"
          control={control}
          rules={{ required: "Informe o nome" }}
          render={({ field, fieldState }) => (
            <TextField
              label="Nome"
              disabled={!!isView}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="genero"
          control={control}
          rules={{ required: "Informe o gênero" }}
          render={({ field, fieldState }) => (
            <TextField
              label="Gênero"
              disabled={!!isView}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              fullWidth
            />
          )}
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end">


          {!isView ? (
            <>
              <Button variant="outlined" onClick={onGoBack}>
                Voltar
              </Button>
              <Button type="submit" variant="contained" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
}
