import { supabase } from "./supabaseClient";

// Save or update a game
export const saveGame = async (userId, gameId, saveData) => {
    const { data, error } = await supabase
        .from("user_games")
        .upsert(
        {
            user_id: userId,
            game_id: gameId,
            save_data: saveData,
        },
        { onConflict: ["user_id", "game_id"] }
        );

    if (error) {
        console.error("saveGame error:", error);
        throw error;
    }
    return data;
};


// Get all saved games for a user
export const getSavedGames = async (userId) => {
    const { data, error } = await supabase
        .from("user_games")
        .select("*")
        .eq("user_id", userId);
    if (error) throw error;
    return data;
};

// Delete a saved game
export const deleteSavedGame = async (userId, gameId) => {
    const { data, error } = await supabase
        .from("user_games")
        .delete()
        .eq("user_id", userId)
        .eq("game_id", gameId);
    if (error) throw error;
    return data;
};
