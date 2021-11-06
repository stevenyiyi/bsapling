import React from "react";
import { useNavigate } from "react-router-dom";
import sha1 from "crypto-js/sha1";
import http from "../http_common";
import ASTooltip from "./as_tootip";
import Cookies from "js-cookie";
import "./login.css";
import "./common.css";
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
              parent_id: Cookies.get("parent_id")
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
          /// test
          userCtx.updateUser({
            username: state.username,
            token: qparams.token,
            role: "2",
            parent_id: "4352435243"
          });
          props.history.push("/my_schools");
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
    if (
      !state.username.match(
        /^[1](([3][0-9])|([4][5-9])|([5][0-3,5-9])|([6][5,6])|([7][0-8])|([8][0-9])|([9][1,8,9]))[0-9]{8}$/
      )
    ) {
      formIsValid = false;
      setMessage({
        ...message,
        show: true,
        text: "非法的用户名，请输入手机号！"
      });
      return formIsValid;
    } else {
      formIsValid = true;
    }

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
      <form className="formContainer">
        <input
          type="text"
          id="username"
          name="username"
          placeholder=" "
          onChange={handleChange}
        />
        <label className="label_floating" htmlFor="username">
          请输入用户名
        </label>
        <input
          type="password"
          name="password"
          id="password"
          placeholder=" "
          onChange={handleChange}
        />
        <label className="label_floating" htmlFor="password">
          请输入口令
        </label>
        <button
          type="submit"
          className="btn tooltip"
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
      </form>
      <div className="registerMessage">
        <span>没有注册帐户? </span>
        <span className="loginText" onClick={() => redirectToRegister()}>
          注册帐户
        </span>
      </div>
    </div>
  );
}
