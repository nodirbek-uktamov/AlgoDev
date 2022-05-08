import React, { useRef, useState } from "react";
import ListContext from "./ListContext";

export function ListContextProvider({ items, renderRow, onItemSelect, children }) {
    const [scrollTop, setScrollTop] = useState(0);
    const rowsRef = useRef(null);
    const viewportHeight = 400;
    const amountRows = items.length;
    const rowHeight = 40;
    const amountRowsBuffered = 2;
    const indexStart = Math.max(
        Math.floor(scrollTop / rowHeight) - amountRowsBuffered,
        0
    );
    const indexEnd = Math.min(
        Math.ceil((scrollTop + viewportHeight) / rowHeight - 1) +
        amountRowsBuffered,
        amountRows - 1
    );
    const oncePerMs = 20;

    const value = {
        items,
        renderRow,
        onItemSelect,
        scrollTop,
        setScrollTop,
        rowsRef,
        viewportHeight,
        amountRows,
        rowHeight,
        indexStart,
        indexEnd,
        oncePerMs,
        amountRowsBuffered,
    };

    return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
}
