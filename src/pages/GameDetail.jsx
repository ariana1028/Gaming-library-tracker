import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getGameDetails } from "../services/rawgApi";
import Navbar from "../components/NavBar";
import { saveGame, getSavedGames } from "../services/supabaseGames";
import { supabase } from "../services/supabaseClient";

export default function GameDetail() {
    const { id } = useParams();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    const [user, setUser] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);

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

    // Check if game is saved (runs when both user and game are loaded)
    useEffect(() => {
        const checkSaved = async () => {
        if (!user || !game) return;
        try {
            const savedGames = await getSavedGames(user.id);
            // Convert both to numbers for comparison
            const found = savedGames.some(g => Number(g.game_id) === Number(game.id));
            setIsSaved(found);
        } catch (err) {
            console.error(err);
        }
        };
        checkSaved();
    }, [user, game]);

    const handleSaveGame = async () => {
        if (!user) return;
        setSaving(true);
        try {
        // Ensure game.id is stored as a number
        await saveGame(user.id, Number(game.id), { name: game.name, image: game.background_image });
        setIsSaved(true);
        } catch (err) {
        console.error(err);
        alert("Failed to save game.");
        } finally {
        setSaving(false);
        }
    };

    if (loading) return <div style={{ backgroundColor: "#0b1b2b", color: "white", minHeight: "100vh", padding: "10px" }}><p>Loading game details...</p></div>;
    if (!game) return <div style={{ backgroundColor: "#0b1b2b", color: "white", minHeight: "100vh", padding: "10px" }}><p>Game not found.</p></div>;

    const maxLength = 400;
    const isLong = game.description_raw?.length > maxLength;
    const displayedText = expanded ? game.description_raw : game.description_raw?.slice(0, maxLength) + (isLong ? "..." : "");

    const genres = game.genres?.map(g => g.name).join(", ") || "N/A";
    const platforms = game.platforms?.map(p => p.platform.name).join(", ") || "N/A";

    return (
        <div style={{ backgroundColor: "#0b1b2b", color: "white", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ padding: "40px 60px", paddingLeft: "70px", paddingTop: "50px" }}>
            <div style={{ display: "flex", gap: "30px", alignItems: "flex-start", marginBottom: "30px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                <img src={game.background_image} alt={game.name} style={{ width: "250px", height: "300px", objectFit: "cover", objectPosition: "center", borderRadius: "8px", backgroundColor: "#222" }} />
                <button
                onClick={handleSaveGame}
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
                {user ? (saving ? "Saving..." : isSaved ? "Saved" : "Save Game") : "Log in to save game"}
                </button>
            </div>

            <div>
                <h2 style={{ marginBottom: "10px", fontSize: "40px" }}>{game.name}</h2>
                <p style={{ maxWidth: "900px", lineHeight: "1.6", fontSize: "18px", paddingTop: "10px" }}>
                {displayedText}{" "}
                {isLong && (
                    <span
                    onClick={() => setExpanded(!expanded)}
                    style={{ color: "#4db8ff", cursor: "pointer", fontWeight: "bold", marginLeft: "5px" }}
                    >
                    {expanded ? "Show less" : "Show more"}
                    </span>
                )}
                </p>
            </div>
            </div>

            <div style={{ display: "flex", fontSize: "16px", marginBottom: "40px", gap: "30px", paddingLeft: "70px" }}>
            <p>⭐ Rate: {game.rating}</p>
            <div style={{ paddingLeft: "85px", paddingRight: "20px" }}><p>🎭 Genre: {genres}</p></div>
            <p>🕹️ Platforms: {platforms}</p>
            </div>
        </div>
        </div>
    );
}