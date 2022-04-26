import React, {useState} from 'react'
import './FilterPanel.scss'
import {ORDERS_FILTER_TYPE} from "../../utils/orders-filter-type";

export function FilterPanel({handleFilter, allOrdersCount, openOrdersCount, filter: filterState}) {
    const filterKey = useState('orderStatus')[0];

    const filterConfig = [
        {
            displayTitle: ORDERS_FILTER_TYPE.all,
            filterValue: ORDERS_FILTER_TYPE.all,
            renderCount: () => <span>({allOrdersCount})</span>
        },
        {
            displayTitle: ORDERS_FILTER_TYPE.open,
            filterValue: ORDERS_FILTER_TYPE.submitted,
            renderCount: () => <span>({openOrdersCount})</span>
        },
        {
            displayTitle: ORDERS_FILTER_TYPE.filled,
            filterValue: ORDERS_FILTER_TYPE.filled,
            renderCount: null
        },
        {
            displayTitle: ORDERS_FILTER_TYPE.canceled,
            filterValue: ORDERS_FILTER_TYPE.canceled,
            renderCount: null
        }];

    return <div className='filter-panel_container'>
        {filterConfig.map((filter, idx) => {
            return <button onClick={handleFilter(filterKey, filter.filterValue)}
                           className={`filter-panel_btn${filter.filterValue === filterState.value ? ' filter-panel_btn-selected' : ''}`}>{filter.displayTitle} {filter.renderCount && filter.renderCount()}</button>
        })}
    </div>
}