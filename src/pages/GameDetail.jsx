import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getGameDetails } from "../services/rawgApi";
import Navbar from "../components/NavBar";
import { saveGame, getSavedGames } from "../services/supabaseGames";
import { addReview, updateReview } from "../services/supabaseReviews";
import { supabase } from "../services/supabaseClient";

const inputStyle = {
    display: "block",
    margin: "5px 0 15px",
    padding: "8px",
    width: "100%",
    borderRadius: "5px",
    border: "none",
};

const buttonStyle = {
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    padding: "8px 16px", 
};

export default function GameDetail() {
    const { id } = useParams();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    const [user, setUser] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [status, setStatus] = useState("");
    const [hours, setHours] = useState("");
    const [rating, setRating] = useState("");
    const [reviewText, setReviewText] = useState("");

    const imgRef = useRef(null);
    const descRef = useRef(null);
    const [needsExpand, setNeedsExpand] = useState(false);

    // Load game
    useEffect(() => {
        const loadGame = async () => {
        try {
            const data = await getGameDetails(id);
            setGame(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
        };
        loadGame();
    }, [id]);

    // Load user
    useEffect(() => {
        const fetchUser = async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error) return console.error(error);
        setUser(data.user);
        };
        fetchUser();
    }, []);

    // Check if game is saved
    useEffect(() => {
        const checkSaved = async () => {
        if (!user || !game) return;
        try {
            const savedGames = await getSavedGames(user.id);
            const found = savedGames.some(g => Number(g.game_id) === Number(game.id));
            setIsSaved(found);
        } catch (err) {
            console.error(err);
        }
        };
        checkSaved();
    }, [user, game]);

    // Check if description needs expand button
    useEffect(() => {
        const checkHeight = () => {
            if (imgRef.current && descRef.current && !expanded) {
                const imgHeight = imgRef.current.clientHeight;
                const descHeight = descRef.current.scrollHeight;
                setNeedsExpand(descHeight > imgHeight - 60);
            }
        };

        window.addEventListener("resize", checkHeight);
        setTimeout(checkHeight, 100);
        return () => window.removeEventListener("resize", checkHeight);
    }, [game, expanded]);

    const handleSaveGame = async () => {
        if (!user) return;

        // Validate: if review text is entered, rating must be provided
        if (reviewText.trim() && !rating) {
            alert("Please provide a rating if you want to leave a review.");
            return;
        }

        setSaving(true);
        try {
            // Save the game
            await saveGame(user.id, Number(game.id), {
                name: game.name,
                image: game.background_image,
                status: status || null,
                hours: hours || null
            });

            // Save review if rating is provided
            if (rating) {
                await addReview(user.id, Number(game.id), Number(rating), reviewText.trim() || null);
            }

            setIsSaved(true);
            setShowModal(false);
            
            // Reset form
            setStatus("");
            setHours("");
            setRating("");
            setReviewText("");
        } catch (err) {
            console.error(err);
            alert("Failed to save game or review.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ backgroundColor: "#0b1b2b", color: "white", minHeight: "100vh", padding: "10px" }}><p>Loading game details...</p></div>;
    if (!game) return <div style={{ backgroundColor: "#0b1b2b", color: "white", minHeight: "100vh", padding: "10px" }}><p>Game not found.</p></div>;

    const genres = game.genres?.map(g => g.name).join(", ") || "N/A";
    const platforms = game.platforms?.map(p => p.platform.name).join(", ") || "N/A";

    return (
        <div style={{ backgroundColor: "#0b1b2b", color: "white", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ 
            padding: "40px 60px", 
            paddingTop: "50px",
            maxWidth: "1400px",
            margin: "0 auto"
        }}>
            <div style={{ display: "flex", gap: "30px", alignItems: "flex-start", marginBottom: "30px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                <img 
                    ref={imgRef}
                    src={game.background_image} 
                    alt={game.name} 
                    style={{ width: "250px", height: "300px", objectFit: "cover", objectPosition: "center", borderRadius: "8px", backgroundColor: "#222" }} 
                />
                <button
                onClick={() => setShowModal(true)}
                disabled={!user || isSaved}
                style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: user ? "pointer" : "not-allowed",
                    backgroundColor: isSaved ? "#4db8ff" : "#222",
                    color: isSaved ? "white" : "#4db8ff",
                    fontWeight: "bold",
                }}
                >
                {user ? (isSaved ? "Saved" : "Save Game") : "Log in to save game"}
                </button>
            </div>

            <div>
                <h2 style={{ marginBottom: "10px", fontSize: "40px" }}>{game.name}</h2>
                <div 
                    ref={descRef}
                    style={{ 
                        maxWidth: "900px", 
                        lineHeight: "1.6", 
                        fontSize: "18px", 
                        paddingTop: "10px",
                        maxHeight: expanded ? "none" : "240px",
                        overflow: "hidden"
                    }}
                >
                    <p style={{ margin: 0 }}>
                        {game.description_raw}
                    </p>
                </div>
                {needsExpand && (
                    <span
                        onClick={() => setExpanded(!expanded)}
                        style={{ color: "#4db8ff", cursor: "pointer", fontWeight: "bold", marginLeft: "5px" }}
                    >
                        {expanded ? "Show less" : "... Show more"}
                    </span>
                )}
            </div>
            </div>

            <div style={{ display: "flex", fontSize: "16px", marginBottom: "40px", gap: "30px" }}>
            <p>⭐ Rate: {game.rating}</p>
            <div style={{ paddingLeft: "85px", paddingRight: "20px" }}><p>🎭 Genre: {genres}</p></div>
            <p>🕹️ Platforms: {platforms}</p>
            </div>
        </div>

        {/* Modal */}
        {showModal && (
            <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
            }}>
            <div style={{ 
                backgroundColor: "#3f454bff", 
                padding: "20px", 
                borderRadius: "8px", 
                width: "500px",
                maxHeight: "90vh",
                overflowY: "auto"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0 }}>Save Game</h3>
                <button onClick={() => setShowModal(false)} style={{ cursor: "pointer", fontSize: "18px", border: "none", background: "transparent", color: "white" }}>✕</button>
                </div>

                <div style={{ marginTop: "15px" }}>
                <label>Status:</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
                    <option value="">Select status (optional)</option>
                    <option value="Playing">Playing</option>
                    <option value="Completed">Completed</option>
                    <option value="Want to play">Want to play</option>
                </select>

                <label>Hours played:</label>
                <input 
                    type="number" 
                    value={hours} 
                    onChange={(e) => setHours(e.target.value)} 
                    placeholder="Optional" 
                    style={inputStyle} 
                />

                <label>Rating (1-5):</label>
                <select 
                    value={rating} 
                    onChange={(e) => setRating(e.target.value)} 
                    style={inputStyle}
                >
                    <option value="">No rating (optional)</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                </select>

                <label>Review:</label>
                <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Write your review (optional)"
                    style={inputStyle}
                />
                {reviewText.trim() && !rating && (
                    <p style={{ color: "#ff6b6b", fontSize: "14px"}}>
                        Please select a rating to submit a review
                    </p>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
                    <button 
                        onClick={handleSaveGame} 
                        style={{...buttonStyle, fontWeight: "bold"}}
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                    <button 
                        onClick={() => setShowModal(false)} 
                        style={buttonStyle}
                    >
                        Cancel
                    </button>
                </div>
                </div>
            </div>
            </div>
        )}
        </div>
    );
}