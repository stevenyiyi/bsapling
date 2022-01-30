import React from "react";
import MyDevicesSelect from "./my_devices_select";
import UserRegister from "./user_register";
import ModifySubuser from "./modify_subuser";
import Confirm from "./confirm";
import http from "../http_common";
import { useSnackbar } from "./use_snackbar";
import ASTooltip from "./as_tootip";
import {
  FaPen,
  FaTimes,
  FaInfo,
  FaSearch,
  FaEllipsisV,
  FaAngleLeft,
  FaAngleRight
} from "react-icons/fa";
import "./common.css";
import "./my_subusers.css";
import ASSelect from "./as_select";
export default function MySubusers(props) {
  const openSnackbar = React.useRef(useSnackbar()[0]);
  const [data, setData] = React.useState(null);
  const refMenu = React.useRef(null);
  const [showAddUser, setShowAddUser] = React.useState(false);
  const [confirm, setConfirm] = React.useState({
    show: false,
    message: "",
    handler: undefined
  });
  /// 查询状态参数
  const [likely, setLikely] = React.useState("");
  const [filter, setFilter] = React.useState({
    deviceid: "",
    likely: "",
    overdue: false
  });
  /// 删除所有的子用户状态参数
  const [deleteSubusers, setDeleteSubusers] = React.useState(false);

  const UserOP = Object.freeze({ edit: 0, delete: 1, unknown: 2 });

  const [opuser, setOpuser] = React.useState({
    op: UserOP.unknown,
    index: 0
  });

  const [totalRows, setTotalRows] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [myCameras, setMyCameras] = React.useState([]);
  const refPrev = React.useRef();
  const refNext = React.useRef();

  const togglePage = React.useCallback(() => {
    let total_pages = Math.ceil(totalRows / rowsPerPage);
    console.log(`page:${page},total page:${total_pages}`);
    if (page > 0) {
      refPrev.current.disabled = false;
    } else {
      refPrev.current.disabled = true;
    }
    if (page + 1 < total_pages) {
      refNext.current.disabled = false;
    } else {
      refNext.current.disabled = true;
    }
  }, [page, rowsPerPage, totalRows]);

  React.useEffect(() => {
    let qparams = {
      ...filter,
      current_page: page,
      rows_per_page: rowsPerPage
    };
    http
      .post("/sapling/get_subusers", qparams)
      .then((response) => {
        if (response.data.result === 0) {
          if (response.data.hasOwnProperty("total_rows")) {
            setTotalRows(response.data.total_rows);
          }
          let mdata = response.data.rows.map((c) => ({
            ...c,
            openCamList: false
          }));
          setData(mdata);
          /// reset
          if (filter.overdue) {
            filter.overdue = false;
          }
          togglePage();
        } else {
          openSnackbar.current(`Error code:${response.data.result}`);
        }
      })
      .catch((e) => {
        openSnackbar.current(e.toJSON().message);
        togglePage();
      });
  }, [filter, page, rowsPerPage, togglePage]);

  React.useEffect(() => {
    http
      .post("/sapling/get_my_cameras")
      .then((response) => {
        setMyCameras(response.data.cameras);
      })
      .catch((e) => console.error("error:", e));
  }, []);

  React.useEffect(() => {
    if (deleteSubusers) {
      http
        .get("/sapling/delete_all_subusers")
        .then((response) => {
          if (response.data.result === 0) {
            setData([]);
            setTotalRows(0);
            setDeleteSubusers(false);
          } else {
            openSnackbar.current(
              `delete_all_subusers, server response error code:${response.data.result}`
            );
          }
        })
        .catch((e) => openSnackbar.current(e.toJSON().message));
    }
  }, [deleteSubusers]);

  const genCamList = (idx) => {
    return (
      <ul>
        {data[idx].cameras &&
          data[idx].cameras.map((cam) => (
            <li key={cam.deviceid}>{cam.name}</li>
          ))}
      </ul>
    );
  };

  const handleMoreMenu = (event) => {
    refMenu.current.classList.toggle("show");
  };
  /// 注册新用户
  const handleRegisterUser = (event) => {
    event.preventDefault();
    refMenu.current.classList.toggle("show");
    setShowAddUser(true);
  };
  /// 模糊查询
  const handleLikelyClick = (event) => {
    event.preventDefault();
    setFilter({ ...filter, likely: likely });
    setPage(0);
  };
  /// 查询所有过期用户
  const handleOverdueUsers = (event) => {
    event.preventDefault();
    setFilter({ ...filter, overdue: true });
    setPage(0);
    refMenu.current.classList.toggle("show");
  };
  /// 删除所有用户
  const handleDeleteUsers = (event) => {
    event.preventDefault();
    setConfirm({
      ...confirm,
      show: true,
      message: "确定要删除所有的用户？注意,删除后将无法恢复!",
      handler: handleConfirmDeleteUsers
    });
    refMenu.current.classList.toggle("show");
  };
  /// 修改用户
  const handleEditClick = (idx) => {
    setOpuser({ ...opuser, op: UserOP.edit, index: idx });
  };
  /// 删除用户
  const handleDeleteClick = (idx) => {
    setOpuser({ ...opuser, op: UserOP.delete, index: idx });
    setConfirm({
      ...confirm,
      show: true,
      message: "确定要删除该用户？注意,删除后将无法恢复!",
      handler: handleConfirmDeleteUser
    });
  };

  const handleConfirmDeleteUser = () => {
    setConfirm({ ...confirm, show: false });
    http
      .get(`/sapling/delete_user?username=${data[opuser.index].username}`)
      .then((response) => {
        if (response.data.result === 0) {
          /// 删除成功
          let cusers = [...data];
          cusers.splice(opuser.index, 1);
          setTotalRows((prevs) => prevs - 1);
        } else {
          openSnackbar(`服务器返回错误代码:${response.data.result}`);
        }
      })
      .catch((e) => openSnackbar(e.toJSON().message));
  };

  const handleConfirmDeleteUsers = () => {
    setConfirm({ ...confirm, show: false });
    setDeleteSubusers(true);
  };

  /// 显示拥有的摄像头列表
  const handleCamsClick = (idx) => {
    if (data[idx].cameras) {
      let cdata = [...data];
      cdata[idx].openCamList = !cdata[idx].openCamList;
      setData(cdata);
    }
  };

  /// 移到下一页
  const handleNextPage = (event) => {
    event.preventDefault();
    setPage((prev) => prev + 1);
    togglePage();
  };

  /// 移动上一页
  const handlePrevPage = (event) => {
    event.preventDefault();
    setPage((prev) => prev - 1);
    togglePage();
  };

  /// 新用户注册回调
  const onAddUser = (user) => {
    setData([...data, user]);
  };

  /// 修改用户回调
  const onModifyUser = (user) => {
    let cdata = [...data];
    cdata[opuser.index] = user;
    setData(cdata);
  };

  return (
    <div className="tableContainer">
      <div className="topnav">
        <div style={{ marginLeft: "10px" }}>
          <MyDevicesSelect
            value={filter.deviceid}
            onSelectChange={(deviceid) =>
              setFilter({ ...filter, deviceid: deviceid })
            }
          />
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="电话/姓名"
            id="subusers-search"
            name="subusers-search"
            onChange={(e) => setLikely(e.target.value.trim())}
          />
          <button type="submit" onClick={handleLikelyClick}>
            <FaSearch />
          </button>
        </div>
        <div className="dropdown" style={{ marginRight: "10px" }}>
          <button className="circle_btn" onClick={handleMoreMenu}>
            <FaEllipsisV />
          </button>
          <div
            ref={refMenu}
            className="dropdown-content"
            style={{ right: "0px" }}
          >
            <div className="item" onClick={handleRegisterUser}>
              注册新用户
            </div>
            <div className="item" onClick={handleOverdueUsers}>
              所有过期用户
            </div>
            <div className="item" onClick={handleDeleteUsers}>
              删除所有用户
            </div>
            <div className="item">导出数据</div>
          </div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <td>操作</td>
            <td>电话</td>
            <td>姓名</td>
            <td>帐户终止日期</td>
            <td>口令</td>
            <td>摄像头</td>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((item, idx) => (
              <tr key={item.username}>
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
                <td>{item.username}</td>
                <td>{item.nick_name}</td>
                <td>{item.end_ts}</td>
                <td>{item.password}</td>
                <td>
                  <span
                    className="tooltip circle_span"
                    onClick={(e) => handleCamsClick(idx)}
                  >
                    <FaInfo />
                    <ASTooltip
                      placement="bottom"
                      delay={5000}
                      show={data[idx].openCamList}
                      onClose={() => {
                        let cdata = [...data];
                        cdata[idx] = { ...cdata[idx], openCamList: false };
                        setData(cdata);
                      }}
                    >
                      {genCamList(idx)}
                    </ASTooltip>
                  </span>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="pagination">
        <button
          ref={refPrev}
          id="prev-page"
          className="circle_btn"
          disabled={true}
          onClick={handlePrevPage}
        >
          <FaAngleLeft />
        </button>
        <button
          ref={refNext}
          id="next-page"
          className="circle_btn"
          style={{ marginLeft: "20px" }}
          disabled={true}
          onClick={handleNextPage}
        >
          <FaAngleRight />
        </button>
        <label>每页行数:</label>
        <ASSelect
          title=""
          items={[
            { key: "10", value: "10" },
            { key: "20", value: "20" },
            { key: "30", value: "30" },
            { key: "40", value: "40" }
          ]}
          selectedKey="10"
          onChange={(val) => setRowsPerPage(val)}
        />
        <label>{`${page * rowsPerPage} : ${
          (page + 1) * rowsPerPage
        } of ${totalRows}`}</label>
      </div>
      <UserRegister
        show={showAddUser}
        cameras={myCameras}
        onClose={() => setShowAddUser(false)}
        onChange={onAddUser}
      />
      {data && (
        <ModifySubuser
          show={opuser.op === UserOP.edit}
          cameras={myCameras}
          user={data[opuser.index]}
          onClose={() => setOpuser({ ...opuser, op: UserOP.unknown })}
          onChange={onModifyUser}
        />
      )}
      <Confirm
        show={confirm.show}
        message={confirm.message}
        onCancel={() => {
          setConfirm({ ...confirm, show: false });
        }}
        onOK={confirm.handler}
      />
    </div>
  );
}
