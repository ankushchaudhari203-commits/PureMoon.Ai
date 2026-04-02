import { apiFetch } from "./api";

type UserData = {
  email: string;
  name?: string;
  image?: string;
  last_login?: string;
};

/**
 * 📧 Track or update user email in Supabase
 * Creates a new user entry or updates existing one
 */
export const trackUserEmail = async (userData: UserData) => {
  try {
    if (!userData.email) {
      console.error("Email is required to track user");
      return null;
    }

    const data = await apiFetch("/users/track", {
      method: "POST",
      json: userData,
    });

    console.log("✅ User tracked:", data);
    return data;
  } catch (err) {
    console.error("Unexpected error tracking user:", err);
    return null;
  }
};

/**
 * 🔍 Get user by email
 */
export const getUserByEmail = async (email: string) => {
  try {
    return await apiFetch(`/users/${encodeURIComponent(email)}`);
  } catch (err) {
    console.error("Unexpected error fetching user:", err);
    return null;
  }
};

/**
 * 📊 Get all tracked users (admin use)
 */
export const getAllUsers = async () => {
  try {
    return await apiFetch("/users");
  } catch (err) {
    console.error("Unexpected error fetching users:", err);
    return [];
  }
};
