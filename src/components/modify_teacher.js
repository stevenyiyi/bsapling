import React from "react";
import Modal from "./modal";
import http from "../http_common";
import CheckboxMultiSelect from "./multi_select";
import config from "../config";
import "./common.css";
import "./floating_label.css";
export default function ModifyTeacher(props) {
  const { classes, show, teacher, onClose, onChange } = props;
  const [name, setName] = React.useState("");
  const [classids, setClassids] = React.useState([]);
  const [photo, setPhoto] = React.useState(null);
  const [introduce, setIntroduce] = React.useState("");
  const refAvatar = React.useRef();

  React.useEffect(() => {
    if (teacher) {
      setName(teacher.nick_name);
      setClassids(teacher.classes);
      setPhoto(teacher.photo);
      setIntroduce(teacher.note);
      if (teacher.photo) {
        refAvatar.current.src = `${config.resBaseUrl}/imgs/${teacher.username}_photo.${teacher.photo}`;
      } else {
        refAvatar.current.src = `${config.resBaseUrl}/imgs/img_avatar_unknow.png`;
      }
    }
  }, [teacher]);

  /// 处理文件上传
  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile.size > 400 * 1024) {
      alert("选择的头像文件不能超过400KB！");
      return;
    }
    refAvatar.current.src = URL.createObjectURL(selectedFile);
    setPhoto(selectedFile);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    let uteacher = { ...teacher };
    let mfields = new FormData();
    console.log(classids);
    mfields.append("username", teacher.username);
    if (teacher.nick_name !== name) {
      mfields.append("nick_name", name);
      uteacher.nick_name = name;
    }

    if (teacher.classes !== classids) {
      mfields.append("class_id", classids.join());
      uteacher.classes = classids;
    }

    if (teacher.note !== introduce) {
      mfields.append("note", introduce);
      uteacher.note = introduce;
    }

    if (teacher.photo !== photo) {
      let ext = photo.name.split(".").pop();
      let upload_file = `${teacher.username}_photo.${ext}`;
      uteacher.photo = upload_file;
      mfields.append("photo", photo, upload_file);
    }

    if (!mfields) return;

    http
      .post("/sapling/modify_subuser", mfields)
      .then((response) => {
        if (response.data.result === 0) {
          /// Modify successed!
          onChange(uteacher);
          onClose();
        } else {
          console.log(`Modify teacher error:${response.data.result}`);
        }
      })
      .catch((e) => console.error("Error:", e));
  };
  return (
    <Modal title="修改教师信息" show={show} onClose={onClose}>
      <div className="formContainer">
        <div className="form__div">
          <input
            id="edit_teacher_name"
            name="edit_teacher_name"
            type="text"
            className="form__input"
            placeholder=" "
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className="form__label" htmlFor="edit_teacher_name">
            教师姓名
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
              id="modify-teacher-photo-file-upload"
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
          placeholder="教师介绍"
          value={introduce}
          onChange={(e) => setIntroduce(e.target.value)}
        />
        <button type="submit" onClick={handleSubmit}>
          修 改
        </button>
      </div>
    </Modal>
  );
}
