import React from "react";
import Modal from "./modal";
import MyCamsSelect from "./my_cams_select";
import http from "../http_common";
import ASTooltip from "./as_tootip";
import "./common.css";
import "./floating_label.css";

export default function AddClass(props) {
  const { schoolid, show, onClose, onChange } = props;
  const [name, setName] = React.useState("");
  const [selectedCameras, setSelectedCameras] = React.useState([]);
  const [message, setMessage] = React.useState({ show: false, text: "" });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!schoolid || !name || selectedCameras.length === 0) {
      setMessage({ ...message, show: true, text: "请填写或选择正确的信息！" });
      return;
    }

    /// 产生 classid
    /** devcice sequence number(10) */
    let sn = Math.floor(Math.random() * 10000000000).toString();
    sn = sn.padStart(10, "0");
    let classid = schoolid.substring(0, 10) + sn;

    http
      .post("/sapling/process_new_class", {
        name: name,
        schoolid: schoolid,
        classid: classid,
        cameras: selectedCameras
      })
      .then((response) => {
        if (response.data.result === 0) {
          setMessage({ ...message, show: true, text: "注册班级成功！" });
          onChange({
            classid: classid,
            name: name,
            cameras: selectedCameras
          });
          setName("");
        } else {
          setMessage({
            ...message,
            show: true,
            text: `注册班级失败，错误代码：${response.data.result}`
          });
        }
      })
      .catch((e) =>
        setMessage({ ...message, show: true, text: e.toJSON().message })
      );
  };
  return (
    <Modal title="新增班级" show={show} onClose={onClose}>
      <form className="formContainer" onSubmit={handleSubmit}>
        <div className="form__div">
          <input
            id="add-class_edit_id"
            type="text"
            className="form__input"
            value={name}
            required
            placeholder=" "
            onChange={(e) => setName(e.target.value)}
          />
          <label className="form__label" htmlFor="add-class_edit_id">
            请输入班级名称
          </label>
        </div>
        <MyCamsSelect
          selectedItems={selectedCameras}
          setSelectedItems={setSelectedCameras}
        />

        <button className="tooltip" type="submit">
          确 定
          <ASTooltip
            placement="top"
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
