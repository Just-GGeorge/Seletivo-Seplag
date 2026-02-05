import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import CreateAlbum from "./CreateAlbum";
import * as slice from "./albumsSlice";

// ---- mock navigate + search params
const navigateMock = vi.fn();

// vamos controlar artistaId via querystring
let search = "?artistaId=1";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useSearchParams: () => [new URLSearchParams(search), vi.fn()],
  };
});

// ---- mock do slice
vi.mock("./albumsSlice", async () => {
  const actual = await vi.importActual<any>("./albumsSlice");
  return {
    ...actual,
    criarAlbumComUpload: vi.fn(),
    listarArtistasOptions: vi.fn(),
  };
});

// ---- mock do react-hook-form
// handleSubmit chama onSubmit com values "sujos" (pra testar trim)
vi.mock("react-hook-form", () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: any) => () =>
      fn({
        titulo: "  Meu Album  ",
        dataLancamento: null,
        artistasIds: [1],
      }),
  }),
}));

// ---- mock do AlbumForm: só renderiza botões e chama props.onSubmit / onCancel
vi.mock("./components/AlbumForm", () => ({
  AlbumForm: (props: any) => (
    <div>
      <div data-testid="album-form-mock" />
      <button onClick={props.onSubmit} disabled={props.isLoading}>
        Salvar
      </button>
      <button onClick={props.onCancel}>Cancelar</button>
    </div>
  ),
}));

// ---- mock do AlbumImagesPicker
vi.mock("./components/AlbumImagesPicker", () => ({
  AlbumImagesPicker: (props: any) => {
    if (props.files?.length === 0) {
      const f1 = new File(["x"], "a.png", { type: "image/png" });
      const f2 = new File(["y"], "b.png", { type: "image/png" });
      props.onFilesChange([f1, f2]);
      props.onIndiceCapaChange(1);
    }

    return <div data-testid="images-picker-mock" />;
  },
}));

function renderPage() {
  navigateMock.mockReset();
  return render(
    <MemoryRouter>
      <CreateAlbum />
    </MemoryRouter>
  );
}

describe("CreateAlbum", () => {
  test("carrega opções de artistas no mount", async () => {
    const listarArtistasOptions = vi.mocked(slice.listarArtistasOptions);
    listarArtistasOptions.mockResolvedValueOnce([{ id: 1, nome: "Djavan" }] as any);

    renderPage();

    await waitFor(() => expect(listarArtistasOptions).toHaveBeenCalledTimes(1));
  });

  test("ao salvar chama criarAlbumComUpload com trim + files + indiceCapa e navega para view do artista quando artistaId existe", async () => {
    search = "?artistaId=1";
    const listarArtistasOptions = vi.mocked(slice.listarArtistasOptions);
    const criarAlbumComUpload = vi.mocked(slice.criarAlbumComUpload);

    listarArtistasOptions.mockResolvedValueOnce([{ id: 1, nome: "Djavan" }] as any);

    criarAlbumComUpload.mockResolvedValueOnce({
      album: { id: 999 },
      imagens: [],
      uploadOk: true,
      uploadErro: null,
    } as any);

    renderPage();

    await userEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(criarAlbumComUpload).toHaveBeenCalled());

    const [dto, files, indiceCapa] = criarAlbumComUpload.mock.calls[0];

    expect(dto).toEqual({
      titulo: "Meu Album",
      dataLancamento: null,
      artistasIds: [1],
    });

    expect(Array.isArray(files)).toBe(true);
    expect(files as File[]).toHaveLength(2);
    expect((files as File[])[0]).toBeInstanceOf(File);
    expect(indiceCapa).toBe(1);

    expect(navigateMock).toHaveBeenCalledWith("/artists/view/1", { replace: true });
  });

  test("quando não tem artistaId na url, navega para /artists após criar", async () => {
    search = ""; // sem querystring
    const listarArtistasOptions = vi.mocked(slice.listarArtistasOptions);
    const criarAlbumComUpload = vi.mocked(slice.criarAlbumComUpload);

    listarArtistasOptions.mockResolvedValueOnce([] as any);

    criarAlbumComUpload.mockResolvedValueOnce({
      album: { id: 123 },
      imagens: [],
      uploadOk: true,
      uploadErro: null,
    } as any);

    renderPage();

    await userEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(criarAlbumComUpload).toHaveBeenCalled());
    expect(navigateMock).toHaveBeenCalledWith("/artists", { replace: true });
  });

  test("se criar falhar, mostra erro", async () => {
    search = "?artistaId=1";
    const listarArtistasOptions = vi.mocked(slice.listarArtistasOptions);
    const criarAlbumComUpload = vi.mocked(slice.criarAlbumComUpload);

    listarArtistasOptions.mockResolvedValueOnce([] as any);
    criarAlbumComUpload.mockRejectedValueOnce(new Error("Falhou"));

    renderPage();

    await userEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(screen.getByText(/falhou/i)).toBeInTheDocument());
  });
});
