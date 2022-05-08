import React from "react";
import {ListContextProvider} from "./ListContextProvider";
import {List} from "./List";

export function VirtualList({items, renderRow, onItemSelect}) {
    return <ListContextProvider items={items} renderRow={renderRow} onItemSelect={onItemSelect}>
        <List/>
    </ListContextProvider>
}