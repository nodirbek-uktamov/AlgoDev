import React, {useEffect, useRef} from 'react';
import './Slider.scss';
import {classnames} from "../../../utils/string";

const VALUE_TYPE = {
    percent: '%',
    none: ''
}

function handleTrackerProgress(input) {
    input.style.setProperty("--value", input.value);
    input.style.setProperty("--min", input.min === "" ? "0" : input.min);
    input.style.setProperty("--max", input.max === "" ? "100" : input.max);
    input.addEventListener("input", () =>
        input.style.setProperty("--value", input.value)
    );
}

function renderValue(defaultValue, valueType) {
    return <span>{defaultValue} {VALUE_TYPE[valueType]}</span>

}

export function Slider({
                           min = 0,
                           max = 100,
                           defaultValue = 50,
                           onValueChange,
                           valueType = 'none',
                           className = "",
                           ...rest
                       }) {
    const inputRef = useRef(null);

    useEffect(() => {
        handleTrackerProgress(inputRef.current);
    }, []);

    return (
        <div className="sliderWrap">
            <input
                ref={inputRef}
                className={classnames(["slider_main slider-progress", className])}
                type="range"
                min={min}
                max={max}
                defaultValue={defaultValue}
                onChange={(e) => onValueChange(e.target.value)}
                {...rest}
            />
            <span>{renderValue(defaultValue, valueType)}</span>
        </div>
    );
}