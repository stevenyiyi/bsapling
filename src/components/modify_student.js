import React from "react";
import http from "../http_common";
import Modal from "./modal";
import "./common.css";
import "./floating_label.css";
export default function ModifyStudent(props) {
  const { show, student, onClose, onChange } = props;
  const [name, setName] = React.useState("");
  const [photo, setPhoto] = React.useState(null);
  const [endts, setEndts] = React.useState("1970-01-01");
  const refAvatar = React.useRef();

  React.useEffect(() => {
    if (student) {
      setName(student.nick_name);
      setPhoto(student.photo);
      setEndts(student.end_ts);
      if (student.photo) {
        refAvatar.current.src = `imgs/${student.photo}`;
      } else {
        refAvatar.current.src = "imgs/img_avatar_unknow.png";
      }
    }
  }, [student]);

  /// 处理文件上传
  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile.size > 20 * 1024) {
      alert("选择的头像文件不能超过20KB！");
      return;
    }
    refAvatar.current.src = URL.createObjectURL(selectedFile);
    setPhoto(selectedFile);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    let ustudent = { ...student };
    let mfields = new FormData();
    mfields.append("username", student.username);
    if (student.nick_name !== name) {
      mfields.append("nick_name", name);
      ustudent.nick_name = name;
    }

    if (student.photo !== photo) {
      let ext = photo.name.split(".").pop();
      let upload_file = `${student.username}_photo.${ext}`;
      mfields.append("photo", photo, upload_file);
      ustudent.photo = upload_file;
    }

    if (student.end_ts !== endts) {
      mfields.append("end_ts", endts);
      ustudent.end_ts = endts;
    }

    if (!mfields) return;

    http
      .post("/sapling/modify_subuser", mfields)
      .then((response) => {
        if (response.data.result === 0) {
          /// Modify successed!
          onChange(ustudent);
          onClose();
        }
      })
      .catch((e) => console.error("Error:", e));
  };
  return (
    <Modal title="修改幼儿信息" show={show} onClose={onClose}>
      <div className="formContainer">
        <div className="form__div">
          <input
            id="edit_student_name"
            type="text"
            className="form__input"
            value={name}
            placeholder=" "
            onChange={(e) => setName(e.target.value)}
          />
          <label className="form__label" htmlFor="edit_student_name">
            幼儿姓名
          </label>
        </div>
        <div className="form__div">
          <input
            id="edit_student_endts"
            name="edit_student_endts"
            type="date"
            className="form__input"
            value={endts}
            onChange={(e) => setEndts(e.target.value)}
          />
          <label className="form__label" htmlFor="edit_student_endts">
            帐户终止日期
          </label>
        </div>
        <div className="personal-image">
          <label>
            <input
              type="file"
              id="modify-student-photo-file-upload"
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

        <button type="submit" onClick={handleSubmit}>
          修 改
        </button>
      </div>
    </Modal>
  );
}
