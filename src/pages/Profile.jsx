import Navbar from "../components/NavBar"
import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

export default function Profile() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data?.user || null);
        };
        getUser();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    if (!user) {
        return (
            <div style={{color: "white", backgroundColor: "#0b1b2b", minHeight: "100vh" }}>
                <Navbar />
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: "#0b1b2b", color: "white", minHeight: "100vh"}}>
            <Navbar />
            
            {/* Profile Section */}
            <div style={{
                padding: "40px 50px",
                display: "flex",
                gap: "30px",
                alignItems: "center"
            }}>
                {/* Avatar */}
                <div
                    style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontWeight: "bold",
                        fontSize: "48px",
                        backgroundColor: "#3d9ad7",
                        textTransform: "uppercase",
                        flexShrink: 0
                    }}
                >
                    {user.user_metadata?.username
                        ? user.user_metadata.username[0]
                        : user.email[0]}
                </div>

                {/* User Info */}
                <div>
                    <h2 style={{ 
                        margin: "0 0 10px 0",
                        fontSize: "32px",
                        fontWeight: "normal"
                    }}>
                        {user.user_metadata?.username || user.email}
                    </h2>
                </div>
            </div>
        </div>
    );
}