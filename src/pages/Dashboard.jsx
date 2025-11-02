import { useEffect, useState } from "react";
import { fetchGames } from "../services/rawgApi";

export default function Dashboard() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalGames, setTotalGames] = useState(0);

    const pageSize = 40;
    const maxButtons = 10;

    useEffect(() => {
        const loadGames = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchGames(page, pageSize);
            setGames(data.results || []);
            setTotalGames(data.count || 0);

            const pages = data.count ? Math.ceil(data.count / pageSize) : 1;
            setTotalPages(pages);
        } catch (err) {
            console.error(err);
            setError("Failed to load games");
        } finally {
            setLoading(false);
        }
        };

        loadGames();
    }, [page]);

    const handlePrev = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNext = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const getPageNumbers = () => {
        const pages = [];
        let start = Math.max(page - Math.floor(maxButtons / 2), 1);
        let end = start + maxButtons - 1;
        if (end > totalPages) {
        end = totalPages;
        start = Math.max(end - maxButtons + 1, 1);
        }
        for (let i = start; i <= end; i++) {
        pages.push(i);
        }
        return pages;
    };

    if (loading) return <p>Loading games...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div style={{ padding: "20px" }}>
        <h1>Game Dashboard</h1>
        <p>Total games: {totalGames.toLocaleString()}</p>

        <div
            style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            }}
        >
            {games.map((game) => (
            <div
                key={game.id}
                style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
            >
                {game.background_image && (
                <img
                    src={game.background_image}
                    alt={game.name}
                    style={{ width: "100%", height: "150px", objectFit: "cover" }}
                />
                )}
                <div style={{ padding: "10px" }}>
                <h3 style={{ margin: "0 0 5px 0" }}>{game.name}</h3>
                </div>
            </div>
            ))}
        </div>

        <br></br>
        <div style={{ marginBottom: "20px" }}>
            <button onClick={handlePrev} disabled={page === 1}>
            Prev
            </button>

            {getPageNumbers().map((p) => (
            <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                margin: "0 3px",
                fontWeight: page === p ? "bold" : "normal",
                }}
            >
                {p}
            </button>
            ))}

            {totalPages > maxButtons && page < totalPages - Math.floor(maxButtons / 2) && (
            <span style={{ margin: "0 5px" }}>...</span>
            )}

            <button onClick={handleNext} disabled={page === totalPages}>
            Next
            </button>
        </div>
        </div>
    );
    }
