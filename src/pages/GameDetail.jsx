import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getGameDetails } from "../services/rawgApi";
import Navbar from "../components/NavBar";

export default function GameDetail() {
    const { id } = useParams();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

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

    if (loading) return <p>Loading game details...</p>;
    if (!game) return <p>Game not found.</p>;

    const maxLength = 400;
    const isLong = game.description_raw?.length > maxLength;
    const displayedText = expanded ? game.description_raw
        : game.description_raw?.slice(0, maxLength) + (isLong ? "..." : "");

    const genres = game.genres?.map((g) => g.name).join(", ") || "N/A";
    const platforms = game.platforms?.map((p) => p.platform.name).join(", ") || "N/A";

    return (
        <div style={{ backgroundColor: "#0b1b2b", color: "white", minHeight: "100vh"}}>
            <Navbar />
            <div style={{ padding: "40px 60px", paddingLeft: "70px", paddingTop: "50px" }}>
        <div
            style={{
                display: "flex",
                gap: "30px",
                alignItems: "flex-start",
                marginBottom: "30px",
            }}
            >
            {/* Game Image */}
            <img
                src={game.background_image}
                alt={game.name}
                style={{
                width: "250px",
                height: "300px",
                objectFit: "cover",
                borderRadius: "8px",
                backgroundColor: "#222",
                }}
            />

            {/* Game Info */}
            <div>
            <h2 style={{ marginBottom: "10px", fontSize: "40px" }}>{game.name}</h2>
            <p style={{ maxWidth: "900px", lineHeight: "1.6", fontSize: "18px", paddingTop: "10px" }}>
                {displayedText}{" "}
                {isLong && (
                <span
                    onClick={() => setExpanded(!expanded)}
                    style={{
                    color: "#4db8ff",
                    cursor: "pointer",
                    fontWeight: "bold",
                    marginLeft: "5px",
                    }}
                >
                    {expanded ? "Show less" : "Show more"}
                </span>
                )}
            </p>
            </div>
            </div>

            {/* Rating / Genres / Platforms */}
            <div
            style={{
                display: "flex",
                fontSize: "16px",
                marginBottom: "40px",
                gap: "30px",
                paddingLeft: "70px"
            }}
            >
            <p>⭐ Rate: {game.rating}</p>
            <div style={{paddingLeft: "85px", paddingRight: "20px"}}>
            <p>🎭 Genre: {genres}</p>
            </div>
            <p>🕹️ Platforms: {platforms}</p>
            </div>
            </div>
        </div>
    );
    }
