import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ProtectedRoute } from "../layout/ProtectedRoute";
import { AppShell } from "../layout/AppShell";
import { Box, CircularProgress } from "@mui/material";
import { NotificationsHost } from "../../core/notifications/NotificationsHost.tsx";

function RouteLoader() {
  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: "40vh" }}>
      <CircularProgress />
    </Box>
  );
}

const LoginPage = lazy(() => import("../../features/Login/LoginPage.tsx"));
const RegisterPage = lazy(() => import("../../features/register/RegisterPage"));

const ListArtistas = lazy(() => import("../../features/artistas/ListArtistas"));
const CreateArtista = lazy(() => import("../../features/artistas/CreateArtista"));
const EditArtista = lazy(() => import("../../features/artistas/EditArtista"));
const ViewArtista = lazy(() => import("../../features/artistas/ViewArtista"));

const ListAlbums = lazy(() => import("../../features/albums/ListAlbums"));
const CreateAlbum = lazy(() => import("../../features/albums/CreateAlbum"));
const EditAlbum = lazy(() => import("../../features/albums/EditAlbum.tsx"));

export function AppRouter() {
  return (
    <BrowserRouter>
      <NotificationsHost />

      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registrar" element={<RegisterPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<ListArtistas />} />

            <Route path="artists" element={<ListArtistas />} />
            <Route path="artists/new" element={<CreateArtista />} />
            <Route path="artists/edit/:id" element={<EditArtista />} />
            <Route path="artists/view/:id" element={<ViewArtista />} />

            <Route path="albums" element={<ListAlbums />} />
            <Route path="albums/new" element={<CreateAlbum />} />
            <Route path="albums/edit/:id" element={<EditAlbum />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
