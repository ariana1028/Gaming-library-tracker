import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export default function Navbar() {
    const [searchTerm, setSearchTerm] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const {data} = await supabase.auth.getUser();
            const currentUser = data?.user || null;
            setUser(currentUser);

            if (currentUser) {
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", currentUser.id)
                    .single();
                
                if (profileData) {
                    setProfile(profileData);
                }
            }
        };
        getUser();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
            if (!session?.user) setProfile(null);
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        navigate("/Gaming-library-trackerGaming-library-tracker");
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/Gaming-library-tracker/dashboard?search=${encodeURIComponent(searchTerm.trim())}`);
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
        <Link 
            to={user ? "/Gaming-library-tracker/dashboard" : "/Gaming-library-tracker"} 
            style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '20px' }}
        >
            Gaming Library Tracker
        </Link>

        <div style={{ display: 'flex', gap: '25px', fontSize: '18px', alignItems: "center" }}>
            {user ? (<div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <div
                            onClick={() => navigate("/Gaming-library-tracker/profile")}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                                color: "white",
                                gap: "10px",
                            }}
                        >
                            {/* Avatar */}
                            <div
                                style={{
                                    width: "35px",
                                    height: "35px",
                                    borderRadius: "50%",
                                    backgroundColor: profile?.avatar_color || "#3d9ad7",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    fontWeight: "bold",
                                    fontSize: "16px",
                                    color: "white",
                                    textTransform: "uppercase",
                                }}
                            >
                                {user.user_metadata?.username
                                    ? user.user_metadata.username[0]
                                    : user.email[0]}
                            </div>

                            {/* Username */}
                            <span style={{ fontSize: "16px" }}>
                                {user.user_metadata?.username || user.email}
                            </span>
                        </div>

                        {/* Logout button */}
                        <button
                            onClick={handleLogout}
                            style={{
                                backgroundColor: "#4db8ff",
                                color: "white",
                                border: "none",
                                padding: "5px 10px",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontSize: "15px"
                            }}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    // Not logged in: show login/signup
                    <>
                        <Link
                            to="/Gaming-library-tracker/login"
                            style={{ color: "white", textDecoration: "none" }}
                        >
                            Log in
                        </Link>
                        <Link
                            to="/Gaming-library-tracker/signup"
                            style={{ color: "white", textDecoration: "none" }}
                        >
                            Sign up
                        </Link>
                    </>
                )}

                {/* Search box */}
                <form onSubmit={handleSearch}>
                    <label htmlFor="search-games" style={{
                        position: "absolute",
                        width: "1px",
                        height: "1px",
                        padding: "0",
                        margin: "-1px",
                        overflow: "hidden",
                        clip: "rect(0, 0, 0, 0)",
                        whiteSpace: "nowrap",
                        borderWidth: "0"
                    }}>
                        Search games:
                    </label>
                    <input
                        id="search-games"
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