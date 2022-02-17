import React from "react";
import { usePrevious } from "../utils/utils";
import http from "../http_common";
import Modal from "./modal";
import MyCamsSelect from "./my_cams_select";
import "./common.css";
import "./floating_label.css";

export default function ModifySubuser(props) {
  const { show, user, onClose, onChange } = props;
  const [name, setName] = React.useState("");
  const [endts, setEndts] = React.useState("1970-01-01");
  const [selectedCameras, setSelectedCameras] = React.useState([]);

  const prevCams = usePrevious(selectedCameras);
  const refCams = React.useRef();
  React.useEffect(() => {
    if (user) {
      setName(user.nick_name);
      setEndts(user.end_ts);
      setSelectedCameras(user.cameras.map((cam) => cam.deviceid));
    }
  }, [user]);

  const handleSubmit = (event) => {
    event.preventDefault();
    let uuser = { ...user };
    let mfields = new FormData();
    mfields.append("username", user.username);
    if (user.nick_name !== name) {
      mfields.append("nick_name", name);
      uuser.nick_name = name;
    }

    if (user.end_ts !== endts) {
      mfields.append("end_ts", endts);
      uuser.end_ts = endts;
    }

    if (prevCams !== selectedCameras) {
      mfields.append("cameras", selectedCameras.join());
      let cams = [];
      for (const deviceid of selectedCameras) {
        let cam = { deviceid: deviceid, name: "" };
        cam.name = refCams.current.getDeviceName(deviceid);
        cams.push(cam);
      }
      uuser.cameras = cams;
    }

    if (!mfields) return;

    http
      .post("/sapling/modify_subuser", mfields)
      .then((response) => {
        if (response.data.result === 0) {
          /// Modify successed!
          onChange(uuser);
          onClose();
        }
      })
      .catch((e) => console.error("Error:", e));
  };
  return (
    <Modal title="修改用户信息" show={show} onClose={onClose}>
      <div className="formContainer">
        <div className="form__div">
          <input
            id="edit_user_name"
            name="edit_uaer_name"
            type="text"
            className="form__input"
            value={name}
            placeholder=" "
            onChange={(e) => setName(e.target.value)}
          />
          <label className="form__label" htmlFor="edit_user_name">
            用户姓名
          </label>
        </div>
        <div className="form__div">
          <input
            id="edit_user_endts"
            name="edit_user_endts"
            type="date"
            className="form__input"
            value={endts}
            onChange={(e) => setEndts(e.target.value)}
          />
          <label className="form__label" htmlFor="edit_user_endts">
            帐户终止日期
          </label>
        </div>
        <MyCamsSelect
          ref={refCams}
          selectedItems={selectedCameras}
          setSelectedItems={setSelectedCameras}
        />
        <button type="submit" onClick={handleSubmit}>
          修 改
        </button>
      </div>
    </Modal>
  );
}
