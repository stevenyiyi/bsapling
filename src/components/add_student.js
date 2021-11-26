import React from "react";
import Modal from "./modal";
import ASSelect from "./as_select";
import ASTooltip from "./as_tootip";
import http from "../http_common";
import "../utils/utils.js";
import "./common.css";
import "./floating_label.css";
export default function AddStudentInfo(props) {
  const { classid, show, onClose, onChange } = props;
  const [form, setForm] = React.useState({
    name: "",
    telphone: "",
    parent: "mother",
    photo: undefined
  });
  const [message, setMessage] = React.useState({ show: false, text: "" });
  const nowDate = new Date(Date.now() + 180 * 24 * 3600000).Format(
    "yyyy-MM-dd"
  );
  const [endts, setEndts] = React.useState(nowDate);
  const refAvatar = React.useRef();
  const setField = (field, value) => {
    setForm({ ...form, [field]: value });
  };
  const fixName = (parent) => {
    let name = form.name;
    switch (parent) {
      case "mother":
        name += "妈妈";
        break;
      case "father":
        name += "爸爸";
        break;
      case "grandfather":
        name += "爷爷";
        break;
      case "grandmother":
        name += "奶奶";
        break;
      default:
        break;
    }
    return name;
  };

  /// 处理文件上传
  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile.size > 400 * 1024) {
      alert("选择的头像文件不能超过400KB！");
      return;
    }
    refAvatar.current.src = URL.createObjectURL(selectedFile);
    setField("photo", selectedFile);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name || !form.telphone) {
      setMessage({ ...message, show: true, text: "请填写或选择正确的字段!" });
      return;
    }

    let photoname = "";
    let formData = new FormData();
    formData.append("classid", classid);
    formData.append("role", "student");
    formData.append("name", form.name);
    formData.append("telphone", form.telphone);
    formData.append("parent", form.parent);
    if (form.photo) {
      let ext = form.photo.name.split(".").pop();
      photoname = `${form.telphone}.${ext}`;
      formData.append("photo", form.photo, photoname);
    }
    formData.append("endts", endts);
    http
      .post("/sapling/add_subuser", formData)
      .then((response) => {
        if (response.data.result === 0) {
          onChange({
            nick_name: fixName(form.parent),
            username: form.telphone,
            photo: photoname,
            end_ts: endts
          });
          setField("name", "");
          setField("telphone", "");
          setMessage({ ...message, show: true, text: "新增幼儿信息成功!" });
        } else {
          setMessage({
            ...message,
            show: true,
            text: `新增幼儿失败，错误代码：${response.data.result}`
          });
        }
      })
      .catch((e) =>
        setMessage({ ...message, show: true, text: e.toJSON().message })
      );
  };
  return (
    <Modal title="新增幼儿" show={show} onClose={onClose}>
      <form className="formContainer" onSubmit={handleSubmit}>
        <div className="form__div">
          <input
            id="add-student_edit_id"
            type="text"
            className="form__input"
            value={form.name}
            required
            placeholder=" "
            onChange={(e) => setField("name", e.target.value)}
          />
          <label className="form__label" htmlFor="add-student_edit_id">
            请输入幼儿姓名
          </label>
        </div>
        <div className="form__div">
          <input
            id="add-student-tel_edit_id"
            type="tel"
            className="form__input"
            value={form.telphone}
            required
            pattern="[1](([3][0-9])|([4][5-9])|([5][0-3,5-9])|([6][5,6])|([7][0-8])|([8][0-9])|([9][1,8,9]))[0-9]{8}"
            placeholder=" "
            onChange={(e) => setField("telphone", e.target.value)}
          />
          <label className="form__label" htmlFor="add-student-tel_edit_id">
            请输入监护人手机号
          </label>
        </div>
        <div className="personal-image">
          <label>
            <input
              id="add-student-file-upload"
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleFileUpload}
            />
            <figure className="personal-figure">
              <img
                ref={refAvatar}
                src="http://localhost/imgs/img_avatar_unknow.png"
                className="personal-avatar"
                alt="avatar"
              />
              <figcaption className="personal-figcaption">
                <img
                  src="http://localhost/imgs/img_camera_white.png"
                  alt="avatar-camera"
                />
              </figcaption>
            </figure>
          </label>
        </div>
        <ASSelect
          title="选择监护人"
          items={[
            { key: "mother", value: "妈妈" },
            { key: "father", value: "爸爸" },
            { key: "grandmother", value: "奶奶" },
            { key: "grandfather", value: "爷爷" },
            { key: "other", value: "其它" }
          ]}
          selectedKey="mother"
          onChange={(val) => setField("parent", val)}
        />
        <div className="form__div">
          <input
            type="date"
            id="student-end-ts"
            name="student-end-ts"
            className="form__input"
            value={endts}
            onChange={(e) => setEndts(e.target.value)}
          />
          <label className="form__label" htmlFor="student-end-ts">
            帐户终止日期
          </label>
        </div>
        <button className="tooltip" type="submit">
          确 认
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
