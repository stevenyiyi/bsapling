import React from "react";
import PropTypes from "prop-types";
import "./common.css";
import "./as_checkbox.css";
function CheckboxOption(props) {
  const { value, isChecked, selectedItems, setSelectedItems, kvmap } = props;
  const [checked, setChecked] = React.useState(false);
  const refChk = React.useRef();
  React.useEffect(() => {
    setChecked(isChecked);
  }, [isChecked]);
  const handleSelected = (event) => {
    if (event.target.checked) {
      setSelectedItems((prevItems) => [...prevItems, value[kvmap.key]]);
    } else {
      setSelectedItems((prevItems) =>
        prevItems.filter((prevItem) => prevItem !== value[kvmap.key])
      );
    }
    setChecked(event.target.checked);
  };

  const getChildren = (item) => {
    let children = null;
    let vals = Object.values(item);
    for (const val of vals) {
      if (typeof val === "object") {
        children = val;
        break;
      }
    }
    return children;
  };

  const genCheckBox = (key, val) => {
    return (
      <div key={key} className="item">
        <label className="as-checkbox-container">
          {val}
          <input
            ref={refChk}
            type="checkbox"
            checked={checked}
            onChange={handleSelected}
          />
          <span className="as-checkbox-checkmark"></span>
        </label>
      </div>
    );
  };

  const genGroup = (key, val, childvals) => (
    <div key={key}>
      <label className="as-checkbox-group">{val}</label>
      {childvals &&
        childvals.map((item) => (
          <CheckboxOption
            key={item[kvmap.key]}
            value={item}
            isChecked={selectedItems.includes(item[kvmap.key]) ? true : false}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            kvmap={kvmap}
          />
        ))}
    </div>
  );

  const childvals = getChildren(value);
  return childvals
    ? genGroup(value[kvmap.key], value[kvmap.value], childvals)
    : genCheckBox(value[kvmap.key], value[kvmap.value]);
}

export default function CheckboxMultiSelect(props) {
  const { title, items, selectedItems, setSelectedItems, kvmap } = props;
  const [isDropdown, setIsDropdown] = React.useState(false);
  const refBut = React.useRef();
  const refContent = React.useRef();
  const handleSelectButtonClick = (event) => {
    refBut.current.className = isDropdown
      ? "dropbtn--arrow-down"
      : "dropbtn--arrow-up";
    refContent.current.classList.toggle("show");
    setIsDropdown((prevState) => !prevState);
  };

  const genMultiOptions = () =>
    items &&
    items.map((item) => (
      <CheckboxOption
        key={item[kvmap.key]}
        value={item}
        isChecked={
          selectedItems && selectedItems.includes(item[kvmap.key])
            ? true
            : false
        }
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        kvmap={kvmap}
      />
    ));

  return (
    <div className="dropdown">
      <div className="dropbtn--container">
        <div className="dropbtn--selected-item">
          {`${title}(${selectedItems.length})`}
        </div>
        <div className="dropbtn--arrow" onClick={handleSelectButtonClick}>
          <span ref={refBut} className="dropbtn--arrow-down" />
        </div>
      </div>
      <div ref={refContent} className="dropdown-content">
        {genMultiOptions()}
      </div>
    </div>
  );
}

CheckboxMultiSelect.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  selectedItems: PropTypes.array.isRequired,
  setSelectedItems: PropTypes.func.isRequired,
  kvmap: PropTypes.object.isRequired
};

CheckboxMultiSelect.defaultProps = {
  title: "选择摄像头",
  items: [],
  selectedItems: [],
  setSelectedItems: (items) => {},
  kvmap: { key: "deviceid", value: "name" }
};
