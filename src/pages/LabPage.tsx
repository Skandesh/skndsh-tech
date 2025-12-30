import React, { useState } from 'react';
import Background3D from '../components/Background3D';
import InteractiveLab from '../components/InteractiveLab';
import ConsistentHashingDemo from '../components/lab/ConsistentHashingDemo';
import RaftConsensusDemo from '../components/lab/RaftConsensusDemo';
import TransformerAttentionDemo from '../components/lab/TransformerAttentionDemo';
import BTreeDemo from '../components/lab/BTreeDemo';
import BloomFilterDemo from '../components/lab/BloomFilterDemo';
import WordEmbeddingsDemo from '../components/lab/WordEmbeddingsDemo';
import { useNavigate } from 'react-router-dom';
import { Zap, Circle, Crown, Sparkles, ArrowLeft, FlaskConical, Library, Filter, Map } from 'lucide-react';

type LabExperiment = 'index' | 'swarm' | 'consistent-hashing' | 'raft-consensus' | 'transformer-attention' | 'btree' | 'bloom-filter' | 'word-embeddings';

const EXPERIMENTS = [
  {
    id: 'swarm' as const,
    name: 'SWARM INTELLIGENCE',
    category: 'PHYSICS',
    description: 'Particle simulations exploring entropy, lattice structures, orbital mechanics, and wave propagation.',
    icon: Zap,
    status: 'ACTIVE',
  },
  {
    id: 'consistent-hashing' as const,
    name: 'CONSISTENT HASHING',
    category: 'DISTRIBUTED SYSTEMS',
    description: 'Interactive visualization comparing modulo vs ring-based hashing. See why adding a server breaks everything—or doesn&apos;t.',
    icon: Circle,
    status: 'ACTIVE',
  },
  {
    id: 'raft-consensus' as const,
    name: 'RAFT CONSENSUS',
    category: 'DISTRIBUTED SYSTEMS',
    description: 'Leader election, heartbeats, and network partitions. Kill servers, create chaos, watch democracy prevail.',
    icon: Crown,
    status: 'ACTIVE',
  },
  {
    id: 'transformer-attention' as const,
    name: 'TRANSFORMER ATTENTION',
    category: 'AI / NEURAL NETWORKS',
    description: 'See how words attend to each other. Type sentences, watch the investigation board light up with connections.',
    icon: Sparkles,
    status: 'ACTIVE',
  },
  {
    id: 'btree' as const,
    name: 'B-TREE EXPLORER',
    category: 'DATA STRUCTURES',
    description: 'Build your own B-tree. Insert keys, watch nodes split. See how databases index 100 million records in 3 disk reads.',
    icon: Library,
    status: 'ACTIVE',
  },
  {
    id: 'bloom-filter' as const,
    name: 'BLOOM FILTER',
    category: 'DATA STRUCTURES',
    description: 'Probabilistic set membership. Add names, check names, watch false positives emerge. The bouncer that never forgets.',
    icon: Filter,
    status: 'ACTIVE',
  },
  {
    id: 'word-embeddings' as const,
    name: 'WORD EMBEDDINGS',
    category: 'AI / MACHINE LEARNING',
    description: 'Explore the map of meaning. Try king - man + woman = queen. See how words cluster in semantic space.',
    icon: Map,
    status: 'NEW',
  },
];

const LabPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeExperiment, setActiveExperiment] = useState<LabExperiment>('index');

  if (activeExperiment === 'swarm') {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <Background3D />
        <InteractiveLab onBack={() => setActiveExperiment('index')} />
      </div>
    );
  }

  if (activeExperiment === 'consistent-hashing') {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <Background3D />
        <div className="relative z-50">
          <ConsistentHashingDemo onBack={() => setActiveExperiment('index')} />
        </div>
      </div>
    );
  }

  if (activeExperiment === 'raft-consensus') {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <Background3D />
        <div className="relative z-50">
          <RaftConsensusDemo onBack={() => setActiveExperiment('index')} />
        </div>
      </div>
    );
  }

  if (activeExperiment === 'transformer-attention') {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <Background3D />
        <div className="relative z-50">
          <TransformerAttentionDemo onBack={() => setActiveExperiment('index')} />
        </div>
      </div>
    );
  }

  if (activeExperiment === 'btree') {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <Background3D />
        <div className="relative z-50">
          <BTreeDemo onBack={() => setActiveExperiment('index')} />
        </div>
      </div>
    );
  }

  if (activeExperiment === 'bloom-filter') {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <Background3D />
        <div className="relative z-50">
          <BloomFilterDemo onBack={() => setActiveExperiment('index')} />
        </div>
      </div>
    );
  }

  if (activeExperiment === 'word-embeddings') {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <Background3D />
        <div className="relative z-50">
          <WordEmbeddingsDemo onBack={() => setActiveExperiment('index')} />
        </div>
      </div>
    );
  }

  // Lab Index
  return (
    <div className="relative min-h-screen bg-black text-white">
      <Background3D />
      <div className="relative z-50 min-h-screen p-6 md:p-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors group bg-black/50 px-3 py-2 border border-gray-800"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            EXIT LAB
          </button>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <FlaskConical className="w-5 h-5 text-green-500" />
              <h1 className="text-2xl font-display font-bold tracking-widest">R&D LAB</h1>
            </div>
            <span className="text-[9px] font-mono text-gray-500">EXPERIMENTAL_ZONE // SELECT_MODULE</span>
          </div>
        </div>

        {/* Experiment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {EXPERIMENTS.map(exp => {
            const Icon = exp.icon;
            return (
              <button
                key={exp.id}
                onClick={() => setActiveExperiment(exp.id)}
                className="group text-left bg-gray-900/30 border border-gray-800 hover:border-gray-600 p-6 transition-all hover:bg-gray-900/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 border border-gray-700 flex items-center justify-center group-hover:border-green-500 group-hover:text-green-500 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[9px] font-mono px-2 py-1 border ${
                    exp.status === 'NEW'
                      ? 'text-green-400 border-green-800 bg-green-950/30'
                      : 'text-gray-500 border-gray-800'
                  }`}>
                    {exp.status}
                  </span>
                </div>
                <h2 className="text-lg font-display font-bold mb-1 group-hover:text-green-500 transition-colors">
                  {exp.name}
                </h2>
                <span className="text-[10px] font-mono text-gray-600 block mb-3">{exp.category}</span>
                <p className="text-sm text-gray-400 leading-relaxed">{exp.description}</p>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-[10px] font-mono text-gray-600">
          MORE EXPERIMENTS COMING SOON // GRADIENT_DESCENT
        </div>
      </div>
    </div>
  );
};

export default LabPage;
