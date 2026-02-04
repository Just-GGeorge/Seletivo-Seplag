import { apiSlice } from "../../core/api/apiSlice";
import { listarArtistas } from "../artistas/artistasSlice";
import type {
  AlbumComImagensDto,
  AlbumDto,
  ImagemAlbumComUrlDto,
  ImagemAlbumDto,
  ListAlbumsParams,
  PageResponse,
} from "./albumsTypes";

const ALBUMS_ENDPOINT = "/albuns";

function buildAlbumsListParams(p: ListAlbumsParams) {
  const qs = new URLSearchParams();

  if (p.artistasIds?.length) {
    p.artistasIds.forEach((id) => qs.append("artistaIds", String(id)));
  } else if (p.artistaId !== undefined) {
    qs.set("artistaId", String(p.artistaId));
  }

  qs.set("titulo", p.titulo ?? "");
  qs.set("page", String(p.page ?? 0));
  qs.set("size", String(p.size ?? 10));
  if (p.sort) qs.set("sort", p.sort);

  return qs.toString();
}

export async function listarAlbuns(params: ListAlbumsParams) {
  const qs = buildAlbumsListParams(params);
  return apiSlice.get<PageResponse<AlbumDto>>(`${ALBUMS_ENDPOINT}?${qs}`);
}

export type ArtistaOption = { id: number; nome: string };

export async function listarArtistasOptions() {
  const res = await listarArtistas({
    pesquisa: "",
    page: 0,
    size: 200,
    sort: "nome,asc",
  });

  return (res.content ?? [])
    .filter((a) => typeof a.id === "number")
    .map((a) => ({ id: a.id as number, nome: a.nome ?? "" }));
}

export async function buscarAlbumPorId(id: number) {
  return apiSlice.get<AlbumDto>(`${ALBUMS_ENDPOINT}/${id}`);
}

export async function criarAlbum(payload: AlbumDto) {
  return apiSlice.post<AlbumDto>(ALBUMS_ENDPOINT, payload);
}

export async function criarAlbumComUpload(dto: AlbumDto, arquivos?: File[], indiceCapa?: number) {
  const form = new FormData();

  form.append("dto", new Blob([JSON.stringify(dto)], { type: "application/json" }));
  (arquivos ?? []).forEach((f) => form.append("arquivos", f));

  const qs = new URLSearchParams();
  if (indiceCapa !== undefined && indiceCapa !== null) qs.set("indiceCapa", String(indiceCapa));

  const url =
    qs.toString().length > 0
      ? `${ALBUMS_ENDPOINT}/with-upload?${qs.toString()}`
      : `${ALBUMS_ENDPOINT}/with-upload`;

  return apiSlice.post<AlbumComImagensDto>(url, form);
}

export async function atualizarAlbum(id: number, payload: AlbumDto) {
  return apiSlice.put<AlbumDto>(`${ALBUMS_ENDPOINT}/${id}`, payload);
}

export async function deletarAlbum(id: number) {
  return apiSlice.del<void>(`${ALBUMS_ENDPOINT}/${id}`);
}

export async function listarImagens(albumId: number) {
  return apiSlice.get<ImagemAlbumDto>(`${ALBUMS_ENDPOINT}/${albumId}/imagens`);
}

export async function listarImagensComUrls(albumId: number) {
  return apiSlice.get<ImagemAlbumComUrlDto[]>(`${ALBUMS_ENDPOINT}/${albumId}/imagens/urls`);
}

export async function adicionarImagem(albumId: number, dto: ImagemAlbumDto) {
  return apiSlice.post<ImagemAlbumDto>(`${ALBUMS_ENDPOINT}/${albumId}/imagens`, dto);
}

export async function uploadImagens(albumId: number, arquivos: File[], indiceCapa?: number) {
  const form = new FormData();
  arquivos.forEach((f) => form.append("arquivos", f));

  const qs = new URLSearchParams();
  if (indiceCapa !== undefined && indiceCapa !== null) qs.set("indiceCapa", String(indiceCapa));

  const url =
    qs.toString().length > 0
      ? `${ALBUMS_ENDPOINT}/${albumId}/imagens/upload?${qs.toString()}`
      : `${ALBUMS_ENDPOINT}/${albumId}/imagens/upload`;

  return apiSlice.post<ImagemAlbumDto[]>(url, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function definirCapa(albumId: number, imagemId: number) {
  return apiSlice.patch<ImagemAlbumDto>(`${ALBUMS_ENDPOINT}/${albumId}/imagens/${imagemId}/capa`);
}

export async function urlAssinadaImagem(albumId: number, imagemId: number) {
  return apiSlice.get<{ url: string }>(`${ALBUMS_ENDPOINT}/${albumId}/imagens/${imagemId}/url`);
}

export async function deletarImagem(albumId: number, imagemId: number) {
  return apiSlice.del<void>(`${ALBUMS_ENDPOINT}/${albumId}/imagens/${imagemId}`);
}
