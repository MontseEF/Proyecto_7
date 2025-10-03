import axios from 'axios';

// Base API service
class ApiService {
  constructor(baseURL = '/api') {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || `http://localhost:3000${baseURL}`,
    });
  }

  // Generic GET request
  async get(endpoint, params = {}) {
    const response = await this.api.get(endpoint, { params });
    return response.data;
  }

  // Generic POST request
  async post(endpoint, data = {}) {
    const response = await this.api.post(endpoint, data);
    return response.data;
  }

  // Generic PUT request
  async put(endpoint, data = {}) {
    const response = await this.api.put(endpoint, data);
    return response.data;
  }

  // Generic DELETE request
  async delete(endpoint) {
    const response = await this.api.delete(endpoint);
    return response.data;
  }

  // Upload file
  async upload(endpoint, formData) {
    const response = await this.api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

// Products service
export const productsService = {
  ...new ApiService(),
  
  async getProducts(params = {}) {
    return this.get('/products', params);
  },

  async getProduct(id) {
    return this.get(`/products/${id}`);
  },

  async createProduct(productData) {
    return this.post('/products', productData);
  },

  async updateProduct(id, productData) {
    return this.put(`/products/${id}`, productData);
  },

  async deleteProduct(id) {
    return this.delete(`/products/${id}`);
  },

  async getLowStockProducts() {
    return this.get('/products/reports/low-stock');
  },

  async uploadProductImage(id, formData) {
    return this.upload(`/products/${id}/images`, formData);
  },
};

// Categories service
export const categoriesService = {
  ...new ApiService(),
  
  async getCategories(params = {}) {
    return this.get('/categories', params);
  },

  async getCategory(id) {
    return this.get(`/categories/${id}`);
  },

  async createCategory(categoryData) {
    return this.post('/categories', categoryData);
  },

  async updateCategory(id, categoryData) {
    return this.put(`/categories/${id}`, categoryData);
  },

  async deleteCategory(id) {
    return this.delete(`/categories/${id}`);
  },

  async getCategoryTree() {
    return this.get('/categories/structure/tree');
  },
};

// Customers service
export const customersService = {
  ...new ApiService(),
  
  async getCustomers(params = {}) {
    return this.get('/customers', params);
  },

  async getCustomer(id) {
    return this.get(`/customers/${id}`);
  },

  async createCustomer(customerData) {
    return this.post('/customers', customerData);
  },

  async updateCustomer(id, customerData) {
    return this.put(`/customers/${id}`, customerData);
  },

  async deleteCustomer(id) {
    return this.delete(`/customers/${id}`);
  },

  async searchCustomers(query) {
    return this.get('/customers/search/quick', { q: query });
  },

  async updateCustomerCredit(id, creditData) {
    return this.put(`/customers/${id}/credit`, creditData);
  },
};

// Suppliers service
export const suppliersService = {
  ...new ApiService(),
  
  async getSuppliers(params = {}) {
    return this.get('/suppliers', params);
  },

  async getSupplier(id) {
    return this.get(`/suppliers/${id}`);
  },

  async createSupplier(supplierData) {
    return this.post('/suppliers', supplierData);
  },

  async updateSupplier(id, supplierData) {
    return this.put(`/suppliers/${id}`, supplierData);
  },

  async deleteSupplier(id) {
    return this.delete(`/suppliers/${id}`);
  },

  async searchSuppliers(query) {
    return this.get('/suppliers/search/quick', { q: query });
  },

  async updateSupplierRating(id, rating) {
    return this.put(`/suppliers/${id}/rating`, { rating });
  },

  async getSupplierProducts(id, params = {}) {
    return this.get(`/suppliers/${id}/products`, params);
  },
};

// Sales service
export const salesService = {
  ...new ApiService(),
  
  async getSales(params = {}) {
    return this.get('/sales', params);
  },

  async getSale(id) {
    return this.get(`/sales/${id}`);
  },

  async createSale(saleData) {
    return this.post('/sales', saleData);
  },

  async cancelSale(id) {
    return this.put(`/sales/${id}/cancel`);
  },

  async refundSale(id, refundData) {
    return this.post(`/sales/${id}/refund`, refundData);
  },

  async getDailyReport(date) {
    return this.get('/sales/reports/daily', { date });
  },
};

// Inventory service
export const inventoryService = {
  ...new ApiService(),
  
  async getInventory(params = {}) {
    return this.get('/inventory', params);
  },

  async getInventoryMovements(params = {}) {
    return this.get('/inventory/movements', params);
  },

  async adjustInventory(adjustments, reason) {
    return this.post('/inventory/adjust', { adjustments, reason });
  },

  async transferInventory(transferData) {
    return this.post('/inventory/transfer', transferData);
  },

  async getLowStockProducts() {
    return this.get('/inventory/low-stock');
  },

  async getOutOfStockProducts() {
    return this.get('/inventory/out-of-stock');
  },

  async getInventoryValuation() {
    return this.get('/inventory/valuation');
  },

  async getProductHistory(productId, params = {}) {
    return this.get(`/inventory/${productId}/history`, params);
  },
};

// Reports service
export const reportsService = {
  ...new ApiService(),
  
  async getDashboard() {
    return this.get('/reports/dashboard');
  },

  async getSalesReport(params = {}) {
    return this.get('/reports/sales', params);
  },

  async getProductsReport(params = {}) {
    return this.get('/reports/products', params);
  },

  async getCustomersReport(params = {}) {
    return this.get('/reports/customers', params);
  },

  async getInventoryMovementsReport(params = {}) {
    return this.get('/reports/inventory/movements', params);
  },

  async getFinancialReport(params = {}) {
    return this.get('/reports/financial', params);
  },
};

export default {
  products: productsService,
  categories: categoriesService,
  customers: customersService,
  suppliers: suppliersService,
  sales: salesService,
  inventory: inventoryService,
  reports: reportsService,
};