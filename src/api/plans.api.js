import api from "./axios";

export const getPlans = async () => {
  const response = await api.get("/plans/allplans");
  return response.data;
};

export const getPlanById = async (id) => {
  const response = await api.get(`/plans/plan/${id}`);
  return response.data;
};

export const createPlan = async (payload) => {
  const response = await api.post("/plans/create", payload);
  return response.data;
};

export const deletePlan = async (id) => {
  const response = await api.delete(`/plans/delete/${id}`);
  return response.data;
};
