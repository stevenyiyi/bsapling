import React from "react";
import Modal from "./modal";
import MyCamsSelect from "./my_cams_select";
import ASSelect from "./as_select";
import MySchoolsSelect from "./my_schools_select";
import http from "../http_common";
import ASTooltip from "./as_tootip";
import { UserContext } from "../user_context";
import "./common.css";
import "./floating_label.css";
export default function UserRegister(props) {
  const { show, onClose, onChange } = props;
  const nowDate = new Date(Date.now() + 180 * 24 * 3600000).Format(
    "yyyy-MM-dd"
  );
  const [form, setForm] = React.useState({
    telphone: "",
    password: "88888888",
    name: "",
    role: "watcher",
    endts: nowDate,
    schoolid: ""
  });
  const [selectedCameras, setSelectedCameras] = React.useState([]);
  const [message, setMessage] = React.useState({ show: false, text: "" });
  const refCams = React.useRef();
  const userCtx = React.useContext(UserContext);
  const setField = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  React.useEffect(() => {});

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name || !form.telphone) {
      setMessage({ ...message, show: true, text: "请填写或选择正确的字段!" });
      return;
    }

    let fdata = new FormData();
    fdata.append("telphone", form.telphone);
    fdata.append("name", form.name);
    fdata.append("role", form.role);
    fdata.append("password", form.password);
    fdata.append("endts", form.endts);
    fdata.append("cameras", selectedCameras.join());

    let newUser = {
      username: form.telphone,
      nick_name: form.name,
      role: form.role,
      password: form.password,
      end_ts: form.endts,
      parent_id: userCtx.username,
      cameras: selectedCameras
    };

    if (form.role === "leader") {
      if (!form.schoolid) {
        setMessage({
          ...message,
          show: true,
          text: "角色为校领导时，必须选择学校!"
        });
        return;
      } else {
        newUser.schoolid = form.schoolid;
        fdata.append("schoolid", form.schoolid);
      }
    }
    http
      .post("/sapling/add_subuser", fdata)
      .then((response) => {
        if (response.data.result === 0) {
          setMessage({ ...message, show: true, text: "新增幼儿信息成功!" });
          onChange(newUser);
          setForm({ ...form, telphone: "", name: "" });
        } else {
          setMessage({
            ...message,
            show: true,
            text: `新增用户失败，错误代码：${response.data.result}`
          });
        }
      })
      .catch((e) =>
        setMessage({ ...message, show: true, text: e.toJSON().message })
      );
  };
  return (
    <Modal title="新用户注册" show={show} onClose={onClose}>
      <form className="formContainer" onSubmit={handleSubmit}>
        <div className="form__div">
          <input
            id="add-username-tel_edit_id"
            type="tel"
            className="form__input"
            value={form.telphone}
            required
            pattern="[1](([3][0-9])|([4][5-9])|([5][0-3,5-9])|([6][5,6])|([7][0-8])|([8][0-9])|([9][1,8,9]))[0-9]{8}"
            placeholder=" "
            onChange={(e) => setField("telphone", e.target.value)}
          />
          <label className="form__label" htmlFor="add-username-tel_edit_id">
            请输入手机号
          </label>
        </div>
        <div className="form__div">
          <input
            id="add-nickname_edit_id"
            type="text"
            className="form__input"
            value={form.name}
            required
            placeholder=" "
            onChange={(e) => setField("name", e.target.value)}
          />
          <label className="form__label" htmlFor="add-nickname_edit_id">
            请输入用户姓名
          </label>
        </div>
        <ASSelect
          title="选择用户角色"
          items={[
            { key: "leader", value: "校领导" },
            { key: "watcher", value: "观看用户" },
            { key: "guest", value: "贵宾用户" }
          ]}
          selectedKey="watcher"
          onChange={(val) => setField("role", val)}
        />
        <MyCamsSelect
          ref={refCams}
          selectedItems={selectedCameras}
          setSelectedItems={setSelectedCameras}
        />
        {form.role === "leader" && (
          <MySchoolsSelect
            value={form.schoolid}
            onSelectChange={(val) => setField("schoolid", val)}
          />
        )}
        <div className="form__div">
          <input
            id="add-password_edit_id"
            type="text"
            className="form__input"
            value={form.password}
            required
            placeholder=" "
            onChange={(e) => setField("password", e.target.value)}
          />
          <label className="form__label" htmlFor="add-password_edit_id">
            请输入用户口令
          </label>
        </div>
        <div className="form__div">
          <input
            id="add_user_endts"
            name="add_user_endts"
            type="date"
            className="form__input"
            value={form.endts}
            onChange={(e) => setField("endts", e.target.value)}
          />
          <label className="form__label" htmlFor="add_user_endts">
            帐户终止日期
          </label>
        </div>
        <button type="submit" className="tooltip">
          确定
          <ASTooltip
            delay={5000}
            show={message.show}
            onClose={() => {
              setMessage({ ...message, show: false });
            }}
          >
            {message.text}
          </ASTooltip>
        </button>
      </form>
    </Modal>
  );
}
