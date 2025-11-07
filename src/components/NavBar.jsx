import { Link } from 'react-router-dom';

export default function Navbar() {
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

            <input
            type="text"
            placeholder="Search games..."
            style={{
                padding: "8px 12px",
                borderRadius: "4px",
                border: "none",
                outline: "none",
            }}
        />
        </div>
        
    </nav>
    );
}