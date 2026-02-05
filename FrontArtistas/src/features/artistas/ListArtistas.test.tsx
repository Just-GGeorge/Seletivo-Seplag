import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import ListArtistas from "./ListArtistas";
import * as slice from "./artistasSlice";

vi.mock("./artistasSlice", async () => {
  const actual = await vi.importActual<any>("./artistasSlice");
  return {
    ...actual,
    listarArtistas: vi.fn(),
    deletarArtista: vi.fn(),
  };
});

vi.mock("./components/ArtistasTable", () => ({
  ArtistasTable: (props: any) => {
    const first = props.rows?.[0];
    return (
      <div>
        <div data-testid="table-mock" />
        {first ? (
          <button onClick={() => props.onDelete(first)}>Deletar</button>
        ) : null}
      </div>
    );
  },
}));

vi.mock("./components/ArtistasFilter", () => ({
  ArtistasFilter: (_props: any) => <div data-testid="filter-mock" />,
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <ListArtistas />
    </MemoryRouter>
  );
}

describe("ListArtistas", () => {
  test("confirmação de delete chama deletarArtista e refaz fetch", async () => {
    const listarArtistas = vi.mocked(slice.listarArtistas);
    const deletarArtista = vi.mocked(slice.deletarArtista);

    listarArtistas.mockResolvedValueOnce({
      content: [{ id: 1, nome: "Djavan", genero: "MPB", qtdAlbuns: 2 }],
      totalElements: 1,
    } as any);

    renderPage();

    await waitFor(() => expect(listarArtistas).toHaveBeenCalled());

    const callsBefore = listarArtistas.mock.calls.length;

    await userEvent.click(screen.getByRole("button", { name: /deletar/i }));

    expect(screen.getByText(/deseja realmente remover o artista/i)).toBeInTheDocument();

    deletarArtista.mockResolvedValueOnce(undefined as any);

    listarArtistas.mockResolvedValueOnce({ content: [], totalElements: 0 } as any);

    await userEvent.click(screen.getByRole("button", { name: /^sim$/i }));

    await waitFor(() => expect(deletarArtista).toHaveBeenCalledWith(1));

    await waitFor(() => expect(listarArtistas.mock.calls.length).toBeGreaterThan(callsBefore));
  });
});
