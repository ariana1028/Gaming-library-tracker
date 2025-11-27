import { Container, Row, Col, Image } from 'react-bootstrap';
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
            <Container style={{ paddingTop: "70px", paddingBottom: "100px" }}>
                <h1 className="mb-4" style={{ textAlign: "center", paddingBottom: "20px" }}>Gaming Library Tracker</h1>
                <p style={{ textAlign: "center", fontSize: "18px", color: "#ccc", marginBottom: "90px" }}>
                    A simple tool to track your gaming collection, save progress, and review your favorite games.
                </p>

                {sections.map((section, idx) => (
                    <Row key={idx} className="align-items-center mb-5">
                        {idx % 2 === 0 ? (
                            <>
                                <Col md={6}>
                                    <Image src={section.img} alt={section.title} fluid rounded />
                                </Col>
                                <Col md={6}>
                                    <h3>{section.title}</h3>
                                    <p style={{ color: "#ccc" }}>{section.description}</p>
                                </Col>
                            </>
                        ) : (
                            <>
                                <Col md={6} className="order-md-2">
                                    <Image src={section.img} alt={section.title} fluid rounded />
                                </Col>
                                <Col md={6} className="order-md-1">
                                    <h3>{section.title}</h3>
                                    <p style={{ color: "#ccc" }}>{section.description}</p>
                                </Col>
                            </>
                        )}
                    </Row>
                ))}
            </Container>
        </div>
    );
}