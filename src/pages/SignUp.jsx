import { useState } from "react";
import { signUpUser } from "../services/authService";
import Navbar from "../components/NavBar";
import { useNavigate } from "react-router-dom";

const inputStyle = {
    display: "block",
    marginBottom: "10px",
    padding: "8px",
    width: "100%",
    borderRadius: "5px",
    border: "none",
};

const buttonStyle = {
    backgroundColor: "#3d9ad7ff",
    color: "white",
    border: "none",
    padding: "10px",
    width: "100%",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
};

export default function Signup() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage("Passwords do not match!");
            return;
        }

        try {
        await signUpUser(email, username, password);
        setEmail("");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        navigate("/p79/dashboard");
        } catch (err) {
        setMessage(err.message);
        }
    };

    return (
        <div style={{ backgroundColor: "#0b1b2b", minHeight: "100vh", color: "white" }}>
        <Navbar />
        <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
            <h2>Sign Up</h2>
            <form onSubmit={handleSignup}>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={inputStyle}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
            />
            <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={inputStyle}
            />
            <button type="submit" style={buttonStyle}>Sign Up</button>
            </form>
            <p>{message}</p>
        </div>
        </div>
    );
    }
