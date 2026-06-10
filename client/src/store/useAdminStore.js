import { create } from "zustand";
import axiosInstance from "../utils/axios";

const useAdminStore = create((set) => ({
    users: [],
    loading: false,
    error: null,

    // Fetch all users
    getAllUsers: async () => {
        try {
            set({ loading: true, error: null });
            const response = await axiosInstance.get("/user/all");
            set({ users: response.data.users, loading: false });
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Failed to fetch users",
                loading: false 
            });
            throw error;
        }
    },

    // Delete user
    deleteUser: async (userId) => {
        try {
            set({ loading: true, error: null });
            await axiosInstance.delete(`/user/${userId}`);
            // Update users list after deletion
            set(state => ({
                users: state.users.filter(user => user._id !== userId),
                loading: false
            }));
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Failed to delete user",
                loading: false 
            });
            throw error;
        }
    },

    // Clear errors
    clearError: () => set({ error: null })
}));

export default useAdminStore; 