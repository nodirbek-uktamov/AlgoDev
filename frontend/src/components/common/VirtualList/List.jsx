import React, {useContext} from "react";
import ListContext from "./ListContext";
import './List.scss';
import {Row} from "./Row";
import {classnames} from "../../../utils/string";

export function List() {
    const {
        items,
        renderRow,
        viewportHeight,
        amountRows,
        rowHeight,
        scrollTop,
        setScrollTop,
        indexStart,
        indexEnd,
        oncePerMs,
        rowsRef,
        amountRowsBuffered,
    } = useContext(ListContext);

    const data = [];

    for (let index = 0; index < amountRows; index++) {
        data.push({index, data: items[index], top: index * rowHeight});
    }

    return <>
        <div
            className={classnames(["list_main", viewportHeight < 400 && 'no-scroll'])}
            style={{height: viewportHeight}}
            onScroll={(e) => setScrollTop(e.target.scrollTop)}
        >
            <div
                className="rows_main"
                style={{height: amountRows * rowHeight}}
                ref={rowsRef}
            >
                {[...data].slice(indexStart, indexEnd + 1).map((item) => (
                    <Row key={item.index} style={{top: item.top}} item={item} renderRow={renderRow}/>
                ))}
            </div>
        </div>
    </>
}