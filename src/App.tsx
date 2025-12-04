import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BlogPostPage from './pages/BlogPostPage';
import LabPage from './pages/LabPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/lab" element={<LabPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;