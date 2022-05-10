import React, {useEffect, useRef, useState} from "react";
import {useOnClickOutside} from "../../../hooks/useOnClickOutside";
import {Input} from "../Input";
import './Select.scss';
import {classnames} from "../../../utils/string";
import {VirtualList} from "../VirtualList";
import {isEmpty} from "../../../utils/common";

const SelectIcon = ({color, className = ''}) => {
    return <svg className={className} width="12" height="7" viewBox="0 0 12 7" fill="none"
                xmlns="http://www.w3.org/2000/svg">
        <path
            d="M11.7071 1.70711C12.0976 1.31658 12.0976 0.683417 11.7071 0.292893C11.3166 -0.0976311 10.6834 -0.0976311 10.2929 0.292893L11.7071 1.70711ZM6 6L5.29289 6.70711C5.68342 7.09763 6.31658 7.09763 6.70711 6.70711L6 6ZM1.70711 0.292893C1.31658 -0.0976311 0.683417 -0.0976311 0.292893 0.292893C-0.0976311 0.683417 -0.0976311 1.31658 0.292893 1.70711L1.70711 0.292893ZM10.2929 0.292893L5.29289 5.29289L6.70711 6.70711L11.7071 1.70711L10.2929 0.292893ZM6.70711 5.29289L1.70711 0.292893L0.292893 1.70711L5.29289 6.70711L6.70711 5.29289Z"
            fill={color}/>
    </svg>
}

function searchFilter(searchValue, list, searchBy) {
    if (!searchBy) return;

    let lowerCaseQuery = searchValue.toLowerCase();
    return searchValue
        ? list.filter((x) => searchBy(x).toLowerCase().includes(lowerCaseQuery))
        : list;
}

function renderOptions(value = '', options, enableSearch, searchBy) {
    if (enableSearch) return searchFilter(value, options, searchBy);

    return options;
}

const SELECT_COLOR_TYPE = {
    gray: {input: 'select_input-gray', svg: 'white'},
    lightgray: {input: 'select_input-lightgray', svg: 'white'},
    white: {input: 'select_input-white', svg: 'black'}
}

export const Select = ({
                           options = [],
                           renderSelectedOption = (opt) => opt,
                           renderMenuOption = (opt) => opt,
                           selectedOption,
                           defaultValue,
                           setSelectedOption = (_) => undefined,
                           color = 'gray',
                           enableSearch = false,
                           searchBy = undefined
                       }) => {
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    useOnClickOutside(dropdownRef, handleClick);

    const [items, setItems] = useState([]);
    const [visible, setVisible] = useState(false);
    const [value, setValue] = useState("");

    useEffect(() => {
        if (options) {
            setItems(options)

            if (defaultValue && isEmpty(selectedOption)) onItemSelect(defaultValue)
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
        <div className="selectWrap">
            <div tabIndex="0" className="select_input_container">
                <Input
                    ref={inputRef}
                    readOnly={enableSearch ? undefined : "readonly"}
                    className={classnames(["select_input-styled", SELECT_COLOR_TYPE[color].input])}
                    type="text"
                    disabled={!items}
                    value={value}
                    onChange={onChange}
                    onFocus={() => {
                        setVisible(true)
                        enableSearch && value && inputRef.current.select()

                    }}
                    renderIcon={<SelectIcon className={classnames([visible && 'select_input-icon-visible'])}
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