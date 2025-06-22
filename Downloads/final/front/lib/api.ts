const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

class ApiClient {
  get(arg0: string): { data: any } | PromiseLike<{ data: any }> {
    throw new Error("Method not implemented.")
  }
  private getAuthHeaders() {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Network error" }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: any) {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  // Business endpoints
  async getBusinesses() {
    return this.request("/api/business")
  }

  async createBusiness(businessData: any) {
    return this.request("/api/business", {
      method: "POST",
      body: JSON.stringify(businessData),
    })
  }

  async updateBusiness(id: string, businessData: any) {
    return this.request(`/api/business/${id}`, {
      method: "PUT",
      body: JSON.stringify(businessData),
    })
  }

  // Wallet endpoints
  async getWallet() {
    return this.request("/api/wallet")
  }

  async createWallet(privateKey?: string) {
    return this.request("/api/wallet", {
      method: "POST",
      body: JSON.stringify({
        privateKey: privateKey || crypto.randomUUID(),
      }),
    })
  }

  async transferFunds(recipientAddress: string, amount: number, p0: string | undefined) {
    return this.request("/api/wallet/transfer", {
      method: "POST",
      body: JSON.stringify({ recipientAddress, amount }),
    })
  }

  // Product endpoints
  async getProducts() {
    return this.request("/api/products")
  }

  async createProduct(productData: any) {
    return this.request("/api/products", {
      method: "POST",
      body: JSON.stringify(productData),
    })
  }

  async updateProduct(id: string, productData: any) {
    return this.request(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    })
  }

  async deleteProduct(id: string) {
    return this.request(`/api/products/${id}`, {
      method: "DELETE",
    })
  }

  // Transaction endpoints
  async getTransactions() {
    return this.request("/api/transactions")
  }

  async createTransaction(transactionData: any) {
    return this.request("/api/transactions", {
      method: "POST",
      body: JSON.stringify(transactionData),
    })
  }
}

export const apiClient = new ApiClient()
