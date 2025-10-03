const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ReturnItemPayload {
  productId: string;
  quantity: number;
}
export interface CreateReturnPayload {
  saleId: string;
  reason: string;
  items: ReturnItemPayload[];
}

// A helper to get the auth headers
function getAuthHeaders() {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  try {
    const storedUser = localStorage.getItem('pos-user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user?.id) {
        headers['x-user-id'] = user.id;
      }
    }
  } catch (e) {
    console.error("Could not parse user from localStorage", e);
  }
  return headers;
}

// A generic request handler
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'An API error occurred');
  }
  return data;
}


export const api = {
  login: async (credentials: LoginCredentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getMe: async () => {
    return apiRequest('/auth/me');
  },
  
  getSales: async () => {
    return apiRequest('/sales');
  },

  getSaleById: async (saleId: string) => {
    return apiRequest(`/sales/${saleId}`);
  },

  createReturn: async (payload: CreateReturnPayload) => {
    return apiRequest('/returns', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};
