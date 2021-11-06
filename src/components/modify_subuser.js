import React from "react";
import { usePrevious } from "../utils/utils";
import http from "../http_common";
import Modal from "./modal";
import CheckboxMultiSelect from "./multi_select";
import "./common.css";
import "./floating_label.css";

export default function ModifySubuser(props) {
  const { show, cameras, user, onClose, onChange } = props;
  const [name, setName] = React.useState("");
  const [endts, setEndts] = React.useState("1970-01-01");
  const [selectedCameras, setSelectedCameras] = React.useState([]);

  const prevCams = usePrevious(selectedCameras);
  React.useEffect(() => {
    if (user) {
      setName(user.nick_name);
      setEndts(user.end_ts);
      setSelectedCameras(user.cameras.map((cam) => cam.deviceid));
    }
  }, [user]);

  const getDeviceName = (deviceid) => {
    for (const cam of cameras) {
      if (cam.deviceid === deviceid) {
        return cam.name;
      }
      if (cam.cameras) {
        for (const ccam of cam.cameras) {
          if (ccam.deviceid === deviceid) {
            return ccam.name;
          }
        }
      }
    }
    return "";
  };

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
        cam.name = getDeviceName(deviceid);
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
        <input
          id="edit_user_name"
          name="edit_uaer_name"
          type="text"
          value={name}
          placeholder=" "
          onChange={(e) => setName(e.target.value)}
        />
        <label className="label_floating" htmlFor="edit_user_name">
          用户姓名
        </label>
        <input
          id="edit_user_endts"
          name="edit_user_endts"
          type="date"
          value={endts}
          onChange={(e) => setEndts(e.target.value)}
        />
        <label className="label_floating" htmlFor="edit_user_endts">
          帐户终止日期
        </label>
        <CheckboxMultiSelect
          title="选择摄像头"
          items={cameras}
          selectedItems={selectedCameras}
          setSelectedItems={setSelectedCameras}
          kvmap={{ key: "deviceid", value: "name" }}
        />
        <button type="submit" onClick={handleSubmit}>
          修 改
        </button>
      </div>
    </Modal>
  );
}
