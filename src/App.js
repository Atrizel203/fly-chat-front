import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Registrarse from './pages/Registrarse';
import Principal from './pages/Principal';
import Login from './pages/Login'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Registrarse" element={<Registrarse />} />
        <Route path="/principal" element={<Principal />} />
  
      </Routes>
    </Router>
  );
}

export default App;
