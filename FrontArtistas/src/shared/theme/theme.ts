import { createTheme } from "@mui/material/styles";

// export const theme1 = createTheme({
//   typography: {
//   },
// });






export const theme1 = createTheme({
  typography: {
    fontFamily: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"].join(","),
    h5: { fontWeight: 800, letterSpacing: -0.5 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 14 },
  palette: {
    mode: "dark",
    primary: { main: "#22c55e" },
    secondary: { main: "#a78bfa" },
    background: { default: "#0b0f19", paper: "#111827" },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiAppBar: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 14, paddingInline: 16, paddingBlock: 10 },
        contained: { boxShadow: "none" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 14 } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 800, color: "rgba(255,255,255,0.85)" },
        body: { color: "rgba(255,255,255,0.78)" },
      },
    },
    MuiDivider: { styleOverrides: { root: { borderColor: "rgba(255,255,255,0.08)" } } },
  },
});

