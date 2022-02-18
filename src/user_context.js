import React from "react";
import Cookies from "js-cookie";
import http from "./http_common";
const path = "/sapling/login";
export const userCookies = {
  username: Cookies.get("username"),
  token: Cookies.get("token"),
  role: Cookies.get("role"),
  is_login: (async () => {
    if (!Cookies.get("username")) {
      return false;
    }
    let qparams = { ts: Date.now() };
    qparams.username = Cookies.get("username");
    qparams.token = Cookies.get("token");
    let is_login = false;
    await http
      .get(path, { params: qparams })
      .then((response) => {
        let result = response.data.result;
        if (result === 0) {
          is_login = true;
        } else {
          is_login = false;
        }
      })
      .then((result) => result)
      .catch((e) => {
        console.log("Error:", e);
        is_login = false;
      });
    return is_login;
  })()
};
export const UserContext = React.createContext({
  user: userCookies,
  update_user: (user) => {}
});
