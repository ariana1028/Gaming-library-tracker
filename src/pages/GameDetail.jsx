import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getGameDetails } from "../services/rawgApi";
import Navbar from "../components/NavBar";
import { saveGame, getSavedGames, deleteSavedGame } from "../services/supabaseGames";
import { addReview, getReviewsByGame, deleteReview } from "../services/supabaseReviews";
import { supabase } from "../services/supabaseClient";
import ReviewCard from "../components/ReviewCard";

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
    const [savedGameData, setSavedGameData] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [status, setStatus] = useState("");
    const [hours, setHours] = useState("");
    const [rating, setRating] = useState("");
    const [reviewText, setReviewText] = useState("");

    const [editMode, setEditMode] = useState(false);
    const [editStatus, setEditStatus] = useState("");
    const [editHours, setEditHours] = useState("");
    const [updating, setUpdating] = useState(false);

    // Review states
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);

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
            const found = savedGames.find(g => Number(g.game_id) === Number(game.id));
            if (found) {
                setIsSaved(true);
                setSavedGameData(found);
                setEditStatus(found.save_data?.status || "");
                setEditHours(found.save_data?.hours || "");
            }
        } catch (err) {
            console.error(err);
        }
        };
        checkSaved();
    }, [user, game]);

    // Load reviews
    const loadReviews = async () => {
        if (!game) return;
        setLoadingReviews(true);
        try {
            const reviewsData = await getReviewsByGame(Number(game.id));
            setReviews(reviewsData || []);
        } catch (err) {
            console.error("Error loading reviews:", err);
        } finally {
            setLoadingReviews(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, [game]);

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
                await loadReviews(); // Reload reviews
            }

            setIsSaved(true);
            
            // Update saved game data
            setSavedGameData({
                save_data: {
                    status: status || null,
                    hours: hours || null
                }
            });
            setEditStatus(status || "");
            setEditHours(hours || "");
            
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

    const handleRemoveGame = async () => {
        if (!user) return;
        
        try {
            await deleteSavedGame(user.id, Number(game.id));
            await deleteReview(user.id, Number(game.id));
            
            setIsSaved(false);
            setSavedGameData(null);
            setEditStatus("");
            setEditHours("");
            
            // Reload reviews to remove user's review from the list
            await loadReviews();
        } catch (err) {
            console.error("Error removing game:", err);
            alert("Failed to remove game");
        }
    };

    const handleUpdateStatus = async () => {
        if (!user) return;
        
        setUpdating(true);
        try {
            await saveGame(user.id, Number(game.id), {
                name: game.name,
                image: game.background_image,
                status: editStatus || null,
                hours: editHours || null
            });
            
            setSavedGameData({
                save_data: {
                    status: editStatus || null,
                    hours: editHours || null
                }
            });
            setEditMode(false);
        } catch (err) {
            console.error(err);
            alert("Failed to update status.");
        } finally {
            setUpdating(false);
        }
    };

    const handleAddReview = async () => {
        if (!user || !rating) {
            alert("Please provide a rating.");
            return;
        }

        try {
            await addReview(user.id, Number(game.id), Number(rating), reviewText.trim() || null);
            await loadReviews();
            
            setShowReviewModal(false);
            setRating("");
            setReviewText("");
        } catch (err) {
            console.error(err);
            alert("Failed to add review.");
        }
    };

    if (loading) return <div style={{ backgroundColor: "#0b1b2b", color: "white", minHeight: "100vh", padding: "10px" }}><p>Loading game details...</p></div>;
    if (!game) return <div style={{ backgroundColor: "#0b1b2b", color: "white", minHeight: "100vh", padding: "10px" }}><p>Game not found.</p></div>;

    const genres = game.genres?.map(g => g.name).join(", ") || "N/A";
    const platforms = game.platforms?.map(p => p.platform.name).join(", ") || "N/A";

    // Computed values for reviews
    const userReview = user ? reviews.find(r => r.user_id === user.id) : null;
    const otherReviews = user ? reviews.filter(r => r.user_id !== user.id) : reviews;

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
            {/* Left column: image, button, rating, status box */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: "10px", width: "250px" }}>
                <img 
                    ref={imgRef}
                    src={game.background_image} 
                    alt={game.name} 
                    style={{ width: "250px", height: "300px", objectFit: "cover", objectPosition: "center", borderRadius: "8px", backgroundColor: "#222" }} 
                />
                <button
                    onClick={() => {
                        if (isSaved) {
                            // Handle remove logic
                            if (window.confirm("This will remove the game from your library and delete your review. Are you sure?")) {
                                handleRemoveGame();
                            }
                        } else {
                            setShowModal(true);
                        }
                    }}
                    disabled={!user}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: user ? "pointer" : "not-allowed",
                        backgroundColor: isSaved ? "#4db8ff" : "#222",
                        color: isSaved ? "#fff" : "#4db8ff",
                        fontWeight: "bold",
                    }}
                >
                    {!user ? "Log in to save game" : (isSaved ? "Remove" : "Save Game")}
                </button>

                {/* Rating under image */}
                <div style={{ fontSize: "16px", marginTop: "10px", textAlign: "center"  }}>
                    <p style={{ margin: 0 }}>⭐ Rate: {game.rating}</p>
                </div>

                {/* Status Box */}
                {isSaved && savedGameData && (
                    <div style={{ 
                        backgroundColor: "#1a2332", 
                        padding: "15px", 
                        borderRadius: "8px",
                        border: "1px solid #4db8ff",
                        marginTop: "30px"
                    }}>
                        <h2 style={{ margin: "0 0 15px 0", fontSize: "18px", color: "#4db8ff" }}>Your Progress</h2>
                        
                        {!editMode ? (
                            <>
                                <div style={{ marginBottom: "10px" }}>
                                    <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#bbb" }}>Status:</p>
                                    <p style={{ margin: 0, fontSize: "16px" }}>
                                        {savedGameData.save_data?.status || "Not set"}
                                    </p>
                                </div>
                                
                                <div style={{ marginBottom: "15px" }}>
                                    <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#bbb" }}>Hours played:</p>
                                    <p style={{ margin: 0, fontSize: "16px" }}>
                                        {savedGameData.save_data?.hours ? `${savedGameData.save_data.hours} hours` : "Not set"}
                                    </p>
                                </div>
                                
                                <button
                                    onClick={() => setEditMode(true)}
                                    style={{
                                        width: "100%",
                                        padding: "8px",
                                        backgroundColor: "#4db8ff",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontWeight: "bold"
                                    }}
                                >
                                    Edit
                                </button>
                            </>
                        ) : (
                            <>
                                <div style={{ marginBottom: "10px" }}>
                                    <label htmlFor="edit-status" style={{ fontSize: "14px", color: "#bbb", display: "block", marginBottom: "5px" }}>
                                        Status:
                                    </label>
                                    <select 
                                        id="edit-status"
                                        value={editStatus} 
                                        onChange={(e) => setEditStatus(e.target.value)} 
                                        style={inputStyle}
                                    >
                                        <option value="">Not set</option>
                                        <option value="Playing">Playing</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Want to play">Want to play</option>
                                    </select>
                                </div>
                                
                                <div style={{ marginBottom: "15px" }}>
                                    <label htmlFor="edit-hours" style={{ fontSize: "14px", color: "#bbb", display: "block", marginBottom: "5px" }}>
                                        Hours played:
                                    </label>
                                    <input
                                        id="edit-hours"
                                        type="number"
                                        value={editHours}
                                        onChange={(e) => setEditHours(e.target.value)}
                                        placeholder="Optional"
                                        style={inputStyle}
                                    />
                                </div>
                                
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button
                                        onClick={handleUpdateStatus}
                                        disabled={updating}
                                        style={{
                                            flex: 1,
                                            padding: "8px",
                                            backgroundColor: "#4db8ff",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: updating ? "not-allowed" : "pointer",
                                            fontWeight: "bold"
                                        }}
                                    >
                                        {updating ? "Updating..." : "Update"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditMode(false);
                                            setEditStatus(savedGameData.save_data?.status || "");
                                            setEditHours(savedGameData.save_data?.hours || "");
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: "8px",
                                            backgroundColor: "#333",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Right column: title, description, genre, platforms, reviews */}
            <div style={{ flex: 1 }}>
                <h1 style={{ marginBottom: "10px", fontSize: "40px" }}>{game.name}</h1>
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

                {/* Genre and Platforms under description */}
                <div style={{ display: "flex", fontSize: "16px", marginTop: "20px", gap: "30px", flexWrap: "wrap", paddingTop: "26px" }}>
                    <p style={{ margin: 0 }}>🎭 Genre: {genres}</p>
                    <p style={{ margin: 0 }}>🕹️ Platforms: {platforms}</p>
                </div>

                {/* Reviews Section */}
                <div style={{ marginTop: "40px" }}>
                    <h2 style={{ fontSize: "24px", marginBottom: "20px", color: "#fff" }}>
                        Reviews ({reviews.length})
                    </h2>
                    
                    {loadingReviews ? (
                        <p style={{ color: "#bbb" }}>Loading reviews...</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* User Review Prompt - Show if saved but no review */}
                            {user && isSaved && !userReview && (
                                <div 
                                    style={{
                                        backgroundColor: "#1a2332",
                                        padding: "20px",
                                        borderRadius: "8px",
                                        border: "1px solid rgba(255,255,255,0.05)",
                                        textAlign: "center"
                                    }}
                                >
                                    <p style={{ margin: "0 0 15px 0", fontSize: "16px" }}>
                                        You've saved this game! Share your thoughts with a review.
                                    </p>
                                    <button
                                        onClick={() => setShowReviewModal(true)}
                                        style={{
                                            backgroundColor: "#4db8ff",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "6px",
                                            padding: "10px 20px",
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                            fontSize: "16px"
                                        }}
                                    >
                                        Leave a Review
                                    </button>
                                </div>
                            )}

                            {/* Prompt if not logged in */}
                            {!user && (
                                <div 
                                    style={{
                                        backgroundColor: "#1a2332",
                                        padding: "20px",
                                        borderRadius: "8px",
                                        border: "1px solid #333",
                                        textAlign: "center"
                                    }}
                                >
                                    <p style={{ margin: 0, color: "#bbb" }}>
                                        Log in to save this game and leave a review!
                                    </p>
                                </div>
                            )}

                            {/* Prompt if logged in but not saved */}
                            {user && !isSaved && (
                                <div 
                                    style={{
                                        backgroundColor: "#1a2332",
                                        padding: "20px",
                                        borderRadius: "8px",
                                        border: "1px solid #333",
                                        textAlign: "center"
                                    }}
                                >
                                    <p style={{ margin: 0, color: "#bbb" }}>
                                        Save this game first to leave a review!
                                    </p>
                                </div>
                            )}

                            {/* User's Review - Always at top if exists */}
                            {userReview && (
                                <ReviewCard 
                                    review={{
                                        ...userReview,
                                        username: user.user_metadata?.username || user.email || 'You'
                                    }}
                                    isUserReview={true}
                                    userId={user.id}
                                    gameId={Number(game.id)}
                                    onReviewChange={loadReviews}
                                />
                            )}
                            
                            {/* Other Reviews */}
                            {otherReviews.length === 0 && !userReview && user && isSaved ? (
                                <p style={{ color: "#bbb" }}>No other reviews yet. Be the first to review this game!</p>
                            ) : (
                                otherReviews.map((review) => (
                                    <ReviewCard 
                                        key={review.id}
                                        review={{
                                            ...review,
                                            username: "Anonymous"
                                        }}
                                        isUserReview={false}
                                        userId={user?.id}
                                        gameId={Number(game.id)}
                                        onReviewChange={loadReviews}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
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
                <h2 style={{ margin: 0 }}>Save Game</h2>
                <button onClick={() => setShowModal(false)} style={{ cursor: "pointer", fontSize: "18px", border: "none", background: "transparent", color: "white" }}>✕</button>
                </div>

                <div style={{ marginTop: "15px" }}>
                <label htmlFor="save-status" style={{ fontSize: "14px", color: "#bbb", display: "block", marginBottom: "5px" }}>
                    Status:
                </label>
                <select 
                    id="save-status"
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)} 
                    style={inputStyle}
                >
                    <option value="">Select status (optional)</option>
                    <option value="Playing">Playing</option>
                    <option value="Completed">Completed</option>
                    <option value="Want to play">Want to play</option>
                </select>

                <label htmlFor="save-hours" style={{ fontSize: "14px", color: "#bbb", display: "block", marginBottom: "5px" }}>
                    Hours played:
                </label>
                <input 
                    id="save-hours"
                    type="number" 
                    value={hours} 
                    onChange={(e) => setHours(e.target.value)} 
                    placeholder="Optional" 
                    style={inputStyle} 
                />

                <label htmlFor="save-rating" style={{ fontSize: "14px", color: "#bbb", display: "block", marginBottom: "5px" }}>
                    Rating (1-5):
                </label>
                <select 
                    id="save-rating"
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

                <label htmlFor="save-review" style={{ fontSize: "14px", color: "#bbb", display: "block", marginBottom: "5px" }}>
                    Review:
                </label>
                <textarea
                    id="save-review"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Write your review (optional)"
                    style={inputStyle}
                />
                {reviewText.trim() && !rating && (
                    <p style={{ color: "#ff6b6b", fontSize: "14px", margin: "0 0 10px 0" }}>
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

        {/* Review Modal */}
        {showReviewModal && (
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
                    width: "500px"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h2 style={{ margin: 0 }}>Leave a Review</h2>
                        <button onClick={() => setShowReviewModal(false)} style={{ cursor: "pointer", fontSize: "18px", border: "none", background: "transparent", color: "white" }}>✕</button>
                    </div>

                    <div style={{ marginTop: "15px" }}>
                        <label htmlFor="review-rating" style={{ fontSize: "14px", color: "#bbb", display: "block", marginBottom: "5px" }}>
                            Rating (1-5):
                        </label>
                        <select 
                            id="review-rating"
                            value={rating} 
                            onChange={(e) => setRating(e.target.value)} 
                            style={inputStyle}
                        >
                            <option value="">Select rating</option>
                            <option value="1">1 - Poor</option>
                            <option value="2">2 - Fair</option>
                            <option value="3">3 - Good</option>
                            <option value="4">4 - Very Good</option>
                            <option value="5">5 - Excellent</option>
                        </select>

                        <label htmlFor="review-text" style={{ fontSize: "14px", color: "#bbb", display: "block", marginBottom: "5px" }}>
                            Review:
                        </label>
                        <textarea
                            id="review-text"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Write your review (optional)"
                            style={inputStyle}
                        />

                        {reviewText.trim() && !rating && (
                            <p style={{ color: "#ff6b6b", fontSize: "14px", margin: "0 0 10px 0" }}>
                                Please select a rating to submit a review
                            </p>
                        )}

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
                            <button 
                                onClick={handleAddReview} 
                                style={{...buttonStyle, fontWeight: "bold", backgroundColor: "#4db8ff", color: "white"}}
                                disabled={!rating}
                            >
                                Submit Review
                            </button>
                            <button 
                                onClick={() => setShowReviewModal(false)} 
                                style={{...buttonStyle, backgroundColor: "#333", color: "white"}}
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