import React, {useContext} from "react";
import {classnames} from "../../../utils/string";
import './Row.scss';
import ListContext from "./ListContext";

export function Row({item, renderRow, ...props}) {
    const {onItemSelect} = useContext(ListContext);
    return (
        <div
            {...props}
            data-index={item.index}
            className={classnames(['row', item.index % 2 === 0 && 'secondary'])}
            onClick={() => onItemSelect(item.data)}
        >
            {renderRow(item.data)}
        </div>
    );


}