import { Link } from "react-router-dom";

export default function NoMatch() {
    return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h2>That's a 404.</h2>
        <p>Uh oh, looks like you've taken a wrong turn!</p>
        <p>
        <Link to="/p79/" style={{ color: "blue", textDecoration: "underline" }}>
            Back to safety.
        </Link>
        </p>
    </div>
    );
}
