import { useState } from "react";
import { updateReview, deleteReview } from "../services/supabaseReviews";

const inputStyle = {
    display: "block",
    margin: "5px 0 15px",
    padding: "8px",
    width: "100%",
    borderRadius: "5px",
    border: "none",
    color: "black"
};

export default function ReviewCard({ 
    review, 
    isUserReview = false,
    userId,
    gameId,
    onReviewChange, // callback to refresh reviews in parent
    showGameInfo = false,
    gameData = null // { name, image } for profile page
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editRating, setEditRating] = useState(review.rating.toString());
    const [editText, setEditText] = useState(review.review_text || "");
    const [isUpdating, setIsUpdating] = useState(false);

    const handleSaveEdit = async () => {
        if (!editRating) {
            alert("Please select a rating.");
            return;
        }

        setIsUpdating(true);
        try {
            await updateReview(userId, gameId, Number(editRating), editText.trim() || null);
            setIsEditing(false);
            if (onReviewChange) onReviewChange(); // Refresh reviews in parent
        } catch (err) {
            console.error("Update error:", err);
            alert("Failed to update review: " + err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelEdit = () => {
        setEditRating(review.rating.toString());
        setEditText(review.review_text || "");
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        
        try {
            await deleteReview(userId, gameId);
            if (onReviewChange) onReviewChange(); // Refresh reviews in parent
        } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete review: " + err.message);
        }
    };

    return (
        <div 
            style={{
                backgroundColor: "#1f2d3eff",
                padding: "15px",
                paddingLeft: "20px",
                paddingBottom: "20px",
                borderRadius: "4px",
                border: "1px solid rgba(255,255,255,0.05)",
                position: "relative"
            }}
        >

            {/* Edit/Delete buttons */}
            {isUserReview && !isEditing && (
                <div style={{ 
                    position: "absolute", 
                    top: "15px", 
                    right: "15px", 
                    display: "flex", 
                    gap: "10px" 
                }}>
                    <button
                        onClick={() => setIsEditing(true)}
                        style={{
                            backgroundColor: "#4db8ff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "5px 10px",
                            cursor: "pointer",
                            fontSize: "12px"
                        }}
                    >
                        Edit
                    </button>
                    <button
                        onClick={handleDelete}
                        style={{
                            backgroundColor: "#ff4444",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "5px 10px",
                            cursor: "pointer",
                            fontSize: "12px"
                        }}
                    >
                        Delete
                    </button>
                </div>
            )}
            
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }}>
                {/* Avatar */}
                <div style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: review.profiles?.avatar_color || "#3d9ad7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    fontWeight: "bold",
                    textTransform: "uppercase"
                }}>
                    {review.profiles?.username?.[0] || "?"}
                </div>
                
                <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 5px 0", fontWeight: "bold", fontSize: "16px" }}>
                        {review.profiles?.username || "Anonymous"}

                        {gameData?.name && (
                            <span style={{ color: "#4db8ff", marginLeft: "8px", fontWeight: "normal" }}>
                                • {gameData.name}
                            </span>
                        )}
                    </p>

                    {!isEditing && (
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <span style={{ fontSize: "18px", letterSpacing: "2px" }}>
                                <span style={{ color: "#ffa500" }}>{"★".repeat(review.rating)}</span>
                                <span style={{ color: "#444" }}>{"★".repeat(5 - review.rating)}</span>
                            </span>
                            <span style={{ color: "#aaa", fontSize: "14px" }}>
                                {review.rating}/5
                            </span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Review content or edit form */}
            {!isEditing ? (
                review.review_text && (
                    <p style={{ 
                        margin: "10px 0 0 0", 
                        lineHeight: "1.6",
                        color: "#ddd"
                    }}>
                        {review.review_text}
                    </p>
                )
            ) : (
                <div style={{ marginTop: "15px" }}>
                    <label style={{ fontSize: "14px", color: "#aaa", display: "block", marginBottom: "5px" }}>Rating:</label>
                    <select 
                        value={editRating} 
                        onChange={(e) => setEditRating(e.target.value)} 
                        style={inputStyle}
                    >
                        <option value="1">1 - Poor</option>
                        <option value="2">2 - Fair</option>
                        <option value="3">3 - Good</option>
                        <option value="4">4 - Very Good</option>
                        <option value="5">5 - Excellent</option>
                    </select>

                    <label style={{ fontSize: "14px", color: "#aaa", display: "block", marginBottom: "5px" }}>Review:</label>
                    <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        placeholder="Write your review (optional)"
                        style={{
                            ...inputStyle,
                            minHeight: "80px",
                            resize: "vertical"
                        }}
                    />
                    
                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <button
                            onClick={handleSaveEdit}
                            disabled={isUpdating}
                            style={{
                                backgroundColor: "#4db8ff",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                padding: "8px 16px",
                                cursor: isUpdating ? "not-allowed" : "pointer",
                                fontWeight: "bold"
                            }}
                        >
                            {isUpdating ? "Saving..." : "Save"}
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            disabled={isUpdating}
                            style={{
                                backgroundColor: "#333",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                padding: "8px 16px",
                                cursor: isUpdating ? "not-allowed" : "pointer"
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}