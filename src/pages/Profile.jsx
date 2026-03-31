import Navbar from "../components/NavBar"
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { getSavedGames, deleteSavedGame } from "../services/supabaseGames";
import { deleteReview, getReviewsByUser } from "../services/supabaseReviews"; // ← make sure this is imported
import ReviewCard from "../components/ReviewCard";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [savedGames, setSavedGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);

    const [activeTab, setActiveTab] = useState("games");
    const [userReviews, setUserReviews] = useState([]);

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

    // Fetch saved games
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

    // Fetch user reviews
    useEffect(() => {
        const fetchUserReviews = async () => {
            if (!user) return;
            try {
                const reviews = await getReviewsByUser(user.id);

                // Attach game info to each review
                const reviewsWithGames = reviews.map((r) => {
                    const game = savedGames.find(g => g.game_id === r.game_id);
                    return {
                        ...r,
                        gameData: game ? game.save_data : null
                    };
                });

                setUserReviews(reviewsWithGames);
            } catch (err) {
                console.error("Error loading user reviews:", err);
            }
        };

        fetchUserReviews();
    }, [user, savedGames]);

    const handleRemoveGame = async (gameId) => {
        if (!user) return;
        if (!confirm("This action will permanently delete your progress and review. Are you sure?")) return;
        
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

    function HeaderDropdown({ activeTab, setActiveTab }) {
        const [open, setOpen] = useState(false);

        const handleSelect = (value) => {
            setActiveTab(value);
            setOpen(false);
        };

        return (
            <div style={{ position: "relative", display: "inline-block" }}>
                {/* Visible clickable label */}
                <div
                    onClick={() => setOpen(!open)}
                    style={{
                        fontSize: "22px",
                        fontWeight: "normal",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        userSelect: "none"
                    }}
                >
                    {activeTab === "games" ? "Saved Games" : "Your Reviews"}
                    <span style={{ fontSize: "16px" }}>▼</span>
                </div>

                {/* Dropdown menu */}
                {open && (
                    <div
                        style={{
                            position: "absolute",
                            top: "30px",
                            left: "-20px",
                            backgroundColor: "#2a3a4a",
                            borderRadius: "4px",
                            zIndex: 100,
                            width: "180px"
                        }}
                    >
                        {activeTab === "games" ? 
                            <div
                            onClick={() => handleSelect("reviews")}
                            style={{
                                paddingLeft: "20px",
                                paddingTop: "10px",
                                paddingBottom: "10px",
                                cursor: "pointer",
                                color: "white"
                            }}
                        >
                            Your Reviews
                        </div>
                        : <div
                            onClick={() => handleSelect("games")}
                            style={{
                                paddingLeft: "20px",
                                paddingTop: "10px",
                                paddingBottom: "10px",
                                cursor: "pointer",
                                color: "white"
                            }}
                        >
                            Saved Games
                        </div>}
                        </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: "#0b1b2b", color: "white", minHeight: "100vh"}}>
            <Navbar />
            
            {/* Profile Header */}
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
                            backgroundColor: profile?.avatar_color || "#3d9ad7",
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
                        <h2 style={{ margin: 0, fontSize: "36px" }}>
                            {user.user_metadata?.username || user.email}
                        </h2>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ fontSize: "18px", color: "#ccc", marginLeft: "70px"}}>
                    <p style={{ margin: "0 0 30px 0"  }}>Total games: {savedGames.length}</p>
                    <p style={{ margin: 0 }}>Total reviews: {userReviews.length}</p>
                </div>
            </div>

            {/* Main Section */}
            <div style={{ padding: "0 60px" }}>

                {/* Header with tabs */}
                <div
                    style={{
                        backgroundColor: "#2a3a4a",
                        padding: "0px",
                        marginTop: "40px",
                        marginBottom: "30px",
                        borderRadius: "4px",
                        display: "flex"
                    }}
                >
                    <div
                        onClick={() => setActiveTab("games")}
                        style={{
                            flex: 1,
                            padding: "15px 20px",
                            cursor: "pointer",
                            backgroundColor: activeTab === "games" ? "#4db8ff" : "transparent",
                            color: activeTab === "games" ? "white" : "#ccc",
                            borderRadius: "4px 0 0 4px",
                            textAlign: "center",
                            fontSize: "18px",
                            fontWeight: activeTab === "games" ? "bold" : "normal",
                            transition: "all 0.2s ease"
                        }}
                    >
                        Saved Games
                    </div>
                    <div
                        onClick={() => setActiveTab("reviews")}
                        style={{
                            flex: 1,
                            padding: "15px 20px",
                            cursor: "pointer",
                            backgroundColor: activeTab === "reviews" ? "#4db8ff" : "transparent",
                            color: activeTab === "reviews" ? "white" : "#ccc",
                            borderRadius: "0 4px 4px 0",
                            textAlign: "center",
                            fontSize: "18px",
                            fontWeight: activeTab === "reviews" ? "bold" : "normal",
                            transition: "all 0.2s ease"
                        }}
                    >
                        Your Reviews
                    </div>
                </div>

                {/* ------------------- GAMES TAB ------------------- */}
                {activeTab === "games" && (
                    <>
                        {loading ? (
                            <p>Loading saved games...</p>
                        ) : savedGames.length === 0 ? (
                            <p style={{ color: "#bbb" }}>No saved games yet.</p>
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
                                            backgroundColor: "#142236",
                                            position: "relative",
                                            cursor: "pointer"
                                        }}
                                        onClick={() => navigate(`/gamedetail/${game.game_id}`)}
                                    >
                                        {game.save_data?.image && (
                                            <img
                                                src={game.save_data.image}
                                                alt={`Cover image for ${game.save_data?.name || 'game'}`}
                                                style={{
                                                    width: "100%",
                                                    height: "150px",
                                                    objectFit: "cover"
                                                }}
                                            />
                                        )}

                                        <div style={{ padding: "10px" }}>
                                            <h3 style={{ margin: 0, fontSize: "20px" }}>
                                                {game.save_data?.name}
                                            </h3>
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
                    </>
                )}

                {/* ------------------- REVIEWS TAB ------------------- */}
                {activeTab === "reviews" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingBottom: "40px" }}>
                        {userReviews.length === 0 ? (
                            <p style={{ color: "#bbb" }}>You haven't written any reviews yet.</p>
                        ) : (
                            userReviews.map((review) => (
                                <ReviewCard
                                    key={review.id}
                                    review={review}
                                    isUserReview={true}
                                    userId={user.id}
                                    gameId={review.game_id}
                                    onReviewChange={() => window.location.reload()}
                                    showGameInfo={true}
                                    gameData={review.gameData}
                                />
                            ))
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
