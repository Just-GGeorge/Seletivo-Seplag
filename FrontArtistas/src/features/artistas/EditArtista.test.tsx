import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import EditArtista from "./EditArtista";
import * as slice from "./artistasSlice";

// 1) Mock do navigate + params
const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ id: "10" }),
  };
});

// 2) Mock do slice
vi.mock("./artistasSlice", async () => {
  const actual = await vi.importActual<any>("./artistasSlice");
  return {
    ...actual,
    buscarArtistaPorId: vi.fn(),
    atualizarArtista: vi.fn(),
  };
});

// 3) Mock do react-hook-form
const resetMock = vi.fn();
vi.mock("react-hook-form", () => ({
  useForm: () => ({
    control: {},
    reset: resetMock,
    handleSubmit: (fn: any) => () =>
      fn({
        nome: "  Novo Nome  ",
        genero: "  Rock  ",
      }),
  }),
}));

// 4) Mock do ArtistaForm
vi.mock("./components/ArtistaForm", () => ({
  ArtistaForm: (props: any) => (
    <div>
      <button onClick={props.onSubmit} disabled={props.isLoading}>
        Salvar
      </button>
      <button onClick={props.onGoBack}>Voltar</button>
    </div>
  ),
}));

function renderPage() {
  navigateMock.mockReset();
  resetMock.mockReset();
  return render(
    <MemoryRouter>
      <EditArtista />
    </MemoryRouter>
  );
}

describe("EditArtista", () => {
  test("ao montar, busca artista pelo id e faz reset; ao salvar, chama atualizar com trim e navega", async () => {
    const buscarArtistaPorId = vi.mocked(slice.buscarArtistaPorId);
    const atualizarArtista = vi.mocked(slice.atualizarArtista);

    buscarArtistaPorId.mockResolvedValueOnce({ id: 10, nome: "Antigo", genero: "MPB" } as any);
    atualizarArtista.mockResolvedValueOnce(undefined as any);

    renderPage();

    await waitFor(() => expect(buscarArtistaPorId).toHaveBeenCalledWith(10));
    await waitFor(() =>
      expect(resetMock).toHaveBeenCalledWith({ nome: "Antigo", genero: "MPB" })
    );

    await userEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() =>
      expect(atualizarArtista).toHaveBeenCalledWith(10, {
        nome: "Novo Nome",
        genero: "Rock",
      })
    );

    expect(navigateMock).toHaveBeenCalledWith("/artists", { replace: true });
  });

  test("se buscar falhar, mostra alerta de erro", async () => {
    const buscarArtistaPorId = vi.mocked(slice.buscarArtistaPorId);
    buscarArtistaPorId.mockRejectedValueOnce(new Error("Falhou"));

    renderPage();

    await waitFor(() => expect(screen.getByText(/falhou/i)).toBeInTheDocument());
  });

  test("se atualizar falhar, mostra alerta de erro e não navega", async () => {
    const buscarArtistaPorId = vi.mocked(slice.buscarArtistaPorId);
    const atualizarArtista = vi.mocked(slice.atualizarArtista);

    buscarArtistaPorId.mockResolvedValueOnce({ id: 10, nome: "Antigo", genero: "MPB" } as any);
    atualizarArtista.mockRejectedValueOnce(new Error("Erro ao atualizar"));

    renderPage();

    await waitFor(() => expect(buscarArtistaPorId).toHaveBeenCalledWith(10));

    await userEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() =>
      expect(screen.getByText(/erro ao atualizar/i)).toBeInTheDocument()
    );

    expect(navigateMock).not.toHaveBeenCalledWith("/artists", { replace: true });
  });
});
