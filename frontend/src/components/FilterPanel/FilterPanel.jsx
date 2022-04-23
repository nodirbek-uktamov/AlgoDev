import React from 'react'
import './FilterPanel.scss'

export function FilterPanel({handleFilter, allOrdersCount, openOrdersCount}) {

    return <div className='filter-panel_container'>
        <button onClick={handleFilter("")} className='filter-panel_btn filter-panel_btn-selected'>all
            ( {allOrdersCount} )
        </button>
        <button onClick={handleFilter('orderStatus', 'open')} className='filter-panel_btn'>open ( {openOrdersCount} )
        </button>
        <button onClick={handleFilter('orderStatus', 'filled')} className='filter-panel_btn'>filled</button>
        <button onClick={handleFilter('orderStatus', 'cancelled')} className='filter-panel_btn'>cancelled</button>
        <button onClick={handleFilter('orderStatus', 'closed')} className='filter-panel_btn'>closed</button>
        <button onClick={handleFilter('orderStatus', 'takeprofit')}
                className='filter-panel_btn filter-panel_btn-stops'>takeprofit
        </button>
    </div>
}