import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Plus, Minus, RefreshCw, Circle, Hash, Server, AlertTriangle, CheckCircle } from 'lucide-react';

// Simple hash function
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash;
};

// Generate consistent colors for servers
const SERVER_COLORS = [
  '#ef4444', // red
  '#22c55e', // green
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

interface KeyAssignment {
  key: string;
  hash: number;
  server: number;
  angle?: number; // For ring visualization
}

interface ServerNode {
  id: number;
  name: string;
  color: string;
  position?: number; // Ring position (0-360)
  vnodePositions?: number[]; // Virtual node positions
}

const ConsistentHashingDemo = ({ onBack }: { onBack: () => void }) => {
  const [serverCount, setServerCount] = useState(3);
  const [keys] = useState(() =>
    Array.from({ length: 100 }, (_, i) => `key:${i}`)
  );
  const [vnodes, setVnodes] = useState(1);
  const [showVnodes, setShowVnodes] = useState(false);
  const [lastChange, setLastChange] = useState<{ moved: { modulo: number; ring: number }; total: number } | null>(null);

  const prevServerCountRef = useRef(serverCount);
  const ringCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate servers
  const servers: ServerNode[] = Array.from({ length: serverCount }, (_, i) => ({
    id: i,
    name: String.fromCharCode(65 + i), // A, B, C, ...
    color: SERVER_COLORS[i % SERVER_COLORS.length],
    position: (hashString(`server-${i}`) % 360),
    vnodePositions: Array.from({ length: vnodes }, (_, v) =>
      (hashString(`server-${i}-vnode-${v}`) % 360)
    ),
  }));

  // Modulo hashing
  const getModuloAssignments = useCallback((): KeyAssignment[] => {
    return keys.map(key => {
      const hash = hashString(key);
      return {
        key,
        hash,
        server: hash % serverCount,
      };
    });
  }, [keys, serverCount]);

  // Consistent hashing (ring)
  const getRingAssignments = useCallback((): KeyAssignment[] => {
    // Build sorted ring positions
    const ringPositions: { position: number; serverId: number }[] = [];

    servers.forEach(server => {
      if (showVnodes && vnodes > 1) {
        server.vnodePositions?.forEach(pos => {
          ringPositions.push({ position: pos, serverId: server.id });
        });
      } else {
        ringPositions.push({ position: server.position!, serverId: server.id });
      }
    });

    ringPositions.sort((a, b) => a.position - b.position);

    return keys.map(key => {
      const hash = hashString(key);
      const keyPosition = hash % 360;

      // Walk clockwise to find server
      let assignedServer = ringPositions[0].serverId;
      for (const node of ringPositions) {
        if (node.position >= keyPosition) {
          assignedServer = node.serverId;
          break;
        }
      }

      return {
        key,
        hash,
        server: assignedServer,
        angle: keyPosition,
      };
    });
  }, [keys, servers, showVnodes, vnodes]);

  const moduloAssignments = getModuloAssignments();
  const ringAssignments = getRingAssignments();

  // Calculate distribution
  const getDistribution = (assignments: KeyAssignment[]) => {
    const dist: Record<number, number> = {};
    for (let i = 0; i < serverCount; i++) dist[i] = 0;
    assignments.forEach(a => dist[a.server]++);
    return dist;
  };

  const moduloDistribution = getDistribution(moduloAssignments);
  const ringDistribution = getDistribution(ringAssignments);

  // Track changes when server count changes
  useEffect(() => {
    if (prevServerCountRef.current !== serverCount) {
      const prevCount = prevServerCountRef.current;
      const newCount = serverCount;

      // Calculate how many keys moved with modulo
      let moduloMoved = 0;
      keys.forEach(key => {
        const hash = hashString(key);
        const oldServer = hash % prevCount;
        const newServer = hash % newCount;
        if (oldServer !== newServer) moduloMoved++;
      });

      // For ring, estimate based on theory (1/n keys move)
      const ringMoved = Math.round(keys.length / Math.max(prevCount, newCount));

      setLastChange({
        moved: { modulo: moduloMoved, ring: ringMoved },
        total: keys.length,
      });

      prevServerCountRef.current = serverCount;
    }
  }, [serverCount, keys]);

  // Draw ring visualization
  useEffect(() => {
    const canvas = ringCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = size / 2 - 40;

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);

    // Draw ring
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw tick marks
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for (let i = 0; i < 360; i += 30) {
      const angle = (i - 90) * Math.PI / 180;
      const x1 = center + Math.cos(angle) * (radius - 5);
      const y1 = center + Math.sin(angle) * (radius - 5);
      const x2 = center + Math.cos(angle) * (radius + 5);
      const y2 = center + Math.sin(angle) * (radius + 5);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Draw keys as small dots
    ringAssignments.forEach(assignment => {
      const angle = ((assignment.angle || 0) - 90) * Math.PI / 180;
      const x = center + Math.cos(angle) * (radius - 15);
      const y = center + Math.sin(angle) * (radius - 15);

      ctx.fillStyle = servers[assignment.server]?.color || '#666';
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Draw server nodes
    servers.forEach(server => {
      const positions = showVnodes && vnodes > 1
        ? server.vnodePositions || []
        : [server.position!];

      positions.forEach((pos, idx) => {
        const angle = (pos - 90) * Math.PI / 180;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;

        // Server node
        ctx.fillStyle = server.color;
        ctx.beginPath();
        ctx.arc(x, y, idx === 0 ? 12 : 6, 0, Math.PI * 2);
        ctx.fill();

        // Label (only for main node)
        if (idx === 0) {
          ctx.fillStyle = '#000';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(server.name, x, y);
        }
      });
    });

  }, [servers, ringAssignments, showVnodes, vnodes]);

  const addServer = () => {
    if (serverCount < 8) setServerCount(s => s + 1);
  };

  const removeServer = () => {
    if (serverCount > 1) setServerCount(s => s - 1);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-8 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors group bg-black/50 px-3 py-2 border border-gray-800"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          BACK TO LAB
        </button>
        <div className="text-right">
          <h1 className="text-xl font-display font-bold tracking-widest">CONSISTENT HASHING</h1>
          <span className="text-[9px] font-mono text-gray-500">DISTRIBUTED_SYSTEMS // RING</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex items-center gap-2 bg-gray-900/50 border border-gray-800 px-4 py-2">
          <Server className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-mono text-gray-400">SERVERS:</span>
          <button
            onClick={removeServer}
            disabled={serverCount <= 1}
            className="w-6 h-6 flex items-center justify-center border border-gray-700 hover:border-red-500 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-lg font-mono font-bold w-6 text-center">{serverCount}</span>
          <button
            onClick={addServer}
            disabled={serverCount >= 8}
            className="w-6 h-6 flex items-center justify-center border border-gray-700 hover:border-green-500 hover:text-green-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-2 bg-gray-900/50 border border-gray-800 px-4 py-2">
          <Hash className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-mono text-gray-400">KEYS:</span>
          <span className="text-lg font-mono font-bold">{keys.length}</span>
        </div>

        <button
          onClick={() => {
            setShowVnodes(!showVnodes);
            setVnodes(showVnodes ? 1 : 5);
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono border transition-colors ${
            showVnodes
              ? 'bg-purple-900/50 text-purple-400 border-purple-700'
              : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:border-gray-600'
          }`}
        >
          <Circle className="w-3 h-3" />
          VNODES: {showVnodes ? 'ON (5x)' : 'OFF'}
        </button>

        <button
          onClick={() => {
            setServerCount(3);
            setLastChange(null);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono border border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          RESET
        </button>
      </div>

      {/* Change Alert */}
      {lastChange && (
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="bg-red-950/30 border border-red-900/50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-mono text-red-400 mb-1">MODULO HASHING</div>
              <div className="text-2xl font-mono font-bold text-red-500">{lastChange.moved.modulo}</div>
              <div className="text-xs text-gray-500">keys moved ({Math.round(lastChange.moved.modulo / lastChange.total * 100)}%)</div>
            </div>
          </div>
          <div className="bg-green-950/30 border border-green-900/50 p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-mono text-green-400 mb-1">CONSISTENT HASHING</div>
              <div className="text-2xl font-mono font-bold text-green-500">~{lastChange.moved.ring}</div>
              <div className="text-xs text-gray-500">keys moved (~{Math.round(lastChange.moved.ring / lastChange.total * 100)}%)</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Visualization */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modulo Hashing */}
        <div className="border border-gray-800 bg-gray-900/20 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-display font-bold text-red-500">MODULO HASHING</h2>
              <span className="text-[10px] font-mono text-gray-500">hash(key) % serverCount</span>
            </div>
            <div className="text-xs font-mono text-red-400 bg-red-950/30 px-2 py-1 border border-red-900/50">
              NAIVE
            </div>
          </div>

          {/* Distribution Bars */}
          <div className="space-y-2 mb-4">
            {servers.map(server => (
              <div key={server.id} className="flex items-center gap-2">
                <span className="text-xs font-mono w-6" style={{ color: server.color }}>{server.name}</span>
                <div className="flex-1 h-6 bg-gray-900 border border-gray-800 relative overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${(moduloDistribution[server.id] / keys.length) * 100}%`,
                      backgroundColor: server.color,
                      opacity: 0.7,
                    }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white">
                    {moduloDistribution[server.id]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Visual representation */}
          <div className="flex-1 border border-gray-800 bg-black/50 p-4 flex flex-wrap gap-1 content-start overflow-hidden">
            {moduloAssignments.slice(0, 100).map((assignment, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-sm transition-all duration-300"
                style={{ backgroundColor: servers[assignment.server]?.color || '#333' }}
                title={`${assignment.key} → Server ${servers[assignment.server]?.name}`}
              />
            ))}
          </div>

          <div className="mt-4 text-[10px] font-mono text-gray-600 text-center">
            Adding a server reshuffles ~{Math.round((serverCount - 1) / serverCount * 100)}% of keys
          </div>
        </div>

        {/* Consistent Hashing */}
        <div className="border border-gray-800 bg-gray-900/20 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-display font-bold text-green-500">CONSISTENT HASHING</h2>
              <span className="text-[10px] font-mono text-gray-500">walk clockwise on ring</span>
            </div>
            <div className="text-xs font-mono text-green-400 bg-green-950/30 px-2 py-1 border border-green-900/50">
              RING
            </div>
          </div>

          {/* Distribution Bars */}
          <div className="space-y-2 mb-4">
            {servers.map(server => (
              <div key={server.id} className="flex items-center gap-2">
                <span className="text-xs font-mono w-6" style={{ color: server.color }}>{server.name}</span>
                <div className="flex-1 h-6 bg-gray-900 border border-gray-800 relative overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${(ringDistribution[server.id] / keys.length) * 100}%`,
                      backgroundColor: server.color,
                      opacity: 0.7,
                    }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white">
                    {ringDistribution[server.id]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Ring Canvas */}
          <div className="flex-1 border border-gray-800 bg-black/50 flex items-center justify-center">
            <canvas
              ref={ringCanvasRef}
              width={280}
              height={280}
              className="max-w-full"
            />
          </div>

          <div className="mt-4 text-[10px] font-mono text-gray-600 text-center">
            Adding a server moves only ~{Math.round(100 / serverCount)}% of keys
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-mono text-gray-500 border-t border-gray-900 pt-6">
        <div>
          ALGORITHM: KARGER_1997
        </div>
        <div>
          USED_BY: DYNAMO, CASSANDRA, REDIS
        </div>
        <div className="hidden md:block">
          BALANCE: {showVnodes ? 'OPTIMAL' : 'VARIABLE'}
        </div>
        <div className="hidden md:block text-right">
          VNODES: {showVnodes ? `${vnodes * serverCount} TOTAL` : 'DISABLED'}
        </div>
      </div>
    </div>
  );
};

export default ConsistentHashingDemo;
