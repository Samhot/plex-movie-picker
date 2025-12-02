import { Axios } from 'axios';

interface Response<T> {
  status: number;
  data: T;
}

interface RequestParams {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  data?: unknown;
}

export class HttpClient {
  constructor(private readonly axiosService: Axios) {
    this.axiosService.defaults = {
      headers: {
        get: {},
        post: {},
        common: {},
        delete: {},
        put: {},
        patch: {},
        head: {},
      },
    };
  }

  /**
   * Parse response data if it's a JSON string
   */
  private parseResponseData<T>(data: unknown): T {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data) as T;
      } catch {
        return data as T;
      }
    }
    return data as T;
  }

  async get<T>(url: string, params?: RequestParams): Promise<Response<T>> {
    const response = await this.axiosService.get<T>(url, {
      headers: {
        ...params?.headers,
      },
    });

    return {
      status: response.status,
      data: this.parseResponseData<T>(response.data),
    };
  }

  async post<T>(url: string, params?: RequestParams): Promise<Response<T>> {
    const response = await this.axiosService.post<T>(url, params?.data, {
      headers: {
        ...params?.headers,
      },
      params: {
        ...params?.params,
      },
    });

    return {
      status: response.status,
      data: this.parseResponseData<T>(response.data),
    };
  }

  async patch<T>(url: string, params?: RequestParams): Promise<Response<T>> {
    const response = await this.axiosService.patch<T>(url, params?.data, {
      headers: {
        ...params?.headers,
      },
      params: {
        ...params?.params,
      },
    });

    return {
      status: response.status,
      data: this.parseResponseData<T>(response.data),
    };
  }
}
