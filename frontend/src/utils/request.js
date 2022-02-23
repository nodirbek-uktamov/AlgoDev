import axios from 'axios'
import humps from 'humps'
import { domain } from '../urls'

//  Add Base URL and change snake_case to camelCase
const baseAxios = axios.create({
    baseURL: `${domain}/api/v1/`,
    transformResponse: [
        ...axios.defaults.transformResponse,
        humps.camelizeKeys,
    ],
    transformRequest: [
        decamelize,
        ...axios.defaults.transformRequest,
    ],
})

baseAxios.interceptors.request.use((config) => ({
    ...config,
    params: humps.decamelizeKeys(config.params),
}))

export default baseAxios

// eslint-disable-next-line consistent-return
function decamelize(object) {
    if (!(object && !(object instanceof File))) return object

    if (object instanceof FormData) {
        const formData = new FormData()
        // eslint-disable-next-line no-restricted-syntax
        for (const [key, value] of object.entries()) {
            formData.append(humps.decamelize(key), value)
        }
        return formData
    }

    if (typeof object === 'object') {
        return humps.decamelizeKeys(object)
    }
}
