import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL


const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // pour utiliser les cookies d'auth
  headers: {
    'Content-Type': 'application/json',
  },
})

// Variable pour éviter les appels multiples de refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

// Interceptor pour attacher le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si un refresh est déjà en cours, mettre la requête en file d'attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch((err) => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Appeler l'endpoint de refresh token
        const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {}, {
          withCredentials: true
        })
        
        const { accessToken } = response.data
        
        if (accessToken) {
          // Mettre à jour le token dans localStorage
          localStorage.setItem('accessToken', accessToken)
          
          // Traiter la file d'attente avec le nouveau token
          processQueue(null, accessToken)
          
          // Retry la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Si le refresh échoue, déconnecter l'utilisateur
        processQueue(refreshError, null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('userEmail')
        localStorage.removeItem('userRole')
        
        // Afficher un message à l'utilisateur
        if (typeof window !== 'undefined') {
          // Utiliser un événement personnalisé pour notifier l'expiration de session
          window.dispatchEvent(new CustomEvent('sessionExpired', { 
            detail: { message: 'Your session has expired. Please login again.' }
          }))
          
          // Rediriger vers la page de connexion après un court délai
          setTimeout(() => {
            window.location.href = '/signin'
          }, 1000)
        }
        
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
