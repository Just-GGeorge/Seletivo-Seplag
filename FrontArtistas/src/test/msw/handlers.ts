import { http, HttpResponse } from "msw";

const API = (import.meta as any).env?.VITE_API_BASE_URL ?? "/api/v1";

// Mock simples de paginação
function page<T>(content: T[], totalElements = content.length) {
  return {
    content,
    totalElements,
    totalPages: 1,
    number: 0,
    size: content.length,
  };
}

export const handlers = [
  // ---- ARTISTAS
  http.get(`${API}/artists`, ({ request }) => {
    const url = new URL(request.url);
    const pesquisa = url.searchParams.get("pesquisa") ?? "";
    const sizeParam = url.searchParams.get("size") ?? "10";

    const rows = [
      { id: 1, nome: "Djavan", genero: "MPB", qtdAlbuns: 2 },
      { id: 2, nome: "Legião Urbana", genero: "Rock", qtdAlbuns: 5 },
    ].filter((r) => (pesquisa ? r.nome.toLowerCase().includes(pesquisa.toLowerCase()) : true));

    return HttpResponse.json(page(rows.slice(0, Number(sizeParam)), rows.length));
  }),

  http.delete(`${API}/artists/:id`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({ ok: true, id });
  }),

  // ---- ALBUNS
  http.get(`${API}/albums`, ({ request }) => {
    const url = new URL(request.url);
    const titulo = url.searchParams.get("titulo") ?? "";

    const rows = [
      { id: 10, titulo: "Alucinação", dataLancamento: "1976-01-01", artistasIds: [1] },
      { id: 11, titulo: "Oceano", dataLancamento: "1989-01-01", artistasIds: [1] },
    ].filter((r) => (titulo ? r.titulo.toLowerCase().includes(titulo.toLowerCase()) : true));

    return HttpResponse.json(page(rows, rows.length));
  }),

  http.get(`${API}/albums/:albumId/imagens/urls`, ({ params }) => {
    const albumId = Number(params.albumId);
    return HttpResponse.json([
      {
        id: 1000 + albumId,
        chaveObjeto: `k/${albumId}.png`,
        tipoConteudo: "image/png",
        tamanhoBytes: 123,
        ehCapa: true,
        url: "http://signed.url/img.png",
      },
    ]);
  }),

  http.get(`${API}/artists/options`, () => {
    return HttpResponse.json([
      { id: 1, nome: "Djavan" },
      { id: 2, nome: "Legião Urbana" },
    ]);
  }),

  http.delete(`${API}/albums/:id`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({ ok: true, id });
  }),
];
