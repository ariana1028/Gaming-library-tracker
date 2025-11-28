import { useEffect, useState } from "react";
import { fetchGames, searchGames } from "../services/rawgApi";
import { useNavigate , useSearchParams } from "react-router-dom";
import Navbar from "../components/NavBar";
import GameCard from "../components/GameCard";

export default function Dashboard() {
    const buttonStyle = (active) => ({
        padding: "8px 12px",
        borderRadius: "5px",
        backgroundColor: active ? "#555" : "#1f2a38",
        color: "white",
        cursor: active ? "not-allowed" : "pointer",
    });

    const pageButtonStyle = (p) => ({
        padding: "8px 12px",
        borderRadius: "5px",
        backgroundColor: page === p ? "#3b82f6" : "#1f2a38",
        color: page === p ? "white" : "#ccc",
        fontWeight: page === p ? "bold" : "normal",
        cursor: "pointer",
    });

    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalGames, setTotalGames] = useState(0);
    
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("search") || "";
    const navigate = useNavigate();
    const pageSize = 40;
    const maxButtons = 10;

    useEffect(() => {
        const loadGames = async () => {
            setLoading(true);
            setError(null);
            try {
                let data;
                if (searchQuery) {
                    data = await searchGames(searchQuery, page, pageSize);
                } else {
                    data = await fetchGames(page, pageSize);
                }

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
    }, [page, searchQuery]);

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

    if (loading) return (
        <div style={{ backgroundColor: "#0b1b2b", color: "white", minHeight: "100vh", padding: "10px"}}>
            <Navbar />
        <p>Loading games...</p>
        </div>
    )
    if (error) return <p>{error}</p>;

    return (
        <div style={{ backgroundColor: "#0b1b2b", minHeight: "100vh", color: "white"}}>
            <Navbar />

            <div style={{ padding: "20px", paddingBottom: "10px"}}>
                <h1>Game Dashboard</h1>
                <div style={{paddingTop: "10px"}}>
                    <p>Total games: {totalGames.toLocaleString()}</p>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "20px",
                    }}
                >
                    {games.map((game) => (
                        <GameCard key={game.id} game={game} />
                    ))}
                </div>

                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "5px",
                    flexWrap: "wrap",
                    marginTop: "20px",
                    overflowX: "auto",
                    padding: "10px 0",
                }}>
                    <button onClick={() => setPage(1)} disabled={page === 1} style={buttonStyle(page === 1)}>First</button>

                    <button onClick={handlePrev} disabled={page === 1} style={buttonStyle(page === 1)}>Prev</button>

                    {getPageNumbers().map((p) => (
                        <button key={p} onClick={() => setPage(p)} style={pageButtonStyle(p)}>
                            {p}
                        </button>
                    ))}

                    {totalPages > maxButtons &&
                        page < totalPages - Math.floor(maxButtons / 2) && (
                        <span style={{ margin: "0 5px" }}>...</span>
                    )}

                    <button onClick={handleNext} disabled={page === totalPages} style={buttonStyle(page === totalPages)}>Next</button>

                    <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={buttonStyle(page === totalPages)}>Last</button>
                </div>
            </div>
        </div>
    );
}