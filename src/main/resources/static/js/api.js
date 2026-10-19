"use strict";

window.ExpenseApi = {
  accessToken: sessionStorage.getItem("accessToken"),

  async request(path, options = {}) {
    const headers = { ...options.headers };

    if (options.body) {
      headers["Content-Type"] = "application/json";
    }

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(path, { ...options, headers });

    if (response.status === 204) return null;

    const text = await response.text();
    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const error = new Error(
        data?.detail ||
          data?.message ||
          data?.error ||
          `Request failed: HTTP ${response.status}`,
      );

      error.status = response.status;

      if (response.status === 401) {
        this.logout();
      }

      throw error;
    }

    return data;
  },

  async register(user) {
    return this.request("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(user),
    });
  },

  async login(credentials) {
    const result = await this.request("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    this.accessToken = result.accessToken;
    sessionStorage.setItem("accessToken", result.accessToken);
    return result;
  },

  logout() {
    this.accessToken = null;
    sessionStorage.removeItem("accessToken");
  },

  getTransactions() {
    return this.request("/api/v1/transactions");
  },

  createTransaction(transaction) {
    return this.request("/api/v1/transactions", {
      method: "POST",
      body: JSON.stringify(transaction),
    });
  },

  updateTransaction(id, transaction) {
    return this.request(`/api/v1/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(transaction),
    });
  },

  deleteTransaction(id) {
    return this.request(`/api/v1/transactions/${id}`, {
      method: "DELETE",
    });
  },
};
