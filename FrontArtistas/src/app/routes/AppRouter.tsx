import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../../features/auth/pages/LoginPage";
import { ProtectedRoute } from "../layout/ProtectedRoute";
import { AppShell } from "../layout/AppShell";

function Home() {
  return <div>Bem-vindo! Selecione “Artistas” no menu.</div>;
}

function ArtistsPlaceholder() {
  return <div>Em seguida: tela de Artistas (tabela + busca + sort + paginação).</div>;
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
          <Route path="artists" element={<ArtistsPlaceholder />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
