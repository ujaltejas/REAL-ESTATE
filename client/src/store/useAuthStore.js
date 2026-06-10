import { create } from "zustand";
import axiosInstance from "../utils/axios";

const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  register: async (data) => {
    try {
      const response = await axiosInstance.post("/auth/register", data);
      set({ user: response.data.user });
    } catch (error) {
      console.log(error);
    }
  },

  login: async (data) => {
    try {
      const response = await axiosInstance.post("/auth/login", data);
      set({ user: response.data.user });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred during login";
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    try {
      const response = await axiosInstance.post("/auth/logout");
      set({ user: null });
    } catch (error) {
      console.log(error);
    }
  },

  checkAuth: async () => {
    try {
      const response = await axiosInstance.get("/auth/profile");
      set({ user: response.data });
    } catch (error) {
      console.log(error);
    }
  },

  updateProfile: async (data) => {
    try {
      const formData = new FormData();
      
      // Add text fields to formData
      if (data.username) formData.append("username", data.username);
      if (data.email) formData.append("email", data.email);
      
      // Add image if provided
      if (data.image) formData.append("image", data.image);
      
      const response = await axiosInstance.put("/user/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      set({ user: response.data.user });
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  
}));

export default useAuthStore;
