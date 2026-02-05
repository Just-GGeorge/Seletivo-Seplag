import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import CreateArtista from "./CreateArtista";
import * as slice from "./artistasSlice";

// 1) Mock do navigate
const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

// 2) Mock do slice
vi.mock("./artistasSlice", async () => {
  const actual = await vi.importActual<any>("./artistasSlice");
  return { ...actual, criarArtista: vi.fn() };
});

vi.mock("react-hook-form", () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: any) => () =>
      fn({
        nome: "  Djavan  ",
        genero: "  MPB  ",
      }),
  }),
}));

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
  return render(
    <MemoryRouter>
      <CreateArtista />
    </MemoryRouter>
  );
}

describe("CreateArtista", () => {
  test("ao salvar chama criarArtista com trim e navega para /artists", async () => {
    const criarArtista = vi.mocked(slice.criarArtista);
    criarArtista.mockResolvedValueOnce(undefined as any);

    renderPage();

    await userEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() =>
      expect(criarArtista).toHaveBeenCalledWith({
        nome: "Djavan",
        genero: "MPB",
      })
    );

    expect(navigateMock).toHaveBeenCalledWith("/artists", { replace: true });
  });

  test("voltar navega para /artists", async () => {
    renderPage();

    await userEvent.click(screen.getByRole("button", { name: /voltar/i }));

    expect(navigateMock).toHaveBeenCalledWith("/artists");
  });
});
