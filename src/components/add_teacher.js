import React from "react";
import Modal from "./modal";
import ASTooltip from "./as_tootip";
import http from "../http_common";
import config from "../config";
import CheckboxMultiSelect from "./multi_select";
import "./common.css";
import "./floating_label.css";
export default function AddTeacher(props) {
  const { classes, show, onClose, onChange } = props;
  const [form, setForm] = React.useState({
    name: "",
    telphone: "",
    introduce: "",
    photo: undefined
  });
  const [classids, setClassids] = React.useState([]);
  const [message, setMessage] = React.useState({ show: false, text: "" });
  const setField = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const refAvatar = React.useRef();
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
    if (!form.name || !form.telphone || classids.length === 0) {
      setMessage({
        ...message,
        show: true,
        text: "请检查输入或选择必须的选项!"
      });
      return;
    }
    let formData = new FormData();
    formData.append("classid", classids.join());
    formData.append("name", form.name);
    formData.append("role", "teacher");
    formData.append("telphone", form.telphone);
    formData.append("introduce", form.introduce);
    if (form.photo) {
      let ext = form.photo.name.split(".").pop();
      let upload_file = `${form.telphone}.${ext}`;
      formData.append("photo", form.photo, upload_file);
    }
    http
      .post("/sapling/add_subuser", formData)
      .then((response) => {
        if (response.data.result === 0) {
          onChange({
            username: form.telphone,
            nick_name: form.name,
            photo: form.photo,
            note: form.introduce,
            classes: classids
          });
          /// Clear fields
          setClassids([]);
          setForm({ ...form, name: "", telphone: "", introduce: "" });
          setMessage({ ...message, show: true, text: "新增教师信息成功!" });
        } else {
          setMessage({
            ...message,
            show: true,
            text: `新增教师失败，错误代码：${response.data.result}`
          });
        }
      })
      .catch((e) =>
        setMessage({
          ...message,
          show: true,
          text: e.toJSON().message
        })
      );
  };
  return (
    <Modal title="新增教师" show={show} onClose={onClose}>
      <form className="formContainer" onSubmit={handleSubmit}>
        <div className="form__div">
          <input
            id="add-teacher-name"
            type="text"
            className="form__input"
            value={form.name}
            required
            placeholder=" "
            onChange={(e) => setField("name", e.target.value)}
          />
          <label className="form__label" htmlFor="add-teacher-name">
            请输入教师姓名
          </label>
        </div>
        <div className="form__div">
          <input
            id="add-teacher-tel"
            type="tel"
            className="form__input"
            value={form.telphone}
            pattern="[1](([3][0-9])|([4][5-9])|([5][0-3,5-9])|([6][5,6])|([7][0-8])|([8][0-9])|([9][1,8,9]))[0-9]{8}"
            required
            placeholder=" "
            onChange={(e) => setField("telphone", e.target.value)}
          />
          <label className="form__label" htmlFor="add-teacher-tel">
            请输入手机号
          </label>
        </div>
        <CheckboxMultiSelect
          title="选择班级"
          items={classes}
          selectedItems={classids}
          setSelectedItems={setClassids}
          kvmap={{ key: "classid", value: "name" }}
        />
        <div className="personal-image">
          <label>
            <input
              type="file"
              id="teacher-photo-file-upload"
              accept="image/png, image/jpeg"
              onChange={handleFileUpload}
            />
            <figure className="personal-figure">
              <img
                ref={refAvatar}
                src={`${config.resBaseUrl}/imgs/img_avatar_unknow.png`}
                className="personal-avatar"
                alt="avatar"
              />
              <figcaption className="personal-figcaption">
                <img
                  src={`${config.resBaseUrl}/imgs/img_camera_white.png`}
                  alt="avatar-camera"
                />
              </figcaption>
            </figure>
          </label>
        </div>

        <textarea
          as="textarea"
          value={form.introduce}
          placeholder="请输入教师介绍说明"
          onChange={(e) => setField("introduce", e.target.value)}
        />

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
