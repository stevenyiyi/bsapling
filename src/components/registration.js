import React from "react";
import http from "../http_common";
import ASTooltip from "./as_tootip";
import "./common.css";
import "./registration.css";
import { useNavigate } from "react-router-dom";

export default function Registration(props) {
  const navigate = useNavigate();
  const [state, setState] = React.useState({
    username: "",
    password: "",
    confirmPassword: ""
  });

  const [message, setMessage] = React.useState({ show: false, text: "" });
  const handleChange = (e) => {
    const { id, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      [id]: value
    }));
  };

  const handleValidation = (event) => {
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

    if (state.password === state.confirmPassword) {
      formIsValid = true;
    } else {
      setMessage({ ...message, show: true, text: "前后输入的口令不匹配！" });
    }
    return formIsValid;
  };

  const redirectToLogin = () => {
    navigate("/login");
  };

  const sendDetailsToServer = () => {
    http
      .post("/sapling/user_register", {
        username: state.username,
        password: state.password
      })
      .then((response) => {
        if (response.data.result === 0) {
          ///注册成功
          setMessage({
            ...message,
            show: true,
            text: "注册成功，将重定向登录！"
          });
          redirectToLogin();
        }
      })
      .catch((e) => {
        setMessage({ ...message, show: true, text: e.toJSON().message });
      });
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    if (handleValidation()) {
      sendDetailsToServer();
    }
  };
  return (
    <div className="registerOuterContainer">
      <form className="formContainer">
        <input
          type="text"
          name="username"
          id="username"
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
          输入口令
        </label>

        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          placeholder=" "
          onChange={handleChange}
        />
        <label className="label_floating" htmlFor="confirmPassword">
          再输入一次口令
        </label>
        <button
          type="submit"
          className="tooltip btn"
          onClick={handleSubmitClick}
        >
          注 册
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
      <div className="mt-2">
        <span>已经有帐号? </span>
        <span className="loginText" onClick={() => redirectToLogin()}>
          登录
        </span>
      </div>
    </div>
  );
}
