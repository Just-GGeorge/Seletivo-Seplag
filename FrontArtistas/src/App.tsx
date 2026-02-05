import { ThemeProvider, CssBaseline } from "@mui/material";
import { AppRouter } from "./app/routes/AppRouter";
import { theme1 } from "./shared/theme/theme";

export default function App() {
  return (
    <ThemeProvider theme={theme1}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  );
}
