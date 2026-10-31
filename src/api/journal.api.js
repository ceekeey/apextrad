import api from "./axios";

export const getJournals = async () => {
  const response = await api.get("/jornal/all");
  return response.data;
};

export const getJournalById = async (id) => {
  const response = await api.get(`/jornal/jornal/${id}`);
  return response.data;
};

export const createJournal = async (payload) => {
  const response = await api.post("/jornal/create", payload, {
    headers:
      payload instanceof FormData ? {} : { "Content-Type": "application/json" },
  });
  return response.data;
};

export const updateJournal = async (id, payload) => {
  const response = await api.put(`/jornal/update/${id}`, payload, {
    headers:
      payload instanceof FormData ? {} : { "Content-Type": "application/json" },
  });
  return response.data;
};

export const deleteJournal = async (id) => {
  const response = await api.delete(`/jornal/delete/${id}`);
  return response.data;
};
