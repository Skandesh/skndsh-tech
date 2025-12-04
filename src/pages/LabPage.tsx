import React from 'react';
import Background3D from '../components/Background3D';
import InteractiveLab from '../components/InteractiveLab';
import { useNavigate } from 'react-router-dom';

const LabPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-black text-white">
      <Background3D />
      <InteractiveLab onBack={() => navigate('/')} />
    </div>
  );
};

export default LabPage;
