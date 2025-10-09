import axios from "axios";

//Configuración base de Axios

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para incluir el token en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


//AUTH SERVICE

export const authService = {
  login: async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }
    return data;
  },

  register: async (userData) => {
    const { data } = await api.post("/auth/register", userData);
    return data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },
};


// PRODUCTS SERVICE

export const productsService = {
  getAll: async () => {
    const { data } = await api.get("/products");
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  create: async (newProduct) => {
    const { data } = await api.post("/products", newProduct);
    return data;
  },

  update: async (id, product) => {
    const { data } = await api.put(`/products/${id}`, product);
    return data;
  },

  remove: async (id) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },
};

//REPORTS SERVICE

export const reportsService = {
  getDashboard: async () => {
    const { data } = await api.get("/reports/dashboard");
    return data;
  },
};
