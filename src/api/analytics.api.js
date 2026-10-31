import api from "./axios";

export const getAnalyticsData = async () => api.get("/jornal/all");
