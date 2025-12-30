import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BlogPostPage from './pages/BlogPostPage';
import LabPage from './pages/LabPage';
import ProfileSelector from './pages/ProfileSelector';
import ConstructionPage from './pages/ConstructionPage';
import SpiritualityHome from './pages/SpiritualityHome';
import SpiritualityPostPage from './pages/SpiritualityPostPage';
import CreativeHome from './pages/CreativeHome';
import CreativeWorkPage from './pages/CreativeWorkPage';
import TravelHome from './pages/TravelHome';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProfileSelector />} />
        <Route path="/tech" element={<Home />} />
        <Route path="/creative" element={<CreativeHome />} />
        <Route path="/creative/:slug" element={<CreativeWorkPage />} />
        <Route path="/travel" element={<TravelHome />} />
        <Route path="/spirituality" element={<SpiritualityHome />} />
        <Route path="/spirituality/:slug" element={<SpiritualityPostPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/lab" element={<LabPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;