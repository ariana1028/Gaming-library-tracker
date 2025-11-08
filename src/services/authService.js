import { supabase } from "./supabaseClient";

// Sign up
export const signUpUser = async (email, username, password) => {
    const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
        data: {username},
    },
    });
    if (error) throw error;
    return data;
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
