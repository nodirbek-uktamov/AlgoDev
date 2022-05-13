import React, {useState} from 'react'
import './FilterPanel.scss'
import {ORDERS_FILTER_TYPE} from "../../utils/orders-filter-type";
import {Button} from "../common/Button";

export function FilterPanel({handleFilter, allOrdersCount, openOrdersCount, filter: filterState}) {
    const filterKey = useState('orderStatus')[0];

    const filterConfig = [
        {
            displayTitle: ORDERS_FILTER_TYPE.all,
            filterValue: ORDERS_FILTER_TYPE.all,
            renderCount: () => <>({allOrdersCount})</>
        },
        {
            displayTitle: ORDERS_FILTER_TYPE.open,
            filterValue: ORDERS_FILTER_TYPE.submitted,
            renderCount: () => <>({openOrdersCount})</>
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
        },
        {
            displayTitle: ORDERS_FILTER_TYPE.closed,
            filterValue: ORDERS_FILTER_TYPE.closed,
            renderCount: null
        },
        {
            displayTitle: ORDERS_FILTER_TYPE.stops,
            filterValue: ORDERS_FILTER_TYPE.stops,
            renderCount: null
        }
    ];

    return <div className='filter-panel_container'>
        {filterConfig.map((filter, idx) => {
            const color = filter.filterValue === filterState.value ? 'white' : 'gray';
            const text = <span
                style={{
                    color: 'inherit',
                    textTransform: 'capitalize'
                }}>{filter.displayTitle} {filter.renderCount && filter.renderCount()}</span>;

            return <Button
                scale={false}
                key={filter.filterValue}
                onClick={handleFilter(filterKey, filter.filterValue)}
                className="filter-btn"
                size="M"
                text={text}
                color={color}
            />
        })}
    </div>
}