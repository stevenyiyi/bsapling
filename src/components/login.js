import React from "react";
import { useNavigate } from "react-router-dom";
import sha1 from "crypto-js/sha1";
import http from "../http_common";
import ASTooltip from "./as_tootip";
import Cookies from "js-cookie";
import "./login.css";
import { UserContext } from "../user_context";
export default function Login(props) {
  const ERR_NO_ACCOUNT = 0x800000f;
  const ERR_INVALID_PWD = ERR_NO_ACCOUNT + 1;
  const ERR_OVERDUE = ERR_INVALID_PWD + 1;
  const navigate = useNavigate();
  const [state, setState] = React.useState({
    username: "",
    password: ""
  });
  const [message, setMessage] = React.useState({ show: false, text: "" });
  const userCtx = React.useContext(UserContext);
  const handleChange = (e) => {
    const { id, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      [id]: value
    }));
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    if (handleFormInvalid()) {
      let path = "/sapling/login";
      let h1 = sha1(state.username + ":" + state.password).toString();
      let h2 = sha1(state.password + ":" + path).toString();
      let h3 = sha1(
        state.username + ":" + state.password + ":" + path
      ).toString();
      let qparams = { ts: Date.now() };
      qparams.username = state.username;
      qparams.token = sha1(h1 + ":" + h2 + ":" + h3).toString();
      http
        .get(path, { params: qparams })
        .then((response) => {
          let result = response.data.result;
          if (result === 0) {
            userCtx.updateUser({
              username: state.username,
              token: qparams.token,
              role: Cookies.get("role"),
              is_login: true
            });
            redirectToHome();
          } else if (result === ERR_NO_ACCOUNT) {
            /// 帐户不存在
            setMessage({
              ...message,
              show: true,
              text: "帐户不存在，请先注册后再登录！"
            });
          } else if (result === ERR_OVERDUE) {
            /// 帐户过期
            setMessage({ ...message, show: true, text: "帐户已过期！" });
          } else if (result === ERR_INVALID_PWD) {
            /// 口令错误
            setMessage({ ...message, show: true, text: "口令错误！" });
          }
        })
        .catch((e) => {
          /// 错误
          setMessage({ ...message, show: true, text: e.toJSON().message });
        });
    }
  };

  const redirectToRegister = () => {
    navigate("/registration");
  };

  const redirectToHome = () => {
    navigate("/my_schools");
  };
  const handleFormInvalid = () => {
    let formIsValid = true;
    if (!state.password.match(/^[0-9a-zA-Z]{6,22}$/)) {
      formIsValid = false;
      setMessage({
        ...message,
        show: true,
        text: "口令限制仅英文字母或数字组成，长度范围(6-22)个字符"
      });
      return formIsValid;
    } else {
      formIsValid = true;
    }
    return formIsValid;
  };

  return (
    <div className="loginOuterContainer">
      <div className="loginInnerContainer">
        <h1 className="heading">用户登录</h1>
        <input
          type="text"
          id="username"
          name="username"
          required
          className="loginInput"
          placeholder="请输入用户名"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          id="password"
          required
          className="loginInput mt-20"
          placeholder="请输入口令"
          onChange={handleChange}
        />
        <button
          type="submit"
          className="button mt-20 tooltip"
          onClick={handleSubmitClick}
        >
          登 录
          <ASTooltip
            placement="top"
            delay={5000}
            show={message.show}
            onClose={() => setMessage({ ...message, show: false })}
          >
            {message.text}
          </ASTooltip>
        </button>
        <div className="registerMessage">
          <span>没有注册帐户? </span>
          <span className="loginText" onClick={() => redirectToRegister()}>
            注册帐户
          </span>
        </div>
      </div>
    </div>
  );
}
