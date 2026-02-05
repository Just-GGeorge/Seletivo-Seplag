import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import * as slice from "./albumsSlice";
import EditAlbum from "./EditAlbum.tsx";

// ---- mock navigate + params
const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ id: "10" }),
  };
});

// ---- mock do slice
vi.mock("./albumsSlice", async () => {
  const actual = await vi.importActual<any>("./albumsSlice");
  return {
    ...actual,
    buscarAlbumPorId: vi.fn(),
    atualizarAlbum: vi.fn(),
    listarArtistasOptions: vi.fn(),
  };
});

// ---- mock do react-hook-form: reset + handleSubmit
const resetMock = vi.fn();
vi.mock("react-hook-form", () => ({
  useForm: () => ({
    control: {},
    reset: resetMock,
    handleSubmit: (fn: any) => () =>
      fn({
        titulo: "  Titulo Editado  ",
        dataLancamento: null,
        artistasIds: [1, 2],
      }),
  }),
}));

// ---- mock AlbumForm: renderiza botão salvar/cancelar e respeita isView/hideActions
vi.mock("./components/AlbumForm", () => ({
  AlbumForm: (props: any) => (
    <div>
      <div data-testid="album-form-mock" />
      {/* quando hideActions=true, não renderiza salvar (simulando seu comportamento) */}
      {!props.hideActions ? (
        <>
          <button onClick={props.onSubmit} disabled={props.isLoading}>
            Salvar
          </button>
          <button onClick={props.onCancel}>Cancelar</button>
        </>
      ) : null}
      <div data-testid="isView">{String(!!props.isView)}</div>
    </div>
  ),
}));

// ---- mock AlbumImages
vi.mock("./components/AlbumImages", () => ({
  AlbumImages: (props: any) => <div data-testid="album-images-mock">{props.albumId}</div>,
}));

function renderPage() {
  navigateMock.mockReset();
  resetMock.mockReset();
  return render(
    <MemoryRouter>
      <EditAlbum />
    </MemoryRouter>
  );
}

describe("EditAlbum", () => {
  test("ao montar busca album, faz reset e carrega options", async () => {
    const buscarAlbumPorId = vi.mocked(slice.buscarAlbumPorId);
    const listarArtistasOptions = vi.mocked(slice.listarArtistasOptions);

    listarArtistasOptions.mockResolvedValueOnce([{ id: 1, nome: "A" }] as any);
    buscarAlbumPorId.mockResolvedValueOnce({
      id: 10,
      titulo: "Original",
      dataLancamento: null,
      artistasIds: [1],
    } as any);

    renderPage();

    await waitFor(() => expect(listarArtistasOptions).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(buscarAlbumPorId).toHaveBeenCalledWith(10));

    await waitFor(() =>
      expect(resetMock).toHaveBeenCalledWith({
        id: 10,
        titulo: "Original",
        dataLancamento: null,
        artistasIds: [1],
      })
    );

    // AlbumImages renderiza
    expect(screen.getByTestId("album-images-mock")).toBeInTheDocument();
  });

  test("fluxo: clicar em Editar -> mostra ações -> salvar chama atualizar com trim e navega(-1)", async () => {
    const buscarAlbumPorId = vi.mocked(slice.buscarAlbumPorId);
    const atualizarAlbum = vi.mocked(slice.atualizarAlbum);
    const listarArtistasOptions = vi.mocked(slice.listarArtistasOptions);

    listarArtistasOptions.mockResolvedValueOnce([] as any);
    buscarAlbumPorId.mockResolvedValueOnce({
      id: 10,
      titulo: "Original",
      dataLancamento: null,
      artistasIds: [1],
    } as any);

    atualizarAlbum.mockResolvedValueOnce(undefined as any);

    renderPage();

    await waitFor(() => expect(buscarAlbumPorId).toHaveBeenCalledWith(10));

    expect(screen.queryByRole("button", { name: /salvar/i })).toBeNull();

   
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]);

    await waitFor(() => expect(screen.getByRole("button", { name: /salvar/i })).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() =>
      expect(atualizarAlbum).toHaveBeenCalledWith(10, {
        titulo: "Titulo Editado",
        dataLancamento: null,
        artistasIds: [1, 2],
      })
    );

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  test("se atualizar falhar, mostra erro e não navega", async () => {
    const buscarAlbumPorId = vi.mocked(slice.buscarAlbumPorId);
    const atualizarAlbum = vi.mocked(slice.atualizarAlbum);
    const listarArtistasOptions = vi.mocked(slice.listarArtistasOptions);

    listarArtistasOptions.mockResolvedValueOnce([] as any);
    buscarAlbumPorId.mockResolvedValueOnce({
      id: 10,
      titulo: "Original",
      dataLancamento: null,
      artistasIds: [1],
    } as any);

    atualizarAlbum.mockRejectedValueOnce(new Error("Erro ao atualizar álbum"));

    renderPage();

    await waitFor(() => expect(buscarAlbumPorId).toHaveBeenCalledWith(10));

    // entra em modo edit (mesma estratégia do botão)
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]);

    await waitFor(() => expect(screen.getByRole("button", { name: /salvar/i })).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(screen.getByText(/erro ao atualizar álbum/i)).toBeInTheDocument());
    expect(navigateMock).not.toHaveBeenCalledWith(-1);
  });

  test("se buscar falhar, mostra erro", async () => {
    const buscarAlbumPorId = vi.mocked(slice.buscarAlbumPorId);
    const listarArtistasOptions = vi.mocked(slice.listarArtistasOptions);

    listarArtistasOptions.mockResolvedValueOnce([] as any);
    buscarAlbumPorId.mockRejectedValueOnce(new Error("Falhou"));

    renderPage();

    await waitFor(() => expect(screen.getByText(/falhou/i)).toBeInTheDocument());
  });
});
