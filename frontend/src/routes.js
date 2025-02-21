// filepath: frontend/src/routes.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HyperparameterForm from './components/HyperparameterForm';

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<HyperparameterForm />} />
      {/* Add other routes as needed */}
    </Routes>
  </Router>
);

export default AppRoutes;