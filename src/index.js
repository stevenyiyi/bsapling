import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { default as SnackbarProvider } from "./components/snackbar";

(() => {
  console.log(process);
  console.log(process.env.npm_package_config_publish);
  ReactDOM.render(
    <React.StrictMode>
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </React.StrictMode>,
    document.getElementById("root")
  );
})();
