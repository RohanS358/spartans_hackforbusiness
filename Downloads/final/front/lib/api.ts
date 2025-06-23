const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

class ApiClient {
  async get(endpoint: string) {
    return this.request(endpoint, { method: "GET" })
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
    return this.request("/api/business/all")
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
  async transferFunds(recipientAddress: string, amount: number, privateKey?: string, productId?: string) {
    return this.request("/api/transactions", {
      method: "POST",
      body: JSON.stringify({ 
        toAddress: recipientAddress, 
        amount, 
        encryptedPrivateKey: privateKey || 'default-private-key',
        productId: productId || undefined
      }),
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

  // Credit endpoints
  async getBusinessCredits(businessId: string) {
    return this.request(`/api/credits/business/${businessId}`)
  }

  async getUserCredits() {
    return this.request("/api/credits/user")
  }

  async issueCredits(businessId: string, amount: number, reason: string) {
    return this.request("/api/credits/issue", {
      method: "POST",
      body: JSON.stringify({ businessId, amount, reason }),
    })
  }
  async redeemCredits(businessId: string, amount: number, reason: string) {
    return this.request("/api/credits/redeem", {
      method: "POST",
      body: JSON.stringify({ businessId, amount, reason }),
    })
  }

  // Blockchain endpoints
  async getBlockchainStats() {
    return this.request("/api/blockchain/stats")
  }

  async getBlocks() {
    return this.request("/api/blockchain/blocks")
  }

  async mineBlock() {
    return this.request("/api/blockchain/mine", {
      method: "POST",
    })
  }
}

export const apiClient = new ApiClient()
