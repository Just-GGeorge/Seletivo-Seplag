import { apiSlice } from "../../core/api/apiSlice";
import type { ArtistaDto, ListArtistasParams, PageResponse } from "./artistasTypes";

const ENDPOINT = "/artistas";

function buildListParams(p: ListArtistasParams) {
  const qs = new URLSearchParams();

  qs.set("pesquisa", p.pesquisa ?? "");
  qs.set("page", String(p.page ?? 0));
  qs.set("size", String(p.size ?? 10));

  if (p.sort) qs.set("sort", p.sort);

  return qs.toString();
}

export async function listarArtistas(params: ListArtistasParams) {
  const qs = buildListParams(params);
  return apiSlice.get<PageResponse<ArtistaDto>>(`${ENDPOINT}?${qs}`);
}

export async function buscarArtistaPorId(id: number) {
  return apiSlice.get<ArtistaDto>(`${ENDPOINT}/${id}`);
}

export async function criarArtista(payload: ArtistaDto) {
  return apiSlice.post<ArtistaDto>(ENDPOINT, payload);
}

export async function atualizarArtista(id: number, payload: ArtistaDto) {
  return apiSlice.put<ArtistaDto>(`${ENDPOINT}/${id}`, payload);
}

export async function deletarArtista(id: number) {
  return apiSlice.del<void>(`${ENDPOINT}/${id}`);
}
