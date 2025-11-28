import { useNavigate } from "react-router-dom";

export default function GameCard({ game }) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/p79/gamedetail/${game.id}`)}
            style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                backgroundColor: "#142236",
                cursor: "pointer",
                transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
            {game.background_image && (
                <img
                    src={game.background_image}
                    alt={game.name}
                    style={{ width: "100%", height: "150px", objectFit: "cover" }}
                />
            )}
            <div style={{ padding: "10px" }}>
                <h3 style={{ margin: "0 0 5px 0", fontSize: "20px" }}>{game.name}</h3>
            </div>
        </div>
    );
}