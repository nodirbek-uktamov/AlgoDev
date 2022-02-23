import { useCallback, useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { auth, signOut } from '../utils/auth'
import baseAxios from '../utils/request'
import { useMessage } from './message'


export function usePostRequest(options = {}) {
    return useRequest({ method: 'POST', ...options })
}

export function usePutRequest(options = {}) {
    return useRequest({ method: 'PUT', ...options })
}

export function useGetRequest(options = {}) {
    return useRequest({ method: 'GET', ...options })
}

export function useDeleteRequest(options = {}) {
    return useRequest({ method: 'DELETE', ...options })
}

export function useRequest(options = {}) {
    const [response, setResponse] = useState()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState({})
    const [showMessage] = useMessage()

    const history = useHistory()

    async function request(overrideOptions = {}, sync = false) {
        setLoading(true)

        try {
            const { data } = await baseAxios({ ...auth(), ...options, ...overrideOptions })
            if (!sync) setResponse(data)
            return { response: data, success: true }
        } catch (e) {
            setError(e.response || {})
            if (e.response === undefined) {
                showMessage('Проверьте интернет соединение', 'is-danger')
            } else if (e.response.status >= 500) {
                showMessage('Ошибка сервера.', 'is-danger')
            } else if (e.response.status === 401 && e.response.data.logout) {
                signOut(history)
            }

            return { error: e.response, success: false }
        } finally {
            if (!sync) setLoading(false)
        }
    }

    return { loading, request, error, response, setResponse, setError, setLoading }
}

export function useLoad(options, dependencies = []) {
    const request = useRequest({ method: 'GET', ...options })

    useEffect(() => {
        request.request()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies)

    return request
}

export function useInfiniteScroll(options, dependencies = []) {
    const [page, setPage] = useState(1)
    const items = useGetRequest({ ...options, params: { ...options.params, page } })
    const [hasMore, setHasMore] = useState(false)
    const observer = useRef()


    useEffect(() => {
        loadItems()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, ...dependencies])

    async function loadItems() {
        const { response } = await items.request()
        const oldItems = items.response ? items.response.results : []
        const newItems = response ? response.results : []

        if (!response) return

        items.setResponse({ count: response ? response.count : 0, results: [...oldItems, ...newItems] })
        setHasMore(oldItems.length + newItems.length !== response.count)
    }

    async function reload() {
        items.setResponse({ count: 0, results: [] })
        setPage(1)
        await items.request({ params: { ...options.params, page: 1 } })
    }

    const ref = useCallback((node) => {
        if (items.loading) return
        if (observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(page + 1)
            }
        })
        if (node) observer.current.observe(node)
    }, [hasMore, items.loading, page])

    return {
        ref, ...items, hasMore, reload,
    }
}
