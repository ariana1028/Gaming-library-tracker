import Navbar from "../components/NavBar"
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { getSavedGames, deleteSavedGame } from "../services/supabaseGames";
import { deleteReview } from "../services/supabaseReviews";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [savedGames, setSavedGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            const currentUser = data?.user || null;
            setUser(currentUser);

            if (currentUser) {
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", currentUser.id)
                    .single();
                
                if (profileData) {
                    setProfile(profileData);
                }
            }
        };
        getUser();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
            if (!session?.user) setProfile(null);
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    // Fetch saved games when user is loaded
    useEffect(() => {
        const fetchSavedGames = async () => {
            if (!user) return;
            
            setLoading(true);
            try {
                const games = await getSavedGames(user.id);
                setSavedGames(games);
            } catch (err) {
                console.error("Error fetching saved games:", err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchSavedGames();
    }, [user]);

    const handleRemoveGame = async (gameId) => {
        if (!user) return;
        if (!confirm("This action will permanently delete your progress and review. Are you sure you want to continue?")) return;
        
        try {
            await deleteSavedGame(user.id, gameId);
            await deleteReview(user.id, gameId);
            setSavedGames(savedGames.filter(g => g.game_id !== gameId));
        } catch (err) {
            console.error("Error removing game:", err);
            alert("Failed to remove game");
        }
    };

    if (!user) {
        return (
            <div style={{color: "white", backgroundColor: "#0b1b2b", minHeight: "100vh" }}>
                <Navbar />
                <p style={{ padding: "20px" }}>Loading profile...</p>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: "#0b1b2b", color: "white", minHeight: "100vh"}}>
            <Navbar />
            
            {/* Profile Header Section */}
            <div style={{
                backgroundColor: "#1a2332",
                padding: "50px 60px",
                display: "flex",
                gap: "30px",
                alignItems: "center"
            }}>
                <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
                    {/* Avatar */}
                    <div
                        style={{
                            width: "120px",
                            height: "120px",
                            borderRadius: "50%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontWeight: "bold",
                            fontSize: "48px",
                            backgroundColor: profile?.avatar_color || "#3d9ad7" ,
                            textTransform: "uppercase",
                            flexShrink: 0
                        }}
                    >
                        {user.user_metadata?.username
                            ? user.user_metadata.username[0]
                            : user.email[0]}
                    </div>

                    {/* User Info */}
                    <div>
                        <h2 style={{ 
                            margin: "0",
                            fontSize: "36px",
                            fontWeight: "normal"
                        }}>
                            {user.user_metadata?.username || user.email}
                        </h2>
                    </div>
                </div>

                {/* Stats next to username */}
                <div style={{ fontSize: "18px", color: "#ccc", marginLeft: "50px" }}>
                    <p style={{ margin: 0 }}>total games: {savedGames.length}</p>
                </div>
            </div>

            {/* Games Section */}
            <div style={{ padding: "0 60px" }}>
                {/* Section Header */}
                <div style={{
                    backgroundColor: "#2a3a4a",
                    padding: "15px 20px",
                    marginTop: "40px",
                    marginBottom: "30px",
                    borderRadius: "4px"
                }}>
                    <h3 style={{ 
                        margin: 0,
                        fontSize: "22px",
                        fontWeight: "normal"
                    }}>
                        Saved games
                    </h3>
                </div>

                {/* Games Grid */}
                {loading ? (
                    <p>Loading saved games...</p>
                ) : savedGames.length === 0 ? (
                    <p style={{ color: "#aaa" }}>No saved games yet. Start exploring and save your favorites!</p>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                            gap: "20px",
                            paddingBottom: "40px"
                        }}
                    >
                        {savedGames.map((game) => (
                            <div
                                key={game.game_id}
                                style={{
                                    border: "1px solid #ccc",
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                                    backgroundColor: "#142236",
                                    position: "relative",
                                    cursor: "pointer"
                                }}
                            >
                                <div onClick={() => navigate(`/p79/gamedetail/${game.game_id}`)}>
                                    {game.save_data?.image && (
                                        <img
                                            src={game.save_data.image}
                                            alt={game.save_data?.name || "Game"}
                                            style={{ 
                                                width: "100%", 
                                                height: "150px", 
                                                objectFit: "cover",
                                                display: "block"
                                            }}
                                        />
                                    )}
                                    <div style={{ padding: "10px" }}>
                                        <h3 style={{ margin: "0 0 5px 0" }}>
                                            {game.save_data?.name || "Unnamed Game"}
                                        </h3>
                                    </div>
                                </div>
                                
                                {/* Remove button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveGame(game.game_id);
                                    }}
                                    style={{
                                        position: "absolute",
                                        top: "10px",
                                        right: "10px",
                                        backgroundColor: "rgba(0,0,0,0.7)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        padding: "5px 10px",
                                        cursor: "pointer",
                                        fontSize: "12px"
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}