import axios, {AxiosRequestTransformer, AxiosResponseTransformer} from 'axios'
import merge from 'deepmerge'

interface IHttpAdapterOptions {
    baseURL?: string;
    headers?: Record<string, any>;
    params?: Record<string, any>;
    transformRequest?: AxiosRequestTransformer | AxiosRequestTransformer[];
    transformResponse?: AxiosResponseTransformer | AxiosResponseTransformer[];
}

export class HttpAdapter {
    private readonly options: IHttpAdapterOptions

    constructor(options: IHttpAdapterOptions = {}) {
        this.options = options
    }

    get(url: string, options: IHttpAdapterOptions = {}) {
        const httpOptions = merge(this.options, options)

        return axios.get(url, httpOptions)
    }

    post(url: string, data: any, options: IHttpAdapterOptions = {}) {
        const httpOptions = merge(this.options, options)

        return axios.post(url, data, httpOptions)
    }

    put(url: string, data: any, options: IHttpAdapterOptions = {}) {
        const httpOptions = merge(this.options, options)

        return axios.put(url, data, httpOptions)
    }

    delete(url: string, options: IHttpAdapterOptions = {}) {
        const httpOptions = merge(this.options, options)

        return axios.delete(url, httpOptions)
    }
}