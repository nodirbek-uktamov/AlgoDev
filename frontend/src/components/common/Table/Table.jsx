import React from 'react'
import './Table.scss'
import {useSort} from "../../../hooks/useSort";

function renderSortIcon(isSorting, sortDirection) {
    if (!isSorting) return null;

    return sortDirection === 1 ? <>&uarr;</> : <>&darr;</>
}

function renderHeaderCell(column, sortManager) {
    if (!column.hasSorting) {
        return <button className="table_headerCell__item">{column.title}</button>;
    }

    const {sortDispatcher, sortProperty, sortDirection} = sortManager;

    const handleSort = () => sortDispatcher(column.key)

    return <button
        className="table_headerCell__item"
        data-sortable={true}
        onClick={handleSort}>
        {column.title} {renderSortIcon(column.key === sortProperty, sortDirection)}
    </button>;
}

function renderNoDataMessage(colSpan, noDisplayDataMessage, isBottomRounded) {
    return <tr className="table_bodyRow" data-empty={true}>
        <td className="table_bodyCell" data-rounded={isBottomRounded} colSpan={colSpan}>{noDisplayDataMessage}</td>
    </tr>
}

export function Table({columns, tableData, noDisplayDataMessage = 'No data to display', isBottomRounded = true}) {
    const sortManager = useSort(tableData);
    const {sortData, isEmpty} = sortManager;

    return (
        <div className="tableWrap">
            <table className="tableContainer">
                <thead>
                <tr>
                    {columns.map((column) => (
                        <th
                            className="table_headerCell table_stickyHeader"
                            style={{width: column.width, textAlign: column.textAlign}}
                            key={column.key}>
                            {column.title && renderHeaderCell(column, sortManager)}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="table_bodyContainer">
                {isEmpty ? renderNoDataMessage(columns.length, noDisplayDataMessage) : sortData.map((item, index) => (
                    <tr className="table_bodyRow" key={`row_${index}`}>
                        {columns.map((column, key) => (
                            <td className="table_bodyCell" data-rounded={isBottomRounded} style={{textAlign: column.textAlign}} key={key}>
                                {column.render(item)}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}