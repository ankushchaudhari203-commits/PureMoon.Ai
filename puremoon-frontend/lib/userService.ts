import { supabase } from "./supabase";

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

    // ✅ Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", userData.email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows found (expected on first login)
      console.error("Error checking existing user:", fetchError);
      return null;
    }

    if (existingUser) {
      // 🔄 Update last login time
      const { data, error } = await supabase
        .from("users")
        .update({
          last_login: new Date().toISOString(),
          name: userData.name || existingUser.name,
          image: userData.image || existingUser.image,
        })
        .eq("email", userData.email)
        .select();

      if (error) {
        console.error("Error updating user:", error);
        return null;
      }

      console.log("✅ User updated:", data?.[0]);
      return data?.[0];
    } else {
      // ➕ Create new user entry
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            email: userData.email,
            name: userData.name || null,
            image: userData.image || null,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error("Error creating user:", error);
        return null;
      }

      console.log("✅ New user created:", data?.[0]);
      return data?.[0];
    }
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
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user:", error);
      return null;
    }

    return data || null;
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
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Unexpected error fetching users:", err);
    return [];
  }
};
