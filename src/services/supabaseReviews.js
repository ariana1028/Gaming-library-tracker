import { supabase } from "./supabaseClient";

// Add a review
export const addReview = async (userId, gameId, rating, reviewText) => {
    const { data, error } = await supabase
        .from("reviews")
        .upsert(
            { 
                user_id: userId, 
                game_id: gameId.toString(), 
                rating, 
                review_text: reviewText 
            },
            { 
                onConflict: 'user_id,game_id'
            }
        )
        .select();
    
    if (error) {
        console.error("addReview error:", error);
        throw error;
    }
    return data;
};

// Get all reviews for a game
export const getReviewsByGame = async (gameId) => {
    const { data, error } = await supabase
        .from("reviews")
        .select(`
            *,
            profiles!reviews_user_id_fkey (username, avatar_color)
        `)
        .eq("game_id", gameId.toString());
    
    if (error) throw error;
    return data;
};

// get reviews from a user
export async function getReviewsByUser(userId) {
    const { data, error } = await supabase
        .from("reviews")
        .select(`
            *,
            profiles (*)
        `)
        .eq("user_id", userId);

    if (error) throw error;
    return data;
}


// Update a review
export const updateReview = async (userId, gameId, rating, reviewText) => {
    const { data, error } = await supabase
        .from("reviews")
        .update({ rating, review_text: reviewText })
        .eq("user_id", userId)
        .eq("game_id", gameId.toString())
        .select();

    if (error) throw error;
    return data;
};

// Delete a review
export const deleteReview = async (userId, gameId) => {
    const { data, error } = await supabase
        .from("reviews")
        .delete()
        .eq("user_id", userId)
        .eq("game_id", gameId.toString());
    if (error) throw error;
    return data;
};
