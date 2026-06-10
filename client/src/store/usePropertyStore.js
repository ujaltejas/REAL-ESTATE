import { create } from "zustand";
import axiosInstance from "../utils/axios";

const usePropertyStore = create((set, get) => ({
  properties: [],
  userProperties: [],
  currentProperty: null,
  loading: false,
  error: null,

  // Create a new property
  createProperty: async (propertyData) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      
      // Add text fields to formData
      Object.keys(propertyData).forEach(key => {
        if (key !== 'images') {
          // Handle nested objects like address
          if (typeof propertyData[key] === 'object' && propertyData[key] !== null) {
            Object.keys(propertyData[key]).forEach(nestedKey => {
              formData.append(`${key}.${nestedKey}`, propertyData[key][nestedKey]);
            });
          } else {
            formData.append(key, propertyData[key]);
          }
        }
      });
      
      // Add images if provided
      if (propertyData.images && propertyData.images.length > 0) {
        Array.from(propertyData.images).forEach(image => {
          formData.append('images', image);
        });
      }
      
      const response = await axiosInstance.post("/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Update user properties list
      const userProps = get().userProperties;
      set({ 
        userProperties: [response.data.property, ...userProps],
        currentProperty: response.data.property,
        loading: false 
      });
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to create property", 
        loading: false 
      });
      throw error;
    }
  },

  // Get all properties with optional filters
  getAllProperties: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      // Convert filters to query string
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });
      
      const response = await axiosInstance.get(`/post?${queryParams.toString()}`);
      set({ properties: response.data.properties, loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch properties", 
        loading: false 
      });
      throw error;
    }
  },

  // Get property by ID
  getPropertyById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`/post/${id}`);
      set({ currentProperty: response.data.property, loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch property", 
        loading: false 
      });
      throw error;
    }
  },

  // Get user properties
  getUserProperties: async (userId = null) => {
    set({ loading: true, error: null });
    try {
      // The issue is with Express route ordering - specific routes need to come before parameterized routes
      // Using a query parameter approach instead of a path parameter to avoid route conflicts
      const url = userId ? `/post/user?userId=${userId}` : '/post/user';
      const response = await axiosInstance.get(url);
      set({ userProperties: response.data.properties || [], loading: false });
      return response.data;
    } catch (error) {
      console.error("Error fetching user properties:", error);
      set({ 
        error: error.response?.data?.message || "Failed to fetch user properties", 
        loading: false,
        userProperties: []
      });
      throw error;
    }
  },

  // Update property
  updateProperty: async (id, propertyData) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      
      // Add text fields to formData
      Object.keys(propertyData).forEach(key => {
        if (key !== 'images' && key !== 'removedImages') {
          // Handle nested objects like address
          if (typeof propertyData[key] === 'object' && propertyData[key] !== null) {
            Object.keys(propertyData[key]).forEach(nestedKey => {
              formData.append(`${key}.${nestedKey}`, propertyData[key][nestedKey]);
            });
          } else {
            formData.append(key, propertyData[key]);
          }
        }
      });
      
      // Add images if provided
      if (propertyData.images && propertyData.images.length > 0) {
        Array.from(propertyData.images).forEach(image => {
          formData.append('images', image);
        });
      }

      // Add removed image IDs if any
      if (propertyData.removedImages && propertyData.removedImages.length > 0) {
        formData.append('removedImages', JSON.stringify(propertyData.removedImages));
      }
      
      const response = await axiosInstance.put(`/post/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Update properties in state
      const userProps = get().userProperties.map(prop => 
        prop._id === id ? response.data.property : prop
      );
      
      set({ 
        userProperties: userProps,
        currentProperty: response.data.property,
        loading: false 
      });
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to update property", 
        loading: false 
      });
      throw error;
    }
  },

  // Delete property
  deleteProperty: async (id) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/post/${id}`);
      
      // Update properties in state
      const userProps = get().userProperties.filter(prop => prop._id !== id);
      
      set({ 
        userProperties: userProps,
        loading: false 
      });
      
      return { success: true };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to delete property", 
        loading: false 
      });
      throw error;
    }
  },

  // Manage property images (add/remove)
  managePropertyImages: async (id, { addImages, removeImages }) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      
      // Add images if provided
      if (addImages && addImages.length > 0) {
        Array.from(addImages).forEach(image => {
          formData.append('images', image);
        });
      }
      
      // Add image IDs to remove
      if (removeImages && removeImages.length > 0) {
        formData.append('removeImages', JSON.stringify(removeImages));
      }
      
      const response = await axiosInstance.patch(`/post/${id}/images`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Update properties in state
      const userProps = get().userProperties.map(prop => 
        prop._id === id ? response.data.property : prop
      );
      
      set({ 
        userProperties: userProps,
        currentProperty: response.data.property,
        loading: false 
      });
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to manage property images", 
        loading: false 
      });
      throw error;
    }
  },

  contactPropertyOwner: async (id, contactData) => {
    try {
      
      const response = await axiosInstance.post(`/post/${id}/contact`, contactData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Clear current property
  clearCurrentProperty: () => {
    set({ currentProperty: null });
  },

  // Clear errors
  clearError: () => {
    set({ error: null });
  }
}));

export default usePropertyStore; 