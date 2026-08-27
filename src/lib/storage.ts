const TOKEN_KEY = 'mfg_access_token'

export const tokenStorage = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      // In case of quota errors or restricted storage
    }
  },
  remove: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      // Ignore
    }
  },
}
