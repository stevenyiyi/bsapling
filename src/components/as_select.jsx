import React from "react";
import { PropTypes } from "prop-types";
import "./common.css";

export default function ASSelect(props) {
  const { title, items, kvmap, selectedKey, onChange } = props;
  const [showItems, setShowItems] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState("");

  React.useEffect(() => {
    setSelectedItem(selectedKey);
  }, [selectedKey]);

  const handleDropdown = () => {
    setShowItems((prevState) => !prevState);
  };

  const handleSelectItem = (item) => {
    let changeVal = item[kvmap.key];
    setShowItems(false);
    setSelectedItem(changeVal);
    if (selectedKey !== changeVal) {
      console.log(`asselect change:${changeVal}`);
      onChange(changeVal);
    }
  };

  const getSelectedValue = (key) => {
    let val = title;
    for (const item of items) {
      if (item[kvmap.key] === key) {
        val = item[kvmap.value];
        break;
      }
    }
    return val;
  };

  return (
    <div className="dropdown">
      <div className="dropbtn--container">
        <div className="dropbtn--selected-item">
          {selectedItem ? getSelectedValue(selectedItem) : title}
        </div>
        <div className="dropbtn--arrow" onClick={handleDropdown}>
          <span
            className={`${
              showItems ? "dropbtn--arrow-up" : "dropbtn--arrow-down"
            }`}
          />
        </div>
      </div>
      <div
        style={{ display: showItems ? "block" : "none" }}
        className={"dropdown-content"}
      >
        {items &&
          items.map((item) => (
            <div
              key={item[kvmap.key]}
              onClick={(e) => handleSelectItem(item)}
              className={
                selectedItem === item[kvmap.key] ? "item selected" : "item"
              }
            >
              {item[kvmap.value]}
            </div>
          ))}
      </div>
    </div>
  );
}
ASSelect.propTypes = {
  items: PropTypes.array.isRequired,
  kvmap: PropTypes.object.isRequired,
  selectedKey: PropTypes.string.isRequired,
  onChange: PropTypes.func
};
ASSelect.defaultProps = {
  title: "请选择...",
  items: [],
  kvmap: { key: "key", value: "value" },
  selectedKey: "",
  onChange: (item) => {
    console.log(item);
  }
};
