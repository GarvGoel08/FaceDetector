import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FaceDetector from './pages/FaceDetector';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FaceDetector />} />
        <Route path="/Home" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;

