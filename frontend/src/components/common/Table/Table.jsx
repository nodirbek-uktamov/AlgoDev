import React from 'react'
import './Table.scss'
import {useSort} from "../../../hooks/useSort";

function renderSortIcon(isSorting, sortDirection) {
    if (!isSorting) return null;

    return sortDirection === 1 ? <>&uarr;</> : <>&darr;</>
}

function renderHeaderCell(column, sortManager) {
    if (!column.hasSorting) {
        return <button>{column.title}</button>;
    }

    const {sortDispatcher, sortProperty, sortDirection} = sortManager;

    const handleSort = () => sortDispatcher(column.key)

    return <button data-sortable={true}
                   onClick={handleSort}>
        {column.title} {renderSortIcon(column.key === sortProperty, sortDirection)}
    </button>;
}

function renderNoDataMessage(colSpan, noDisplayDataMessage) {
    return <tr data-empty={true}>
        <td colSpan={colSpan}>{noDisplayDataMessage}</td>
    </tr>
}

export function Table({columns, tableData, noDisplayDataMessage = 'No data to display'}) {
    const sortManager = useSort(tableData);
    const {sortData, isEmpty} = sortManager;

    return (
        <div className="tableWrap">
            <table>
                <thead>
                <tr>
                    {columns.map((column) => (
                        <th
                            className="has-background-grey-dark is-size-7 has-text-light has-text-left"
                            key={column.key}>
                            {column.title && renderHeaderCell(column, sortManager)}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {isEmpty ? renderNoDataMessage(columns.length, noDisplayDataMessage) : sortData.map((item, index) => (
                    <tr key={`row_${index}`}>
                        {columns.map((column, key) => (
                            <td key={key} className="has-background-grey-darker has-text-white">
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