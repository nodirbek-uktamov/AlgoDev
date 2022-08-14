import React from 'react'

export default function DraggableHeader({ label, className }) {
    return (
        <div className={className} style={{ background: '#1d2738', height: 50, display: 'flex', alignItems: 'center', paddingLeft: 15, borderTopLeftRadius: '1.4rem', borderTopRightRadius: '1.4rem', cursor: 'all-scroll' }}>
            {label}
        </div>
    )
}
