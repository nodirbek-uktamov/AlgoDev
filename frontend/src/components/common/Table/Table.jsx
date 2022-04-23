import React from 'react'
import  './Table.scss'
import {useSort} from "../../../hooks/useSort";

function renderSortIcon(isSorting, sortDirection) {
    if (!isSorting) return null;

    return sortDirection === 1 ? <>&uarr;</> : <>&darr;</>
}

export function Table({ columns, tableData }) {
    const {sortData, sortProperty, sortDirection, sortDispatcher} = useSort(tableData)

    return (
        <div>
            <table className="table-container">
                <thead>
                <tr>
                    {columns.map((column) => (
                        <th
                            className="th-cell has-background-grey-dark is-size-7 has-text-light has-text-left py-2"
                            key={column.key}>
                            {column.title && <button className="th-cell_sort" onClick={() => sortDispatcher(column.key)}>{column.title} {renderSortIcon(column.key === sortProperty, sortDirection)}</button>}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {sortData.map((item, index) => (
                    <tr key={`row_${index}`}>
                        {columns.map((column, key) => (
                            <td key={key} className="td-item has-background-grey-darker has-text-white py-2">
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