import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
    <nav style={{ 
        background: '#1a1a2e', 
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '20px' }}>
        Gaming Library Tracker
        </Link>

        <div style={{ display: 'flex', gap: '25px', fontSize: '18px' }}>
            <Link to="/p79/login" style={{ color: 'white', textDecoration: 'none'}}>
            Log in
            </Link>

            <Link to="/p79/signup" style={{ color: 'white', textDecoration: 'none' }}>
            Sign up
            </Link>
        </div>
    </nav>
    );
}