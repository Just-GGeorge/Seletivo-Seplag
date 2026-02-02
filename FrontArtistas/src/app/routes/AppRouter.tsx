import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../layout/ProtectedRoute";
import { AppShell } from "../layout/AppShell";
import LoginPage from "../../features/Login/LoginPage";
import ListArtistas from "../../features/artistas/ListArtistas";
import CreateArtista from "../../features/artistas/CreateArtista";
import ViewArtista from "../../features/artistas/ViewArtista";
import EditArtista from "../../features/artistas/EditArtista";
import CreateAlbum from "../../features/albums/CreateAlbum";
import EditAlbum from "../../features/albums/EditAlbum.tsx";
import ViewAlbum from "../../features/albums/ViewAlbum";

function Home() {
  return <div>Bem-vindo! Selecione “Artistas” no menu.</div>;
}


export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="artists" element={<ListArtistas />} />
          <Route path="artists/new" element={<CreateArtista />} />
          <Route path="artists/view/:id" element={<ViewArtista />} />
          <Route path="artists/edit/:id" element={<EditArtista />} />

          <Route path="albums/new" element={<CreateAlbum />} />
          <Route path="albums/edit/:id" element={<EditAlbum />} />
          <Route path="albums/view/:id" element={<ViewAlbum />} />

        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
