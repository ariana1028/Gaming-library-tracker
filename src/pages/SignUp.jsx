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

const labelStyle = {
    fontSize: "14px",
    color: "#aaa",
    display: "block",
    marginBottom: "5px"
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
            navigate("/dashboard");
        } catch (err) {
            setMessage(err.message);
        }
    };

    return (
        <div style={{ backgroundColor: "#0b1b2b", minHeight: "100vh", color: "white" }}>
            <Navbar />
            <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
                <h1>Sign Up</h1>
                <form onSubmit={handleSignup}>
                    <label htmlFor="signup-username" style={labelStyle}>
                        Username:
                    </label>
                    <input
                        id="signup-username"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    
                    <label htmlFor="signup-email" style={labelStyle}>
                        Email:
                    </label>
                    <input
                        id="signup-email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    
                    <label htmlFor="signup-password" style={labelStyle}>
                        Password:
                    </label>
                    <input
                        id="signup-password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    
                    <label htmlFor="signup-confirm" style={labelStyle}>
                        Confirm Password:
                    </label>
                    <input
                        id="signup-confirm"
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    
                    <button type="submit" style={buttonStyle}>Sign Up</button>
                </form>
                <p style={{ color: "#ff6b6b" }}>{message}</p>
            </div>
        </div>
    );
}