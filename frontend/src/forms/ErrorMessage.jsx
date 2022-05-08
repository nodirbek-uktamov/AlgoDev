import React from 'react';

export function ErrorMessage({children}) {
    return <span style={{color: '#E61739', fontSize: '14px', fontWeight: 600}}>{children}</span>
}