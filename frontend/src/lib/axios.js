import axios from 'axios'

const api = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
    withCredentials: true
})

// Endpoints that are allowed to answer 401 without kicking the user out:
// a failed login attempt, and the session probe on first load.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/google', '/auth/me']

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? ''
    const isAuthCall = AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint))

    if (error.response?.status === 401 && !isAuthCall) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api;
