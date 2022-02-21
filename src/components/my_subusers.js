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
  const OP_UNKNOWN = 0;
  const OP_EDIT = 1;
  const OP_DELETE = 2;

  const openSnackbar = React.useRef(useSnackbar()[0]);
  const [data, setData] = React.useState(null);
  const refMenu = React.useRef(null);
  const [showAddUser, setShowAddUser] = React.useState(false);
  const [confirm, setConfirm] = React.useState({
    show: false,
    message: "",
    onOK: undefined,
    onCancel: undefined
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

  const [opIndex, setOpIndex] = React.useState(0);
  const [opType, setOpType] = React.useState(OP_UNKNOWN);

  const [totalRows, setTotalRows] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [nextDisabled, setNextDisabled] = React.useState(true);
  const [prevDisabled, setPrevDisabled] = React.useState(true);

  const togglePage = React.useCallback(() => {
    let total_pages = Math.ceil(totalRows / rowsPerPage);
    console.log(`page:${page},total page:${total_pages}`);
    if (page > 0) {
      setPrevDisabled(false);
    } else {
      setPrevDisabled(true);
    }
    if (page + 1 < total_pages) {
      setNextDisabled(false);
    } else {
      setNextDisabled(true);
    }
  }, [page, rowsPerPage, totalRows]);

  React.useEffect(() => {
    let qparams = {
      ...filter,
      current_page: page,
      rows_per_page: rowsPerPage
    };
    togglePage();
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
    if (opType === OP_DELETE) {
      console.log(`Delete user:${data[opIndex].username}`);
      http
        .get(`/sapling/delete_user?username=${data[opIndex].username}`)
        .then((response) => {
          if (response.data.result === 0) {
            /// 删除成功
            setOpType(OP_UNKNOWN);
            let cusers = [...data];
            cusers.splice(opIndex, 1);
            setData(cusers);
            setTotalRows((prevs) => prevs - 1);
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
  }, [opIndex, opType, data]);

  React.useEffect(() => {
    if (deleteSubusers) {
      http
        .get("/sapling/delete_all_subusers")
        .then((response) => {
          if (response.data.result === 0) {
            setData([]);
            setTotalRows(0);
            setPage(0);
            togglePage();
            setDeleteSubusers(false);
          } else {
            openSnackbar.current(
              `delete_all_subusers, server response error code:${response.data.result}`
            );
          }
        })
        .catch((e) => openSnackbar.current(e.toJSON().message));
    }
  }, [deleteSubusers, togglePage]);

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
      onOK: handleConfirmDeleteUsers,
      onCancel: () => setConfirm({ ...confirm, show: false })
    });
    refMenu.current.classList.toggle("show");
  };

  /// 修改用户
  const handleEditClick = (idx) => {
    setOpType(OP_EDIT);
    setOpIndex(idx);
  };

  /// 删除用户
  const handleDeleteClick = (idx) => {
    setOpIndex(idx);
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
    setOpType(OP_DELETE);
  };

  /// 终止删除指定用户
  const handleCancelDeleteUser = () => {
    setConfirm({ ...confirm, show: false });
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
    console.log("Click next page");
    setPage((prev) => prev + 1);
  };

  /// 移动上一页
  const handlePrevPage = (event) => {
    setPage((prev) => prev - 1);
  };

  /// 新用户注册回调
  const onAddUser = (user) => {
    setData([...data, user]);
  };

  /// 修改用户回调
  const onModifyUser = (user) => {
    let cdata = [...data];
    cdata[opIndex] = user;
    setData(cdata);
  };

  return (
    <div className="tableContainer">
      <div className="topnav">
        <div style={{ marginLeft: "10px" }}>
          <MyDevicesSelect
            value={filter.deviceid}
            onSelectChange={(deviceid) => {
              /// 选择 NVR 改变
              setPage(0);
              setFilter({ ...filter, deviceid: deviceid });
            }}
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
          id="prev-page"
          disabled={prevDisabled}
          className="circle_btn"
          onClick={handlePrevPage}
        >
          <FaAngleLeft />
        </button>
        <button
          disabled={nextDisabled}
          id="next-page"
          className="circle_btn"
          style={{ marginLeft: "20px" }}
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
        onClose={() => setShowAddUser(false)}
        onChange={onAddUser}
      />
      {data && (
        <ModifySubuser
          show={opType === OP_EDIT}
          user={data[opIndex]}
          onClose={() => setOpType(OP_UNKNOWN)}
          onChange={onModifyUser}
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
