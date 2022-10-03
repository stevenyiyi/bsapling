import React from "react";
import { FaPen, FaTimes } from "react-icons/fa";
import MySchoolsSelect from "./my_schools_select";
import MyClassSelect from "./my_class_select";
import http from "../http_common";
import ModifyStudent from "./modify_student";
import AddStudent from "./add_student";
import Confirm from "./confirm";
import ASTooltip from "./as_tootip";
import "./common.css";
export default function MyStudents(props) {
  const [schoolid, setSchoolid] = React.useState("");
  const [classid, setClassid] = React.useState("");
  const [data, setData] = React.useState(null);
  const [edStudent, setEdStudent] = React.useState({
    index: 0,
    show: false
  });
  const [addStudentShow, setAddStudentShow] = React.useState(false);
  const [confirm, setConfirm] = React.useState({
    show: false,
    message: "",
    onOK: undefined,
    onCancel: undefined
  });
  const [deleteInfo, setDeleteInfo] = React.useState({ index: 0, flag: false });
  const [message, setMessage] = React.useState({ show: false, text: "" });
  const refConfirm = React.useRef();
  const refSelClass = React.useRef();
  React.useEffect(() => {
    if (schoolid && classid) {
      http
        .get(`/sapling/get_students?schoolid=${schoolid}&classid=${classid}`)
        .then((response) => {
          if (response.data.result === 0) {
            setData(response.data.students);
          } else {
            console.log(`服务器返回错误:${response.data.result}`);
          }
        })
        .catch((e) => console.error("Error:", e));
    }
  }, [schoolid, classid]);

  React.useEffect(() => {
    if (deleteInfo.flag) {
      console.log(`Delete user:${data[deleteInfo.index].username}`);
      http
        .get(`/sapling/delete_user?username=${data[opIndex].username}`)
        .then((response) => {
          setDeleteInfo({ ...deleteInfo, flag: false });
          if (response.data.result === 0) {
            /// 删除成功
            setDeleteInfo({ ...deleteInfo, flag: false });
            let cusers = [...data];
            cusers.splice(deleteInfo.index, 1);
            setData(cusers);
          } else {
            setOpType(OP_UNKNOWN);
            openSnackbar.current(`服务器返回错误代码:${response.data.result}`);
          }
        })
        .catch((e) => {
          setOpType(OP_UNKNOWN);
          openSnackbar.current(e.toJSON().message);
        });
    }
  });

  const handleEditClick = (idx) => {
    setEdStudent({ ...edStudent, index: idx, show: true });
  };

  ///处理删除学生信息
  const handleDeleteClick = (idx) => {
    setDeleteInfo({ ...deleteInfo, index: idx });
    setConfirm({
      ...confirm,
      show: true,
      message: `确定要删除用户:${data[idx].nick_name}？注意,删除后将无法恢复!`,
      onOK: handleConfirmDeleteUser,
      onCancel: handleCancelDeleteUser
    });
  };

  /// 确认删除指定的子用户
  const handleConfirmDeleteUser = () => {
    setConfirm({ ...confirm, show: false });
    setDeleteInfo({ ...deleteInfo, flag: true });
  };

  /// 终止删除指定用户
  const handleCancelDeleteUser = () => {
    setConfirm({ ...confirm, show: false });
  };

  const handleAddClick = (event) => {
    event.preventDefault();
    if (!schoolid || !classid) {
      setMessage({ ...message, show: true, text: "请选择学校和班级!" });
    } else {
      setAddStudentShow(true);
    }
  };

  const handleAddStudent = (adstudent) => {
    setData([...data, adstudent]);
  };

  const handleModifyStudent = (edstudent) => {
    let items = [...data];
    items[edStudent.index] = edstudent;
    setData(items);
  };

  return (
    <div className="tableContainer">
      <div className="tableHeader">
        <MySchoolsSelect
          value={schoolid}
          onSelectChange={(value) => setSchoolid(value)}
        />
        {schoolid && (
          <MyClassSelect
            ref={refSelClass}
            schoolid={schoolid}
            value={classid}
            onSelectChange={(v) => setClassid(v)}
          />
        )}
        <button
          type="submit"
          className="tooltip normal_btn"
          ref={refConfirm}
          onClick={handleAddClick}
        >
          新增
          <ASTooltip
            placement="bottom"
            show={message.show}
            delay={5000}
            onClose={() => setMessage({ ...message, show: false })}
          >
            {message.text}
          </ASTooltip>
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>操作</th>
            <th>姓名</th>
            <th>电话</th>
            <th>口令</th>
            <th>截止日期</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((el, idx) => (
              <tr key={el.username}>
                <td>
                  <span
                    className="circle_span"
                    onClick={(e) => handleEditClick(idx)}
                  >
                    <FaPen />
                  </span>
                  <span
                    className="circle_span"
                    onClick={(e) => handleDeleteClick(idx)}
                  >
                    <FaTimes />
                  </span>
                </td>
                <td>{el.nick_name}</td>
                <td>{el.username}</td>
                <td>{el.password}</td>
                <td>{el.end_ts}</td>
              </tr>
            ))}
        </tbody>
      </table>
      {schoolid && (
        <AddStudent
          schoolid={schoolid}
          classid={classid}
          show={addStudentShow}
          onClose={() => setAddStudentShow(false)}
          onChange={handleAddStudent}
        />
      )}
      {data && (
        <ModifyStudent
          show={edStudent.show}
          student={data[edStudent.index]}
          onClose={() => setEdStudent({ ...edStudent, show: false })}
          onChange={handleModifyStudent}
        />
      )}
      <Confirm
        show={confirm.show}
        message={confirm.message}
        onCancel={confirm.onCancel}
        onOK={confirm.onOK}
      />
    </div>
  );
}
