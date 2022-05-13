import React, {useEffect, useRef, useState} from "react";
import {useOnClickOutside} from "../../../hooks/useOnClickOutside";
import {Input} from "../Input";
import {classnames} from "../../../utils/string";
import {VirtualList} from "../VirtualList";
import {isEmpty} from "../../../utils/common";
import {renderOptions} from "./helpers";
import {SELECT_COLOR_TYPE} from "./constants";
import {SelectIcon} from "./SelectIcon";
import './Select.scss';

export const Select = ({
                           options = [],
                           renderSelectedOption = (opt) => opt,
                           renderMenuOption = (opt) => opt,
                           selectedOption,
                           defaultValue,
                           setSelectedOption = (_) => undefined,
                           color = 'gray',
                           enableSearch = false,
                           searchBy = undefined,
                           ...rest
                       }) => {
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    useOnClickOutside(dropdownRef, handleClick);

    const [items, setItems] = useState([]);
    const [visible, setVisible] = useState(false);
    const [value, setValue] = useState("");

    useEffect(() => {
        if (selectedOption) setValue(renderSelectedOption(selectedOption))
    },[selectedOption])

    useEffect(() => {
        if (options) {
            setItems(options)

            if (defaultValue && isEmpty(selectedOption)) {
                onItemSelect(defaultValue)
            }
        }
    }, [options]);

    function handleClick(e) {
        if (!visible) return;

        if (selectedOption) {
            if (value && value.length > 0) {
                setValue(renderSelectedOption(selectedOption));
            } else {
                setSelectedOption({});
            }
        } else {
            setValue("");
        }
        setVisible(false);
    }

    function onChange(e) {
        setValue(e.target.value);

        if (!visible) {
            setVisible(true);
        }
    };

    function onItemSelect(item) {
        setValue(renderSelectedOption(item));
        setSelectedOption(item);
        setVisible(false);
    };

    return (
        <div className="selectWrap" {...rest}>
            <div tabIndex="0" className="select_input_container">
                <Input
                    ref={inputRef}
                    readOnly={enableSearch ? undefined : "readonly"}
                    className={classnames(["select_input-styled", visible && 'select_input-styled_open' , SELECT_COLOR_TYPE[color].input])}
                    type="text"
                    disabled={!items}
                    value={value}
                    onChange={onChange}
                    onFocus={() => {
                        setVisible(true)
                        enableSearch && value && inputRef.current.select()

                    }}
                    renderIcon={<SelectIcon className={classnames(['select_input-icon' ,visible && 'select_input-icon-visible'])}
                                            color={SELECT_COLOR_TYPE[color].svg}/>}
                />
            </div>

            <div ref={dropdownRef} className={classnames(['dropdown', visible && 'visible'])}>
                {visible && (
                    <VirtualList items={renderOptions(value, items, enableSearch, searchBy)}
                                 renderRow={renderMenuOption} onItemSelect={onItemSelect}/>
                )}
            </div>
        </div>
    );
};