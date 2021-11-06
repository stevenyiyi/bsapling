import React from "react";
import ReactDOM from "react-dom";
import Cookies from "js-cookie";
import "./index.css";
import App from "./App";
import { default as SnackbarProvider } from "./components/snackbar";

let user = {};
user.username = Cookies.get("username");
user.token = Cookies.get("token");
user.role = Cookies.get("role");
user.parent_id = Cookies.get("parent_id");

ReactDOM.render(
  <React.StrictMode>
    <SnackbarProvider>
      <App user={user} />
    </SnackbarProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
