import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { ToastContainer } from "react-toastify";
import App from "./App";
import "./styles.scss";
import "react-toastify/dist/ReactToastify.css";

const theme = createTheme({
  palette: {
    background: { default: "#f4f6f8" },
    primary: { main: "#3957d7" },
  },
  shape: { borderRadius: 10 },
  typography: { fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer position="bottom-right" />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
