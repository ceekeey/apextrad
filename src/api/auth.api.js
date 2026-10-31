import api from "./axios";

const normalizeResponse = (payload) => {
  const data = payload?.data ?? payload;
  return {
    token:
      payload?.token ??
      data?.token ??
      payload?.accessToken ??
      data?.accessToken ??
      null,
    user: payload?.user ?? data?.user ?? data ?? null,
  };
};

export const login = async ({ email, password }) => {
  const response = await api.post("/auth/login", { email, password });
  const normalized = normalizeResponse(response.data);
  return { ...response.data, ...normalized };
};

export const register = async ({ name, email, password }) => {
  const response = await api.post("/auth/register", { name, email, password });
  const normalized = normalizeResponse(response.data);
  return { ...response.data, ...normalized };
};

export const getProfile = async () => api.get("/user/profile");
export const updateProfile = async (formData) =>
  api.put("/user/profile", formData);
