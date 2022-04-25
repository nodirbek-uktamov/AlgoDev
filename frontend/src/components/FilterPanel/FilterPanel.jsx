import React, {useState} from 'react'
import './FilterPanel.scss'
import {ORDERS_FILTER_TYPE} from "../../utils/orders-filter-type";

export function FilterPanel({handleFilter, allOrdersCount, openOrdersCount}) {
    const filterKey = useState('orderStatus')[0];

    return <div className='filter-panel_container'>
        <button onClick={handleFilter("")} className='filter-panel_btn filter-panel_btn-selected'>all
            ({allOrdersCount})
        </button>
        <button onClick={handleFilter(filterKey, ORDERS_FILTER_TYPE.submitted)} className='filter-panel_btn'>
            {ORDERS_FILTER_TYPE.submitted} ({openOrdersCount})
        </button>
        <button onClick={handleFilter(filterKey, ORDERS_FILTER_TYPE.filled)}
                className='filter-panel_btn'>{ORDERS_FILTER_TYPE.filled}</button>
        <button onClick={handleFilter(filterKey, ORDERS_FILTER_TYPE.canceled)}
                className='filter-panel_btn'>{ORDERS_FILTER_TYPE.canceled}</button>
        <button onClick={handleFilter(filterKey, ORDERS_FILTER_TYPE.closed)}
                className='filter-panel_btn'>{ORDERS_FILTER_TYPE.closed}</button>
        <button onClick={handleFilter(filterKey, ORDERS_FILTER_TYPE.takeprofit)}
                className='filter-panel_btn filter-panel_btn-stops'>{ORDERS_FILTER_TYPE.takeprofit}
        </button>
    </div>
}