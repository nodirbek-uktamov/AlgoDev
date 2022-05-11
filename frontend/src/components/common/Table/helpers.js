import React from 'react';

export function renderHeaderCell(column, sortManager) {
    const customRenderer = column.renderHeaderCell;

    if (customRenderer && typeof customRenderer === 'function') {
        return customRenderer(column);
    }

    return handleHeaderCellRender(column, sortManager);
}

export function renderSortIcon(isSorting, sortDirection) {
    if (!isSorting) return null;

    return sortDirection === 1 ? <>&uarr;</> : <>&darr;</>
}

export function renderNoDataMessage(colSpan, displayConfig) {
    return <tr className="table_bodyRow" data-empty={true}>
        <td className="table_bodyCell" data-rounded={displayConfig.isBottomRounded}
            colSpan={colSpan}>{displayConfig.noDisplayDataMessage}</td>
    </tr>
}

export function renderSortingCell(column, sortManager) {
    const {sortDispatcher, sortProperty, sortDirection} = sortManager;

    const handleSort = () => sortDispatcher(column.key)

    return <button
        className="table_headerCell__item"
        data-sortable={true}
        onClick={handleSort}>
        {column.title} {renderSortIcon(column.key === sortProperty, sortDirection)}
    </button>;
}

export function handleHeaderCellRender(column, sortManager) {
    if (!column.hasSorting) {
        return <button className="table_headerCell__item">{column.title}</button>;
    }

    return renderSortingCell(column, sortManager)
}

export function renderTableBody(columns, sortManager, displayConfig) {

    return sortManager.isEmpty ? renderNoDataMessage(columns.length, displayConfig) : sortManager.sortData.map((item, index) => (
        <tr className="table_bodyRow" key={`row_${index}`}>
            {columns.map((column, key) => (
                <td className="table_bodyCell" data-rounded={displayConfig.isBottomRounded}
                    style={{textAlign: column.textAlign}} key={key}>
                    {column.render(item)}
                </td>
            ))}
        </tr>
    ));
}