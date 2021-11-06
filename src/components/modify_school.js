import React from "react";
import http from "../http_common";
import Modal from "./modal";
import "./common.css";
import "./floating_label.css";
export default function ModifySchool(props) {
  const { show, school, onClose, onChange } = props;
  const [name, setName] = React.useState("");
  const [introduce, setIntroduce] = React.useState("");
  React.useEffect(() => {
    if (school) {
      setName(school.name);
      setIntroduce(school.introduce);
    }
  }, [school]);
  const handleSubmit = (event) => {
    event.preventDefault();
    let uschool = { ...school };
    let mfields = {};
    mfields.schoolid = school.schoolid;
    mfields.changes = [];
    if (school.name !== name) {
      mfields.changes.push({ name: "name", value: name });
      uschool.name = name;
    }
    if (school.introduce !== introduce) {
      mfields.changes.push({ name: "introduce", vlaue: introduce });
      uschool.introduce = introduce;
    }
    if (mfields.changes.length === 0) return;

    http
      .post("/sapling/modify_school", mfields)
      .then((response) => {
        if (response.data.result === 0) {
          /// Modify successed!
          onChange(uschool);
          onClose();
        }
      })
      .catch((e) => console.error("Error:", e));
  };
  return (
    <Modal title="修改幼儿园信息" show={show} onClose={onClose}>
      <div className="formContainer">
        <input
          type="text"
          id="edit_sapling_name"
          name="edit_sapling_name"
          defaultValue={name}
          placeholder=" "
          onChange={(e) => setName(e.target.value)}
        />
        <label className="label_floating" htmlFor="edit_sapling_name">
          幼儿园名称
        </label>
        <textarea
          defaultValue={introduce}
          placeholder="幼儿园介绍说明"
          onChange={(e) => setIntroduce(e.target.value)}
        />
        <button type="submit" onClick={handleSubmit}>
          修 改
        </button>
      </div>
    </Modal>
  );
}
