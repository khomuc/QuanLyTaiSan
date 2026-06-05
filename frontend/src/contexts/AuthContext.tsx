import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    type ReactNode,
} from 'react';
import { api, clearStoredToken, getStoredToken } from '../lib/apis/api';
import * as demo from '../lib/mockData';
import type { ApiMode, AuthUser } from '../lib/types';

type AuthState = {
    token: string | null;
    user: AuthUser | null;
    loading: boolean;
    apiMode: ApiMode;
    initialized: boolean;
};

type LoginPayload = {
    token: string;
    user: AuthUser;
};

type AuthAction =
    | { type: 'AUTH_LOADING' }
    | {
        type: 'AUTH_SUCCESS';
        payload: {
            token: string;
            user: AuthUser;
            apiMode: ApiMode;
        };
    }
    | { type: 'AUTH_FAILED' }
    | { type: 'LOGOUT' };

type AuthContextValue = AuthState & {
    loginSuccess: (payload: LoginPayload) => void;
    logout: () => void;
    hasPermission: (permission: string) => boolean;
    reloadProfile: () => Promise<void>;
};

const initialToken = getStoredToken();

const initialState: AuthState = {
    token: initialToken,
    user: null,
    loading: Boolean(initialToken),
    apiMode: 'api',
    initialized: !initialToken,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'AUTH_LOADING':
            return {
                ...state,
                loading: true,
            };

        case 'AUTH_SUCCESS':
            return {
                token: action.payload.token,
                user: action.payload.user,
                apiMode: action.payload.apiMode,
                loading: false,
                initialized: true,
            };

        case 'AUTH_FAILED':
            return {
                token: null,
                user: null,
                apiMode: 'api',
                loading: false,
                initialized: true,
            };

        case 'LOGOUT':
            return {
                token: null,
                user: null,
                apiMode: 'api',
                loading: false,
                initialized: true,
            };

        default:
            return state;
    }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        if (!state.token) return;

        if (state.token === 'demo-token') {
            dispatch({
                type: 'AUTH_SUCCESS',
                payload: {
                    token: 'demo-token',
                    user: demo.demoUser,
                    apiMode: 'demo',
                },
            });
            return;
        }

        if (state.token === 'guest-token') {
            dispatch({
                type: 'AUTH_SUCCESS',
                payload: {
                    token: 'guest-token',
                    user: demo.guestUser,
                    apiMode: 'demo',
                },
            });
            return;
        }

        dispatch({ type: 'AUTH_LOADING' });

        api
            .me()
            .then((profile) => {
                dispatch({
                    type: 'AUTH_SUCCESS',
                    payload: {
                        token: state.token as string,
                        user: profile,
                        apiMode: 'api',
                    },
                });
            })
            .catch(() => {
                clearStoredToken();
                dispatch({ type: 'AUTH_FAILED' });
            });
    }, [state.token]);

    const loginSuccess = ({ token, user }: LoginPayload) => {
        dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
                token,
                user,
                apiMode:
                    token === 'demo-token' || token === 'guest-token'
                        ? 'demo'
                        : 'api',
            },
        });
    };

    const logout = () => {
        clearStoredToken();
        dispatch({ type: 'LOGOUT' });
    };

    const reloadProfile = async () => {
        if (!state.token || state.token === 'demo-token') return;

        dispatch({ type: 'AUTH_LOADING' });

        try {
            const profile = await api.me();

            dispatch({
                type: 'AUTH_SUCCESS',
                payload: {
                    token: state.token,
                    user: profile,
                    apiMode: 'api',
                },
            });
        } catch {
            clearStoredToken();
            dispatch({ type: 'AUTH_FAILED' });
        }
    };

    const hasPermission = (permission: string) => {
        return Boolean(state.user?.permissions?.includes(permission));
    };

    const value = useMemo<AuthContextValue>(
        () => ({
            ...state,
            loginSuccess,
            logout,
            hasPermission,
            reloadProfile,
        }),
        [state],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }

    return context;
}
