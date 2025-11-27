import { supabase } from "./supabaseClient";

// Sign up
export const signUpUser = async (email, username, password) => {
    try {
        // 1. Check if username already exists
        const { data: existingUser, error: checkError } = await supabase
            .from("profiles")
            .select("username")
            .eq("username", username)
            .single();

        // If we got data back, username exists
        if (existingUser) {
            throw new Error("Username already taken. Please choose another one.");
        }

        // 2. Sign up the user
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username },
            },
        });
        
        if (error) throw error;
        return data;
    } catch (error) {
        // Re-throw the error so it can be caught in the signup component
        throw error;
    }
};

// Log in
export const signInUser = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    });
    if (error) throw error;
    return data;
};

// Log out
export const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};
