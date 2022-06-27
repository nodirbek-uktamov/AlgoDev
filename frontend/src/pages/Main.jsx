import React from 'react'
import Tabs from "../components/Tabs";
import {Form, Formik} from "formik";
import {Card} from "../components/common/Card";
import {Button} from "../components/common/Button";
import {useLoad, usePostRequest, usePutRequest} from "../hooks/request";
import InputOld from "../components/common/InputOld";
import {USER_DETAIL, USER_SETTINGS} from "../urls";
import Loader from "../components/common/Loader";

export default function Main() {
    const userDetail = useLoad({url: USER_DETAIL})
    const userSettings = usePutRequest({url: USER_SETTINGS})
    const user = userDetail.response

    const initialValues = {
        huobiApiKey: '',
        huobiSecretKey: '',
        ftxApiKey: '',
        ftxSecretKey: '',
        ftxSubAccount: (user && user.ftxSubAccount) || '',
    }

    function onSubmit(data, actions) {
        userSettings.request({data})
        actions.resetForm()
        userDetail.request()
    }

    return (
        <div>
            <Tabs style={{marginLeft: '1.1rem'}}/>

            <div style={{padding: '1.1rem'}}>
                {user && (
                    <Formik onSubmit={onSubmit} enableReinitialize initialValues={initialValues}>
                        <Form>
                            <div className="columns is-multiline">
                                <div className="column  is-half">
                                    <Card className="pb-5">
                                        <p className="is-size-4">Huobi</p>

                                        <InputOld
                                            className="input_main has-text-white"
                                            name="huobiApiKey"
                                            label={`Api key` + (user.huobiApiKey ? " (Already exists)" : '')}/>

                                        <InputOld
                                            className="input_main has-text-white"
                                            name="huobiSecretKey"
                                            label={`Secret key` + (user.huobiSecretKey ? " (Already exists)" : '')}/>
                                    </Card>
                                </div>

                                <div className="column is-half">
                                    <Card className="pb-5 column">
                                        <p className="is-size-4">FTX</p>

                                        <InputOld
                                            className="input_main has-text-white"
                                            name="ftxApiKey"
                                            label={`Api key` + (user.ftxApiKey ? " (Already exists)" : '')}/>

                                        <InputOld
                                            className="input_main has-text-white"
                                            name="ftxSecretKey"
                                            label={`Secret key` + (user.ftxSecretKey ? " (Already exists)" : '')}/>

                                        <InputOld
                                            className="input_main has-text-white"
                                            name="ftxSubAccount"
                                            label="Sub account" />
                                    </Card>
                                </div>

                                <div className="column"/>

                                <div className="column is-narrow">
                                    <Button isLoading={userSettings.loading} type="submit" color="success" text="Save" style={{width: '10rem'}}/>
                                </div>
                            </div>
                        </Form>
                    </Formik>
                )}
            </div>

            {userDetail.loading && <Loader center large/>}
        </div>
    )
}
