const API_BASE = '/api';

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('shieldpay_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private getMultipartHeaders(): HeadersInit {
    const token = localStorage.getItem('shieldpay_token');
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async get(endpoint: string) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async postFormData(endpoint: string, formData: FormData) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: this.getMultipartHeaders(),
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async patch(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
}

export const apiClient = new ApiClient();
