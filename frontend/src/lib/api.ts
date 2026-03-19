const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders as Record<string, string>,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    ...rest,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Bir hata oluştu" }));
    throw new Error(error.detail || error.error || "API Hatası");
  }

  return res.json();
}

export const api = {
  // Auth
  register: (data: Record<string, string>) =>
    fetchAPI("/auth/register/", { method: "POST", body: JSON.stringify(data) }),
  login: (email: string, password: string) =>
    fetchAPI<{ access: string; refresh: string }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  refreshToken: (refresh: string) =>
    fetchAPI<{ access: string }>("/auth/token/refresh/", {
      method: "POST",
      body: JSON.stringify({ refresh }),
    }),
  getProfile: (token: string) =>
    fetchAPI("/auth/profile/", { token }),
  updateProfile: (token: string, data: Record<string, string>) =>
    fetchAPI("/auth/profile/", { method: "PATCH", token, body: JSON.stringify(data) }),

  // Products
  getProducts: (params?: string) =>
    fetchAPI(`/products/${params ? `?${params}` : ""}`),
  getProduct: (slug: string) =>
    fetchAPI(`/products/${slug}/`),
  getFeaturedProducts: () =>
    fetchAPI("/products/featured/"),
  getCategories: () =>
    fetchAPI("/products/categories/"),

  // Cart
  getCart: (token: string) =>
    fetchAPI("/orders/cart/", { token }),
  addToCart: (token: string, productId: string, quantity: number = 1) =>
    fetchAPI("/orders/cart/", {
      method: "POST",
      token,
      body: JSON.stringify({ product_id: productId, quantity }),
    }),
  updateCartItem: (token: string, itemId: string, quantity: number) =>
    fetchAPI("/orders/cart/", {
      method: "PATCH",
      token,
      body: JSON.stringify({ item_id: itemId, quantity }),
    }),
  clearCart: (token: string) =>
    fetchAPI("/orders/cart/", { method: "DELETE", token }),

  // Orders
  checkout: (token: string, data: Record<string, string>) =>
    fetchAPI("/orders/checkout/", { method: "POST", token, body: JSON.stringify(data) }),
  getOrders: (token: string) =>
    fetchAPI("/orders/orders/", { token }),
  getOrder: (token: string, id: string) =>
    fetchAPI(`/orders/orders/${id}/`, { token }),

  // Payments
  createPayment: (token: string, orderId: string, provider: string) =>
    fetchAPI("/payments/create/", {
      method: "POST",
      token,
      body: JSON.stringify({ order_id: orderId, provider }),
    }),

  // Content
  getArticles: (params?: string) =>
    fetchAPI(`/content/articles/${params ? `?${params}` : ""}`),
  getArticle: (slug: string) =>
    fetchAPI(`/content/articles/${slug}/`),
  getVideos: (params?: string) =>
    fetchAPI(`/content/videos/${params ? `?${params}` : ""}`),
  getSocialLinks: () =>
    fetchAPI("/content/social/"),

  // Assessment
  assessADHD: (data: { age: string; gender: string; answers: Record<string, unknown> }) =>
    fetchAPI<{
      adhd_probability: number;
      adhd_risk: "low" | "moderate" | "high";
      model: string;
      threshold: number;
      subscores: Record<string, number>;
    }>("/assessment/assess/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
