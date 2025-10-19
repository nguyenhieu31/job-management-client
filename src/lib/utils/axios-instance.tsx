import { LogoutAction } from '@/store/slice/authentication/Authentication';
import axios from 'axios';
import Cookies from 'js-cookie';

export const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8086/api/v1';

export const axiosInstance = axios.create({
    baseURL: baseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

let refreshTokePromise: Promise<any> | null = null;
let isRefreshingToken = false;
let storeRef: any = null;

export const injectStore = (_store: any) => {
  storeRef = _store;
};

const callRefreshToken = async (): Promise<void> => {
    if (!isRefreshingToken) {
        // store.dispatch(updateStateLoading(true));
        isRefreshingToken = true;
        await axiosInstance.get('/authenticate/refresh-token');
        isRefreshingToken = false;
        // store.dispatch(updateStateLoading(false));
    }
};

axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = Cookies.get("accessToken");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        } else {
            config.headers.Authorization = null;
        }
        return config;
    },
    (error) => {
        console.log(error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!isRefreshingToken) {
                refreshTokePromise = callRefreshToken();
            }

            try {
                await refreshTokePromise;
                refreshTokePromise = null;

                return axiosInstance(originalRequest);
            } catch (err) {
                refreshTokePromise = null;
                return Promise.reject(err);
            }
        }

        if (error.response.status === 401) {
            const accessToken = Cookies.get("accessToken");
            if (accessToken) {
                // call logout function or handle accordingly
                storeRef.dispatch(LogoutAction());
                error.response.message = 'Vui lòng đăng nhập lại';
            }
            error.response.message = "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại";
            return Promise.reject(error.response);
        }

        if (error.response) {
            return Promise.reject(error.response);
        }
        if (error.request) {
            return Promise.reject(error.request);
        }
        return Promise.reject(error.message);
    }
);
