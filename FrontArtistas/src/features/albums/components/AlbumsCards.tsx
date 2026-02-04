import { useMemo, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Typography,
    Chip,
    Tooltip,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import type { AlbumDto, ImagemAlbumComUrlDto } from "../albumsTypes";

type Props = {
    rows: AlbumDto[];
    loading: boolean;
    imagesByAlbumId: Record<number, ImagemAlbumComUrlDto[]>;
    onView: (row: AlbumDto) => void;
    onEdit?: (row: AlbumDto) => void;
    onDelete?: (row: AlbumDto) => void;
};

export function AlbumsCards({ rows, loading, imagesByAlbumId, onView, onEdit, onDelete }: Props) {
    const [indexById, setIndexById] = useState<Record<number, number>>({});

    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const [menuAlbumId, setMenuAlbumId] = useState<number | null>(null);

    const openMenu = Boolean(menuAnchor);

    const albumById = useMemo(() => {
        const map: Record<number, AlbumDto> = {};
        rows.forEach((a) => {
            if (a.id) map[a.id] = a;
        });
        return map;
    }, [rows]);

    function currentIndex(albumId: number, length: number) {
        const idx = indexById[albumId] ?? 0;
        if (length <= 0) return 0;
        return Math.max(0, Math.min(idx, length - 1));
    }

    function setPrev(albumId: number, length: number) {
        if (length <= 1) return;
        setIndexById((prev) => {
            const idx = currentIndex(albumId, length);
            const next = idx - 1 < 0 ? length - 1 : idx - 1;
            return { ...prev, [albumId]: next };
        });
    }

    function setNext(albumId: number, length: number) {
        if (length <= 1) return;
        setIndexById((prev) => {
            const idx = currentIndex(albumId, length);
            const next = idx + 1 >= length ? 0 : idx + 1;
            return { ...prev, [albumId]: next };
        });
    }

    function onOpenMenu(e: React.MouseEvent<HTMLElement>, albumId: number) {
        setMenuAnchor(e.currentTarget);
        setMenuAlbumId(albumId);
    }

    function onCloseMenu() {
        setMenuAnchor(null);
        setMenuAlbumId(null);
    }

    const selectedAlbum = menuAlbumId ? albumById[menuAlbumId] : undefined;

    return (
        <>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                    gap: 2,
                    mt: 2,
                    opacity: loading ? 0.7 : 1,
                    pointerEvents: loading ? "none" : "auto",
                }}
            >
                {rows.map((album) => {
                    const id = album.id ?? 0;
                    const imgs = id ? imagesByAlbumId[id] ?? [] : [];
                    const capaIdx = imgs.findIndex((x) => x.ehCapa);
                    const idx = currentIndex(id, imgs.length);
                    const effectiveIdx = capaIdx >= 0 && (indexById[id] == null) ? capaIdx : idx;
                    const current = imgs[effectiveIdx];

                    return (
                        <Card key={id}
                            onClick={() => onEdit?.(album)}
                            sx={{
                                overflow: "hidden", cursor: onEdit ? "pointer" : "default"
                            }}>
                            <Box sx={{ position: "relative", height: 200, bgcolor: "action.hover" }}>
                                {current?.url ? (
                                    <Box sx={{ position: "relative", height: 200, bgcolor: "action.hover" }}>
                                        <Box
                                            component="img"
                                            src={current.url}
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "contain",
                                                display: "block",
                                                bgcolor: "action.hover",
                                            }}
                                        />
                                    </Box>
                                ) : (
                                    <Box sx={{ width: "100%", height: "100%" }} />
                                )}

                                <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onOpenMenu(e, id);
                                        }}
                                        sx={{ bgcolor: "background.paper" }}
                                    >
                                        <SettingsIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                {imgs.length > 1 ? (
                                    <>
                                        <Box sx={{ position: "absolute", top: "50%", left: 8, transform: "translateY(-50%)" }}>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPrev(id, imgs.length);
                                                }}
                                                sx={{ bgcolor: "background.paper" }}
                                            >
                                                <ChevronLeftIcon fontSize="small" />
                                            </IconButton>
                                        </Box>

                                        <Box sx={{ position: "absolute", top: "50%", right: 8, transform: "translateY(-50%)" }}>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setNext(id, imgs.length)
                                                }}
                                                sx={{ bgcolor: "background.paper" }}
                                            >
                                                <ChevronRightIcon fontSize="small" />
                                            </IconButton>
                                        </Box>

                                        <Box sx={{ position: "absolute", bottom: 8, left: 8 }}>
                                            <Chip
                                                size="small"
                                                label={`${effectiveIdx + 1}/${imgs.length}`}
                                                sx={{ bgcolor: "background.paper" }}
                                            />
                                        </Box>
                                    </>
                                ) : null}
                            </Box>

                            <CardContent>
                                <Stack spacing={0.5}>
                                    <Tooltip title={album.titulo}>
                                        <Typography variant="subtitle1" noWrap>
                                            {album.titulo}
                                        </Typography>
                                    </Tooltip>

                                    <Typography variant="body2" color="text.secondary">
                                        {album.dataLancamento ?? ""}
                                    </Typography>

                                    <ButtonRow
                                        onView={() => onView(album)}
                                        showQuickView={imgs.length === 0}
                                    />
                                </Stack>
                            </CardContent>
                        </Card>
                    );
                })}
            </Box>

            <Menu anchorEl={menuAnchor} open={openMenu} onClose={onCloseMenu}>
                {/* <MenuItem
                    onClick={() => {
                        if (selectedAlbum) onView(selectedAlbum);
                        onCloseMenu();
                    }}
                >
                    Visualizar
                </MenuItem> */}

                {onEdit ? (
                    <MenuItem
                        onClick={() => {
                            if (selectedAlbum) onEdit(selectedAlbum);
                            onCloseMenu();
                        }}
                    >
                        Editar
                    </MenuItem>
                ) : null}

                {onDelete ? (
                    <MenuItem
                        onClick={() => {
                            if (selectedAlbum) onDelete(selectedAlbum);
                            onCloseMenu();
                        }}
                    >
                        Excluir
                    </MenuItem>
                ) : null}
            </Menu>
        </>
    );
}

function ButtonRow({ onView, showQuickView }: { onView: () => void; showQuickView: boolean }) {
    return (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <IconButton onClick={onView} size="small" aria-label="visualizar">
                <SettingsIcon sx={{ opacity: showQuickView ? 0 : 0 }} />
            </IconButton>
        </Box>
    );
}
