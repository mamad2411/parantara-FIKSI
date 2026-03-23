// API Client with error handling and type safety

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any,
    public retryAfter?: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json()
  
  if (!response.ok) {
    // Handle rate limit specifically
    if (response.status === 429) {
      const retryAfter = data.retryAfter || 30
      throw new ApiError(
        data.message || 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.',
        response.status,
        data,
        retryAfter
      )
    }
    
    throw new ApiError(
      data.message || 'An error occurred',
      response.status,
      data
    )
  }
  
  return data
}

// Auth API
export const authApi = {
  // Register Step 1 - Send OTP
  registerStep1: async (payload: { name: string; email: string; phone: string }) => {
    const response = await fetch(`${API_URL}/api/auth/register/step1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    return handleResponse(response)
  },

  // Register Step 2 - Verify OTP
  verifyOTP: async (payload: { email: string; otp: string }) => {
    const response = await fetch(`${API_URL}/api/auth/register/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    return handleResponse(response)
  },

  // Forgot Password - Send OTP
  forgotPassword: async (payload: { email: string }) => {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    return handleResponse(response)
  },

  // Verify Reset OTP
  verifyResetOTP: async (payload: { email: string; otp: string }) => {
    const response = await fetch(`${API_URL}/api/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    return handleResponse(response)
  },

  // Reset Password
  resetPassword: async (payload: { email: string; otp: string; password: string }) => {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    return handleResponse(response)
  }
}

// Subscribe API
export const subscribeApi = {
  subscribe: async (payload: { email: string }) => {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    return handleResponse(response)
  }
}

// Masjid API
export const masjidApi = {
  register: async (formData: FormData) => {
    const response = await fetch(`${API_URL}/api/masjid/register`, {
      method: 'POST',
      body: formData
    })
    return handleResponse(response)
  }
}

export { ApiError }
