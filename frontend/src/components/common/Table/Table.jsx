import React from 'react'
import './Table.scss'
import {useSort} from "../../../hooks/useSort";
import {renderHeaderCell, renderTableBody} from "./helpers";

export function Table({columns, tableData, noDisplayDataMessage = 'No data to display', isBottomRounded = true}) {
    const sortManager = useSort(tableData);
    const displayConfig = {noDisplayDataMessage, isBottomRounded}

    return (
        <div className="tableWrap">
            <table className="tableContainer">
                <thead>
                <tr key="table_head">
                    {columns.map((column) => (
                        <th
                            className="table_headerCell table_stickyHeader"
                            style={{width: column.width, textAlign: column.textAlign}}
                            key={column.key}>
                            {renderHeaderCell(column, sortManager)}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="table_bodyContainer">
                {renderTableBody(columns, sortManager, displayConfig)}
                </tbody>
            </table>
        </div>
    );
}