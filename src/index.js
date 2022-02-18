import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { default as SnackbarProvider } from "./components/snackbar";

(() => {
  console.log(process.env);
  ReactDOM.render(
    <React.StrictMode>
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </React.StrictMode>,
    document.getElementById("root")
  );
})();
