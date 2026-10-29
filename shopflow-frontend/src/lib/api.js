// URL de notre backend Spring Boot
const API_URL = "http://localhost:9095";

// Fonction principale pour appeler l'API
async function fetchAPI(endpoint, options = {}) {

  // Récupérer le token JWT stocké
  const token = localStorage.getItem("accessToken");

  // Préparer les headers
  const headers = {
    "Content-Type": "application/json",
    // Injecter le token dans chaque requête (section 4.3)
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Si token expiré → déconnecter
  if (response.status === 401) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
    return;
  }

  return response.json();
}

// Auth
export const authAPI = {
  register: (data) => fetchAPI("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  login: (data) => fetchAPI("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  },
};

// Produits
export const productsAPI = {
  getAll: () => fetchAPI("/api/products"),
  getById: (id) => fetchAPI(`/api/products/${id}`),
  search: (q) => fetchAPI(`/api/products/search?q=${q}`),
  create: (data) => fetchAPI("/api/products", {
    method: "POST",
    body: JSON.stringify(data),
  }),
};

// Panier
export const cartAPI = {
  getCart: () => fetchAPI("/api/cart"),
  addItem: (data) => fetchAPI("/api/cart/items", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  removeItem: (itemId) => fetchAPI(`/api/cart/items/${itemId}`, {
    method: "DELETE",
  }),
  applyCoupon: (code) => fetchAPI("/api/cart/coupon", {
    method: "POST",
    body: JSON.stringify({ code }),
  }),
};

// Commandes
export const ordersAPI = {
  create: (data) => fetchAPI("/api/orders", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  getMyOrders: () => fetchAPI("/api/orders/my"),
  getById: (id) => fetchAPI(`/api/orders/${id}`),
};

// Avis
export const reviewsAPI = {
  getByProduct: (productId) => fetchAPI(`/api/reviews/product/${productId}`),
  create: (data) => fetchAPI("/api/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  }),
};