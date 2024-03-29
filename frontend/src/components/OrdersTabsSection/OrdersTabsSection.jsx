import React from 'react'
import { useHistory } from 'react-router-dom'
import { Button } from '../common/Button'
import { signOut } from '../../utils/auth'
import { Card } from '../common/Card'
import { OrdersListTab } from './OrdersListTab'
import { DepthTab } from './DepthTab'

export function OrdersTabsSection({ botPrices }) {
    const history = useHistory()

    return (
        <div style={{ height: '100%', width: '100%', display: 'flex', gap: '1.1rem' }}>
            <Card>
                <DepthTab botPrices={botPrices} />
            </Card>

            <div style={{ height: '100%', gap: '1.1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Card>
                    <OrdersListTab />
                </Card>

                <Button
                    color="white"
                    text="Log out"
                    onClick={() => signOut(history)} />
            </div>
        </div>
    )
}
