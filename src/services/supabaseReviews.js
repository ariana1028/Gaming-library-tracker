import { supabase } from "./supabaseClient";

// Add a review
export const addReview = async (userId, gameId, rating, reviewText) => {
    const { data, error } = await supabase
        .from("reviews")
        .insert([{ user_id: userId, game_id: gameId, rating, review_text: reviewText }], {
        onConflict: ["user_id", "game_id"],
        });
    if (error) throw error;
    return data;
};

// Get all reviews for a game
export const getReviewsByGame = async (gameId) => {
    const { data, error } = await supabase
        .from("reviews")
        .select(`*, profiles!inner(username, avatar_color, avatar_url)`)
        .eq("game_id", gameId);
    if (error) throw error;
    return data;
};

// Update a review
export const updateReview = async (userId, gameId, rating, reviewText) => {
    const { data, error } = await supabase
        .from("reviews")
        .update({ rating, review_text: reviewText })
        .eq("user_id", userId)
        .eq("game_id", gameId);
    if (error) throw error;
    return data;
};

// Delete a review
export const deleteReview = async (userId, gameId) => {
    const { data, error } = await supabase
        .from("reviews")
        .delete()
        .eq("user_id", userId)
        .eq("game_id", gameId);
    if (error) throw error;
    return data;
};
