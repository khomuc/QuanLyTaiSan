const API_BASE_URL = 'http://localhost:3000/api';

function getToken() {
    return (
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token') ||
        localStorage.getItem('auth_token') ||
        ''
    );
}

async function request<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const token = getToken();

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
        throw new Error(
            data?.message || data?.error || 'Có lỗi xảy ra khi gọi API',
        );
    }

    return data as T;
}

export const assetsApi = {
    findOne(maTaiSan: string) {
        return request<any>(`/assets/${maTaiSan}`);
    },

    findAll(query?: Record<string, any>) {
        const params = new URLSearchParams();

        Object.entries(query || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
            }
        });

        const queryString = params.toString();

        return request<any[]>(
            queryString ? `/assets?${queryString}` : '/assets',
        );
    },

    listCategories() {
        return request<any[]>('/assets/meta/categories');
    },
};
