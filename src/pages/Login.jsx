import { useState } from "react";
import { signInUser } from "../services/authService";
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

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInUser(email, password);
            navigate("/p79/dashboard");
        } catch (err) {
            setMessage(err.message);
        }
    };

    return (
        <div style={{ backgroundColor: "#0b1b2b", minHeight: "100vh", color: "white" }}>
            <Navbar />
            <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
                <h1>Log In</h1>
                <form onSubmit={handleLogin}>
                    <label htmlFor="login-email" style={labelStyle}>
                        Email:
                    </label>
                    <input
                        id="login-email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    
                    <label htmlFor="login-password" style={labelStyle}>
                        Password:
                    </label>
                    <input
                        id="login-password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    
                    <button type="submit" style={buttonStyle}>Log In</button>
                </form>
                <p>{message}</p>
            </div>
        </div>
    );
}