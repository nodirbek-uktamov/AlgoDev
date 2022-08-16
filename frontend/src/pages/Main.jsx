import React, { useEffect, useState } from 'react'
import { Form, Formik } from 'formik'
import Tabs from '../components/Tabs'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { useLoad, usePatchRequest } from '../hooks/request'
import InputOld from '../components/common/InputOld'
import { USER_DETAIL, USER_SETTINGS } from '../urls'
import Loader from '../components/common/Loader'
import Checkbox from '../components/common/Checkbox'

export default function Main() {
    const userDetail = useLoad({ url: USER_DETAIL })
    const userSettings = usePatchRequest({ url: USER_SETTINGS })
    const user = userDetail.response

    const [voices, setVoices] = useState({})

    const initialValues = {
        ...(user || {}),
        huobiApiKey: '',
        huobiSecretKey: '',
        ftxApiKey: '',
        ftxSecretKey: '',
        ftxSubAccount: (user && user.ftxSubAccount) || '',
    }

    async function onSubmit(initData, actions) {
        const { buyFilledAudio, sellFilledAudio, buyNewOrderAudio, sellNewOrderAudio, ...data } = initData

        await userSettings.request({ data })
        await userDetail.request()

        actions.resetForm()
    }

    async function onSubmitVoices(otherData, resetForm) {
        const data = new FormData()

        if (voices.buyFilledAudio) data.append('buy_filled_audio', voices.buyFilledAudio)
        if (voices.sellFilledAudio) data.append('sell_filled_audio', voices.sellFilledAudio)
        if (voices.buyNewOrderAudio) data.append('buy_new_order_audio', voices.buyNewOrderAudio)
        if (voices.sellNewOrderAudio) data.append('sell_new_order_audio', voices.sellNewOrderAudio)

        data.append('new_order_audio_active', otherData.newOrderAudioActive)
        data.append('filled_audio_active', otherData.filledAudioActive)
        data.append('ftx_sub_account', user.ftxSubAccount)

        await userSettings.request({ data })
        await userDetail.request()

        resetForm()
    }

    useEffect(() => {
        if (user) localStorage.setItem('user', JSON.stringify(user))
    }, [user])

    return (
        <div>
            <Tabs style={{ marginLeft: '1.1rem' }} />

            <div style={{ padding: '1.1rem' }}>
                {user && (
                    <Formik onSubmit={onSubmit} enableReinitialize initialValues={initialValues}>
                        {({ values, resetForm }) => (
                            <Form>
                                <div className="columns is-multiline">
                                    <div className="column is-flex is-fullwidth is-3by1">
                                        <Card className="pb-5 column">
                                            <p className="is-size-4">Huobi</p>

                                            <InputOld
                                                className="input_main has-text-white"
                                                name="huobiApiKey"
                                                label={`Api key${user.huobiApiKey ? ' (Already exists)' : ''}`} />

                                            <InputOld
                                                className="input_main has-text-white"
                                                name="huobiSecretKey"
                                                label={`Secret key${user.huobiSecretKey ? ' (Already exists)' : ''}`} />

                                            <Button isLoading={userSettings.loading} type="submit" color="success"
                                                text="Save" style={{ width: '10rem' }} />
                                        </Card>
                                    </div>

                                    <div className="column is-flex is-fullwidth is-3by1">
                                        <Card className="pb-5 column">
                                            <p className="is-size-4">FTX</p>

                                            <InputOld
                                                className="input_main has-text-white"
                                                name="ftxApiKey"
                                                label={`Api key${user.ftxApiKey ? ' (Already exists)' : ''}`} />

                                            <InputOld
                                                className="input_main has-text-white"
                                                name="ftxSecretKey"
                                                label={`Secret key${user.ftxSecretKey ? ' (Already exists)' : ''}`} />

                                            <InputOld
                                                className="input_main has-text-white"
                                                name="ftxSubAccount"
                                                label="Sub account" />

                                            <Button isLoading={userSettings.loading} type="submit" color="success"
                                                text="Save" style={{ width: '10rem' }} />
                                        </Card>
                                    </div>

                                    <div className="column is-flex is-fullwidth is-3by1">
                                        <Card className="pb-5 column">
                                            <p className="is-size-4 mb-1">Sound settings</p>

                                            <p className="is-size-5">Sound when Order Filled</p>

                                            <div className="columns">
                                                <div className="column">
                                                    <p>Buy</p>

                                                    <InputOld accept=".mp3,audio/*"
                                                        onChange={(event) => {
                                                            event.persist()
                                                            setVoices((oldData) => ({
                                                                ...oldData,
                                                                buyFilledAudio: event.target.files[0],
                                                            }))
                                                        }}
                                                        type="file"
                                                        name="buy_filled_audio"
                                                        className="file-field" />

                                                    {user.buyFilledAudio && (
                                                        <audio controls>
                                                            <source src={user.buyFilledAudio} type="audio/mpeg" />
                                                            Your browser does not support the audio element.
                                                        </audio>
                                                    )}
                                                </div>

                                                <div className="column">
                                                    <p>Sell</p>
                                                    <InputOld accept=".mp3,audio/*"
                                                        onChange={(event) => {
                                                            event.persist()
                                                            setVoices((oldData) => ({
                                                                ...oldData,
                                                                sellFilledAudio: event.target.files[0],
                                                            }))
                                                        }}
                                                        type="file" name="sell_filled_audio" className="file-field" />

                                                    {user.sellFilledAudio && (
                                                        <audio controls>
                                                            <source src={user.sellFilledAudio} type="audio/mpeg" />
                                                            Your browser does not support the audio element.
                                                        </audio>
                                                    )}

                                                </div>
                                            </div>

                                            <Checkbox name="filledAudioActive" label="Active ?" />
                                            <p className="is-size-5">Sound when New trade in All trades</p>

                                            <div className="columns">
                                                <div className="column">
                                                    <p>Buy</p>

                                                    <InputOld
                                                        accept=".mp3,audio/*"
                                                        onChange={(event) => {
                                                            event.persist()
                                                            setVoices((oldData) => ({
                                                                ...oldData,
                                                                buyNewOrderAudio: event.target.files[0],
                                                            }))
                                                        }}
                                                        type="file"
                                                        name="buy_new_order_audio"
                                                        className="file-field" />

                                                    {user.buyNewOrderAudio && (
                                                        <audio controls>
                                                            <source src={user.buyNewOrderAudio} type="audio/mpeg" />
                                                            Your browser does not support the audio element.
                                                        </audio>
                                                    )}
                                                </div>

                                                <div className="column">
                                                    <p>Sell</p>

                                                    <InputOld
                                                        accept=".mp3,audio/*"
                                                        onChange={(event) => {
                                                            event.persist()
                                                            setVoices((oldData) => ({
                                                                ...oldData,
                                                                sellNewOrderAudio: event.target.files[0],
                                                            }))
                                                        }}
                                                        type="file"
                                                        name="sell_new_order_audio"
                                                        className="file-field" />

                                                    {user.sellNewOrderAudio && (
                                                        <audio controls>
                                                            <source src={user.sellNewOrderAudio} type="audio/mpeg" />
                                                            Your browser does not support the audio element.
                                                        </audio>
                                                    )}
                                                </div>
                                            </div>

                                            <Checkbox name="newOrderAudioActive" label="Active ?" />

                                            <Button isLoading={userSettings.loading} onClick={() => onSubmitVoices(values, resetForm)}
                                                color="success" text="Save" style={{ width: '10rem' }} />
                                        </Card>
                                    </div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                )}
            </div>

            {userDetail.loading && <Loader center large />}
        </div>
    )
}
