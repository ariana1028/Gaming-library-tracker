import {Col, Container, Row} from 'react-bootstrap';
import Navbar from '../components/NavBar';

export default function HomePage() {
    return <div
    style={{backgroundColor: "#142236", color: "white", minHeight: "100vh"}}>
        <Navbar />
        <h1>Gaming Library Tracker</h1>
        <p>description...</p>
    </div>
}