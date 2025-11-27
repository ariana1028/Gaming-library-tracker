import Navbar from '../components/NavBar';
import signupPic from '../assets/signup.png';
import dashboardPic from '../assets/dashboard.png';
import gameDetailPic from '../assets/gameDetail.png';
import profilePic from '../assets/profile.png';

export default function HomePage() {
    const sections = [
        {
            title: "Sign Up / Log In",
            description: "Create your account or log in to start tracking your gaming library. Secure and simple authentication with Supabase.",
            img: signupPic,
        },
        {
            title: "View Games in Dashboard",
            description: "Explore a curated list of games. Search your favorite games easily.",
            img: dashboardPic,
        },
        {
            title: "Game Detail",
            description: "Check game details, save your progress, and share your thoughts for each game.",
            img: gameDetailPic,
        },
        {
            title: "Profile: Your Games & Reviews",
            description: "View all your saved games and reviews in one place. Edit or remove entries whenever you like.",
            img: profilePic,
        },
    ];

    return (
        <div style={{ backgroundColor: "#142236", color: "white", minHeight: "100vh", paddingBottom: "50px" }}>
            <Navbar />
            <div style={{ 
                maxWidth: "1200px", 
                margin: "0 auto", 
                padding: "70px 15px 100px" 
            }}>
                <h1 style={{ 
                    textAlign: "center", 
                    paddingBottom: "20px",
                    marginBottom: "1rem"
                }}>
                    Gaming Library Tracker
                </h1>
                <p style={{ 
                    textAlign: "center", 
                    fontSize: "18px", 
                    color: "#ccc", 
                    marginBottom: "90px" 
                }}>
                    A simple tool to track your gaming collection, save progress, and review your favorite games.
                </p>

                {sections.map((section, idx) => (
                    <div 
                        key={idx} 
                        style={{ 
                            display: "flex", 
                            flexWrap: "wrap",
                            alignItems: "center",
                            marginBottom: "50px",
                            gap: "30px",
                            flexDirection: idx % 2 === 0 ? "row" : "row-reverse"
                        }}
                    >
                        <div style={{ 
                            flex: "1 1 45%", 
                            minWidth: "300px"
                        }}>
                            <img 
                                src={section.img} 
                                alt={section.title} 
                                style={{ 
                                    width: "100%", 
                                    borderRadius: "8px",
                                    display: "block"
                                }} 
                            />
                        </div>
                        <div style={{ 
                            flex: "1 1 45%", 
                            minWidth: "300px"
                        }}>
                            <h3 style={{ marginBottom: "15px" }}>{section.title}</h3>
                            <p style={{ color: "#ccc", lineHeight: "1.6" }}>{section.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}