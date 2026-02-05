import { useEffect, useState } from "react";
import { Box, Paper, Typography, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import type { ArtistaDto } from "./artistasTypes";
import { atualizarArtista, buscarArtistaPorId } from "./artistasSlice";
import { ArtistaForm } from "./components/ArtistaForm";


export default function EditArtista() {
    const navigate = useNavigate();
    const params = useParams<{ id: string }>();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const { control, handleSubmit, reset } = useForm<ArtistaDto>({
        defaultValues: { nome: "", genero: "" },
    });

    const id = Number(params.id);

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        setError(undefined);

        buscarArtistaPorId(id)
            .then((data) => {
                reset({ nome: data.nome, genero: data.genero });
            })
            .catch((err: any) => {
                setError(err?.message ?? "Erro ao carregar artista");
            })
            .finally(() => setLoading(false));
    }, [id, reset]);

    async function onSubmit(values: ArtistaDto) {
        if (!id) return;

        setLoading(true);
        setError(undefined);

        try {
            await atualizarArtista(id, {
                nome: values.nome.trim(),
                genero: values.genero.trim(),
            });
            navigate("/artists", { replace: true });
        } catch (err: any) {
            setError(err?.message ?? "Erro ao atualizar artista");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Editar artista
            </Typography>

            <Paper sx={{ p: 2 }}>
                {error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                ) : null}

                <ArtistaForm
                    control={control}
                    onSubmit={handleSubmit(onSubmit)}
                    isLoading={loading}
                    onGoBack={() => navigate("/artists")}
                />
            </Paper>
        </Box>
    );
}
