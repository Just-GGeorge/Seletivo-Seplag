import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import ListAlbums from "./ListAlbums";
import * as slice from "./albumsSlice";

vi.mock("./albumsSlice", async () => {
  const actual = await vi.importActual<any>("./albumsSlice");
  return {
    ...actual,
    listarAlbuns: vi.fn(),
    deletarAlbum: vi.fn(),
    listarArtistasOptions: vi.fn(),
    listarImagensComUrls: vi.fn(),
  };
});

// Pra não testar AlbumsCards aqui, a gente pode mockar o componente e só verificar props e callbacks
vi.mock("./components/AlbumsCards", () => ({
  AlbumsCards: (props: any) => (
    <div>
      <div data-testid="albums-cards" />
      <button onClick={() => props.onDelete(props.rows[0])}>Deletar</button>
    </div>
  ),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <ListAlbums />
    </MemoryRouter>
  );
}

describe("ListAlbums", () => {
  test("carrega artistas options no mount e carrega albuns quando query muda", async () => {
    const listarArtistasOptions = vi.mocked(slice.listarArtistasOptions);
    const listarAlbuns = vi.mocked(slice.listarAlbuns);
    const listarImagensComUrls = vi.mocked(slice.listarImagensComUrls);

    listarArtistasOptions.mockResolvedValueOnce([{ id: 1, nome: "Djavan" }] as any);

    listarAlbuns.mockResolvedValueOnce({
      content: [{ id: 10, titulo: "Alucinação", dataLancamento: "1976-01-01", artistasIds: [1] }],
      totalElements: 1,
    } as any);

    listarImagensComUrls.mockResolvedValueOnce([
      { id: 1, chaveObjeto: "k", tipoConteudo: "image/png", tamanhoBytes: 10, ehCapa: true, url: "u" },
    ] as any);

    renderPage();

    await waitFor(() => expect(listarArtistasOptions).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(listarAlbuns).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(listarImagensComUrls).toHaveBeenCalledWith(10));

    expect(screen.getByTestId("albums-cards")).toBeInTheDocument();
  });

  test("deletar abre modal e ao confirmar chama deletarAlbum e refaz fetch", async () => {
  const listarArtistasOptions = vi.mocked(slice.listarArtistasOptions);
  const listarAlbuns = vi.mocked(slice.listarAlbuns);
  const deletarAlbum = vi.mocked(slice.deletarAlbum);

  listarArtistasOptions.mockResolvedValueOnce([] as any);

  // 1ª carga: 1 album
  listarAlbuns.mockResolvedValueOnce({
    content: [{ id: 10, titulo: "Alucinação", dataLancamento: "1976-01-01", artistasIds: [1] }],
    totalElements: 1,
  } as any);

  renderPage();

  // espera ao menos 1 fetch inicial
  await waitFor(() => expect(listarAlbuns).toHaveBeenCalled());

  const callsBefore = listarAlbuns.mock.calls.length;

  // clica no "Deletar" do mock do AlbumsCards
  await userEvent.click(screen.getByRole("button", { name: /deletar/i }));

  expect(screen.getByText(/deseja realmente remover o álbum/i)).toBeInTheDocument();

  deletarAlbum.mockResolvedValueOnce(undefined as any);

  // depois de deletar, ele refaz fetch
  listarAlbuns.mockResolvedValueOnce({ content: [], totalElements: 0 } as any);

  await userEvent.click(screen.getByRole("button", { name: /^sim$/i }));

  await waitFor(() => expect(deletarAlbum).toHaveBeenCalledWith(10));

  // garante que houve pelo menos mais 1 chamada após o delete
  await waitFor(() => expect(listarAlbuns.mock.calls.length).toBeGreaterThan(callsBefore));
});

});
