import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/p79/dashboard?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    return (
    <nav style={{ 
        background: 'black', 
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    }}>
        <Link to="/p79" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '20px' }}>
        Gaming Library Tracker
        </Link>

        <div style={{ display: 'flex', gap: '25px', fontSize: '18px', alignItems: "center" }}>
            <Link to="/p79/login" style={{ color: 'white', textDecoration: 'none'}}>
            Log in
            </Link>

            <Link to="/p79/signup" style={{ color: 'white', textDecoration: 'none' }}>
            Sign up
            </Link>

            <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search games..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: "8px 12px",
                            borderRadius: "4px",
                            border: "none",
                            outline: "none",
                        }}
                    />
                </form>
        </div>
        
    </nav>
    );
}