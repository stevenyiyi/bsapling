import React from "react";
import { PropTypes } from "prop-types";

import Modal from "./modal";
import http from "../http_common";
import MyCamsSelect from "./my_cams_select";
import "./common.css";
import "./floating_label.css";
export default function ModifyClass(props) {
  const { schoolid, show, classinfo, onClose, onChange } = props;
  const [name, setName] = React.useState("");
  const [selectedCameras, setSelectedCameras] = React.useState([]);
  const refCams = React.useRef();
  console.log("modify class render!");
  const prevCameras = React.useMemo(
    () => classinfo.cameras.map((cam) => cam.deviceid),
    [classinfo]
  );

  React.useEffect(() => {
    if (classinfo) {
      setName(classinfo.name);
      setSelectedCameras(prevCameras);
    }
  }, [classinfo, prevCameras]);

  const handleSubmit = (event) => {
    event.preventDefault();
    let uclass = { ...classinfo };
    let mfields = {};
    mfields.schoolid = schoolid;
    mfields.classid = classinfo.classid;
    mfields.changes = [];

    if (classinfo.name !== name) {
      mfields.changes.push({ name: "name", value: name });
      uclass.name = name;
    }
    if (prevCameras !== selectedCameras) {
      mfields.changes.push({ name: "cameras", value: selectedCameras });
      /// 修改cameras
      let cams = [];
      for (const deviceid of selectedCameras) {
        let cam = { deviceid: deviceid, name: "" };
        cam.name = refCams.getDeviceName(deviceid);
        cams.push(cam);
      }
      uclass.cameras = cams;
    }
    if (!mfields) return;

    http
      .post("/sapling/modify_class", mfields)
      .then((response) => {
        if (response.data.result === 0) {
          onChange(uclass);
          /// Modify successed!
          onClose();
        }
      })
      .catch((e) => {
        console.error("Error:", e);
        onChange(uclass);
        onClose();
      });
  };
  return (
    <Modal title="修改班级信息" show={show} onClose={onClose}>
      <div className="formContainer">
        <MyCamsSelect
          ref={refCams}
          selectedItems={selectedCameras}
          setSelectedItems={setSelectedCameras}
        />
        <div className="form__div">
          <input
            type="text"
            id="edit_classname"
            name="edit_classname"
            className="form__input"
            value={name}
            placeholder=" "
            onChange={(e) => setName(e.target.value.trim())}
          />
          <label className="form__label" htmlFor="edit_classname">
            班级名称
          </label>
        </div>
        <button type="submit" onClick={handleSubmit}>
          修 改
        </button>
      </div>
    </Modal>
  );
}

ModifyClass.propTypes = {
  schoolid: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  cameras: PropTypes.array.isRequired,
  classinfo: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired
};

ModifyClass.defaultProps = {
  schoolid: "",
  show: true,
  cameras: [],
  classinfo: { name: "", cameras: [] },
  onClose: () => {},
  onChange: () => {}
};
