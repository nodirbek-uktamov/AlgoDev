import React from "react";
import "./ToggleSwitch.scss";
import {classnames} from "../../../utils/string";

export function ToggleSwitch({id, name, text = '', checked, onChange, disabled, ...rest}) {
    function handleKeyPress(e) {
        if (e.keyCode !== 32) return;

        e.preventDefault();
        onChange(!checked);
    }

    return (<div className="toggleWrap">
        <div className="toggle-switch">
            <input
                type="checkbox"
                name={name}
                className="toggle-switch-checkbox"
                id={id}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                {...rest}
            />
            {id ? (<label
                className="toggle-switch-label"
                tabIndex={disabled ? -1 : 1}
                onKeyDown={(e) => handleKeyPress(e)}
                htmlFor={id}
            >
            <span
                className={classnames(['toggle-switch-inner', disabled && 'toggle-switch-disabled'])}
                tabIndex={-1}
            />
                <span
                    className={classnames(['toggle-switch-switch', disabled && 'toggle-switch-disabled'])}
                    tabIndex={-1}
                />
            </label>) : null}
        </div>
        {text && (<label className="toggle-switch-labelText" htmlFor={id}>
            {text}
        </label>)}
    </div>);
}