import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Pause, SkipForward, RefreshCw, Zap, Crown, Users, AlertTriangle, CheckCircle, XCircle, Send } from 'lucide-react';

type ServerState = 'follower' | 'candidate' | 'leader' | 'dead';

interface LogEntry {
  term: number;
  command: string;
  committed: boolean;
}

interface Server {
  id: string;
  name: string;
  state: ServerState;
  term: number;
  votedFor: string | null;
  log: LogEntry[];
  electionTimeout: number;
  electionTimer: number;
  votes: number;
  color: string;
}

interface Message {
  id: string;
  from: string;
  to: string;
  type: 'vote-request' | 'vote-response' | 'heartbeat' | 'append-entries';
  term: number;
  granted?: boolean;
  progress: number;
}

const SERVER_COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'];
const HEARTBEAT_INTERVAL = 50;
const ELECTION_TIMEOUT_MIN = 150;
const ELECTION_TIMEOUT_MAX = 300;

const RaftConsensusDemo = ({ onBack }: { onBack: () => void }) => {
  const [servers, setServers] = useState<Server[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [partition, setPartition] = useState<Set<string>>(new Set());
  const tickRef = useRef(0);
  const commandCountRef = useRef(0);

  // Initialize servers
  const initServers = useCallback(() => {
    const newServers: Server[] = ['A', 'B', 'C', 'D', 'E'].map((name, i) => ({
      id: name,
      name,
      state: 'follower' as ServerState,
      term: 0,
      votedFor: null,
      log: [],
      electionTimeout: ELECTION_TIMEOUT_MIN + Math.random() * (ELECTION_TIMEOUT_MAX - ELECTION_TIMEOUT_MIN),
      electionTimer: 0,
      votes: 0,
      color: SERVER_COLORS[i],
    }));
    setServers(newServers);
    setMessages([]);
    setEventLog(['System initialized. All servers are followers.']);
    setPartition(new Set());
    tickRef.current = 0;
    commandCountRef.current = 0;
  }, []);

  useEffect(() => {
    initServers();
  }, [initServers]);

  // Check if two servers can communicate (not partitioned)
  const canCommunicate = useCallback((from: string, to: string): boolean => {
    if (partition.size === 0) return true;
    const fromInPartition = partition.has(from);
    const toInPartition = partition.has(to);
    return fromInPartition === toInPartition;
  }, [partition]);

  // Get majority count
  const getMajority = () => Math.floor(servers.length / 2) + 1;

  // Add event to log
  const logEvent = useCallback((event: string) => {
    setEventLog(prev => [...prev.slice(-19), event]);
  }, []);

  // Send a message
  const sendMessage = useCallback((from: string, to: string, type: Message['type'], term: number, granted?: boolean) => {
    if (!canCommunicate(from, to)) return;

    const msg: Message = {
      id: `${from}-${to}-${Date.now()}-${Math.random()}`,
      from,
      to,
      type,
      term,
      granted,
      progress: 0,
    };
    setMessages(prev => [...prev, msg]);
  }, [canCommunicate]);

  // Simulation tick
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      tickRef.current += 10 * speed;

      setServers(prevServers => {
        const newServers = prevServers.map(s => ({ ...s }));
        const leader = newServers.find(s => s.state === 'leader');

        newServers.forEach(server => {
          if (server.state === 'dead') return;

          // Leader sends heartbeats
          if (server.state === 'leader') {
            if (tickRef.current % Math.floor(HEARTBEAT_INTERVAL / speed) === 0) {
              newServers.forEach(other => {
                if (other.id !== server.id && other.state !== 'dead') {
                  sendMessage(server.id, other.id, 'heartbeat', server.term);
                }
              });
            }
          }

          // Followers/Candidates tick election timer
          if (server.state === 'follower' || server.state === 'candidate') {
            server.electionTimer += 10 * speed;

            // Election timeout - become candidate
            if (server.electionTimer >= server.electionTimeout) {
              server.state = 'candidate';
              server.term += 1;
              server.votedFor = server.id;
              server.votes = 1;
              server.electionTimer = 0;
              server.electionTimeout = ELECTION_TIMEOUT_MIN + Math.random() * (ELECTION_TIMEOUT_MAX - ELECTION_TIMEOUT_MIN);

              logEvent(`${server.name} started election for Term ${server.term}`);

              // Request votes from all other servers
              newServers.forEach(other => {
                if (other.id !== server.id && other.state !== 'dead') {
                  sendMessage(server.id, other.id, 'vote-request', server.term);
                }
              });
            }
          }
        });

        return newServers;
      });

      // Process messages
      setMessages(prevMessages => {
        const remaining: Message[] = [];

        prevMessages.forEach(msg => {
          msg.progress += 5 * speed;

          if (msg.progress >= 100) {
            // Message arrived - process it
            setServers(prevServers => {
              const newServers = prevServers.map(s => ({ ...s }));
              const recipient = newServers.find(s => s.id === msg.to);
              const sender = newServers.find(s => s.id === msg.from);

              if (!recipient || recipient.state === 'dead') return prevServers;

              if (msg.type === 'vote-request') {
                // Handle vote request
                if (msg.term > recipient.term) {
                  recipient.term = msg.term;
                  recipient.state = 'follower';
                  recipient.votedFor = null;
                }

                const grantVote = msg.term >= recipient.term &&
                  (recipient.votedFor === null || recipient.votedFor === msg.from);

                if (grantVote) {
                  recipient.votedFor = msg.from;
                  recipient.electionTimer = 0;
                  logEvent(`${recipient.name} voted for ${msg.from} in Term ${msg.term}`);
                }

                sendMessage(recipient.id, msg.from, 'vote-response', recipient.term, grantVote);
              }

              if (msg.type === 'vote-response' && sender) {
                const candidate = newServers.find(s => s.id === msg.from);
                if (candidate && candidate.state === 'candidate' && msg.granted) {
                  candidate.votes += 1;

                  // Check if won election
                  if (candidate.votes >= getMajority()) {
                    candidate.state = 'leader';
                    logEvent(`${candidate.name} won election! Now leader of Term ${candidate.term}`);

                    // Demote any other leaders
                    newServers.forEach(s => {
                      if (s.id !== candidate.id && s.state === 'leader') {
                        s.state = 'follower';
                      }
                    });
                  }
                }
              }

              if (msg.type === 'heartbeat') {
                if (msg.term >= recipient.term) {
                  recipient.term = msg.term;
                  recipient.state = 'follower';
                  recipient.electionTimer = 0;
                  recipient.votedFor = null;
                }
              }

              return newServers;
            });
          } else {
            remaining.push(msg);
          }
        });

        return remaining;
      });
    }, 10);

    return () => clearInterval(interval);
  }, [isRunning, speed, sendMessage, logEvent, canCommunicate]);

  // Kill a server
  const killServer = (id: string) => {
    setServers(prev => prev.map(s =>
      s.id === id ? { ...s, state: 'dead' as ServerState } : s
    ));
    logEvent(`SERVER ${id} HAS DIED!`);
  };

  // Revive a server
  const reviveServer = (id: string) => {
    setServers(prev => prev.map(s =>
      s.id === id ? {
        ...s,
        state: 'follower' as ServerState,
        electionTimer: 0,
        electionTimeout: ELECTION_TIMEOUT_MIN + Math.random() * (ELECTION_TIMEOUT_MAX - ELECTION_TIMEOUT_MIN),
        votedFor: null,
        votes: 0,
      } : s
    ));
    logEvent(`Server ${id} has recovered`);
  };

  // Toggle partition
  const togglePartition = (id: string) => {
    setPartition(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      if (next.size > 0 && next.size < 5) {
        logEvent(`Network partition! ${Array.from(next).join(', ')} isolated.`);
      } else if (next.size === 0 || next.size === 5) {
        logEvent('Network healed. All servers can communicate.');
        return new Set();
      }
      return next;
    });
  };

  // Send a client request
  const sendClientRequest = () => {
    const leader = servers.find(s => s.state === 'leader');
    if (!leader) {
      logEvent('No leader available. Request failed.');
      return;
    }

    commandCountRef.current += 1;
    const cmd = `SET X = ${commandCountRef.current * 100}`;

    setServers(prev => prev.map(s => {
      if (s.id === leader.id) {
        return {
          ...s,
          log: [...s.log, { term: s.term, command: cmd, committed: false }]
        };
      }
      return s;
    }));

    logEvent(`Client sent: "${cmd}" to leader ${leader.name}`);

    // Simulate replication (simplified)
    setTimeout(() => {
      const aliveFollowers = servers.filter(s => s.state !== 'dead' && s.id !== leader.id && canCommunicate(leader.id, s.id));
      const acks = aliveFollowers.length + 1; // +1 for leader itself

      if (acks >= getMajority()) {
        setServers(prev => prev.map(s => {
          if (s.log.length > 0) {
            const newLog = [...s.log];
            newLog[newLog.length - 1] = { ...newLog[newLog.length - 1], committed: true };
            return { ...s, log: newLog };
          }
          return s;
        }));
        logEvent(`Command committed! ${acks}/${servers.length} acknowledgments.`);
      } else {
        logEvent(`Command NOT committed. Only ${acks}/${servers.length} acknowledgments.`);
      }
    }, 500 / speed);
  };

  const getStateColor = (state: ServerState) => {
    switch (state) {
      case 'leader': return 'text-yellow-400 border-yellow-500';
      case 'candidate': return 'text-orange-400 border-orange-500';
      case 'follower': return 'text-green-400 border-green-500';
      case 'dead': return 'text-gray-600 border-gray-700 opacity-50';
    }
  };

  const getStateIcon = (state: ServerState) => {
    switch (state) {
      case 'leader': return <Crown className="w-5 h-5" />;
      case 'candidate': return <Zap className="w-5 h-5" />;
      case 'follower': return <Users className="w-5 h-5" />;
      case 'dead': return <XCircle className="w-5 h-5" />;
    }
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
          <h1 className="text-xl font-display font-bold tracking-widest">RAFT CONSENSUS</h1>
          <span className="text-[9px] font-mono text-gray-500">DISTRIBUTED_SYSTEMS // PARLIAMENT</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono border transition-colors ${
            isRunning
              ? 'bg-red-900/50 text-red-400 border-red-700'
              : 'bg-green-900/50 text-green-400 border-green-700'
          }`}
        >
          {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {isRunning ? 'PAUSE' : 'RUN'}
        </button>

        <div className="flex items-center gap-2 bg-gray-900/50 border border-gray-800 px-4 py-2">
          <span className="text-xs font-mono text-gray-400">SPEED:</span>
          {[1, 2, 5].map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-1 text-xs font-mono border transition-colors ${
                speed === s
                  ? 'bg-white text-black border-white'
                  : 'border-gray-700 hover:border-gray-500'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        <button
          onClick={sendClientRequest}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono border border-blue-700 bg-blue-900/50 text-blue-400 hover:bg-blue-900 transition-colors"
        >
          <Send className="w-3 h-3" />
          SEND WRITE
        </button>

        <button
          onClick={initServers}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono border border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          RESET
        </button>
      </div>

      {/* Partition indicator */}
      {partition.size > 0 && partition.size < 5 && (
        <div className="mb-4 bg-red-950/30 border border-red-900/50 p-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="text-xs font-mono text-red-400">
            NETWORK PARTITION ACTIVE: {Array.from(partition).join(', ')} isolated from {
              servers.filter(s => !partition.has(s.id)).map(s => s.id).join(', ')
            }
          </span>
        </div>
      )}

      {/* Main visualization */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Server cluster */}
        <div className="lg:col-span-2 border border-gray-800 bg-gray-900/20 p-6 relative overflow-hidden">
          <div className="absolute top-4 left-4 text-[10px] font-mono text-gray-600">
            CLUSTER // 5 NODES
          </div>

          {/* Servers in a pentagon layout */}
          <div className="relative h-80 md:h-96">
            {servers.map((server, i) => {
              const angle = (i * 72 - 90) * (Math.PI / 180);
              const radius = 120;
              const centerX = 50;
              const centerY = 50;
              const x = centerX + Math.cos(angle) * (radius / 3);
              const y = centerY + Math.sin(angle) * (radius / 3);

              return (
                <div
                  key={server.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                    partition.has(server.id) ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-black' : ''
                  }`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div
                    className={`w-20 h-20 md:w-24 md:h-24 border-2 ${getStateColor(server.state)} bg-black/80 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105`}
                    onClick={() => server.state === 'dead' ? reviveServer(server.id) : killServer(server.id)}
                  >
                    {getStateIcon(server.state)}
                    <span className="text-lg font-mono font-bold mt-1">{server.name}</span>
                    <span className="text-[8px] font-mono text-gray-500 uppercase">{server.state}</span>
                  </div>

                  {/* Term badge */}
                  <div className="absolute -top-2 -right-2 bg-gray-900 border border-gray-700 px-1.5 py-0.5 text-[8px] font-mono">
                    T{server.term}
                  </div>

                  {/* Partition toggle */}
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePartition(server.id); }}
                    className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-mono px-2 py-0.5 border transition-colors ${
                      partition.has(server.id)
                        ? 'bg-red-900 border-red-700 text-red-400'
                        : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500'
                    }`}
                  >
                    {partition.has(server.id) ? 'ISOLATED' : 'PARTITION'}
                  </button>

                  {/* Election timer bar */}
                  {server.state !== 'dead' && server.state !== 'leader' && (
                    <div className="absolute -bottom-6 left-0 right-0 h-1 bg-gray-800">
                      <div
                        className="h-full bg-orange-500 transition-all"
                        style={{ width: `${(server.electionTimer / server.electionTimeout) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Messages */}
            {messages.map(msg => {
              const fromServer = servers.find(s => s.id === msg.from);
              const toServer = servers.find(s => s.id === msg.to);
              if (!fromServer || !toServer) return null;

              const fromIdx = servers.indexOf(fromServer);
              const toIdx = servers.indexOf(toServer);

              const fromAngle = (fromIdx * 72 - 90) * (Math.PI / 180);
              const toAngle = (toIdx * 72 - 90) * (Math.PI / 180);
              const radius = 120;

              const fromX = 50 + Math.cos(fromAngle) * (radius / 3);
              const fromY = 50 + Math.sin(fromAngle) * (radius / 3);
              const toX = 50 + Math.cos(toAngle) * (radius / 3);
              const toY = 50 + Math.sin(toAngle) * (radius / 3);

              const currentX = fromX + (toX - fromX) * (msg.progress / 100);
              const currentY = fromY + (toY - fromY) * (msg.progress / 100);

              const msgColor = msg.type === 'vote-request' ? '#f59e0b' :
                              msg.type === 'vote-response' ? (msg.granted ? '#22c55e' : '#ef4444') :
                              '#3b82f6';

              return (
                <div
                  key={msg.id}
                  className="absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{
                    left: `${currentX}%`,
                    top: `${currentY}%`,
                    backgroundColor: msgColor,
                    boxShadow: `0 0 8px ${msgColor}`,
                  }}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-4 text-[9px] font-mono text-gray-500">
            <div className="flex items-center gap-1"><Crown className="w-3 h-3 text-yellow-400" /> LEADER</div>
            <div className="flex items-center gap-1"><Zap className="w-3 h-3 text-orange-400" /> CANDIDATE</div>
            <div className="flex items-center gap-1"><Users className="w-3 h-3 text-green-400" /> FOLLOWER</div>
            <div className="flex items-center gap-1"><XCircle className="w-3 h-3 text-gray-600" /> DEAD</div>
          </div>

          <div className="absolute bottom-4 right-4 text-[9px] font-mono text-gray-600">
            CLICK TO KILL/REVIVE
          </div>
        </div>

        {/* Event log */}
        <div className="border border-gray-800 bg-gray-900/20 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs font-mono font-bold tracking-widest">EVENT LOG</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[10px]">
            {eventLog.map((event, i) => (
              <div
                key={i}
                className={`py-1 border-l-2 pl-2 ${
                  event.includes('DIED') ? 'border-red-500 text-red-400' :
                  event.includes('won') || event.includes('leader') ? 'border-yellow-500 text-yellow-400' :
                  event.includes('voted') ? 'border-green-500 text-green-400' :
                  event.includes('partition') ? 'border-orange-500 text-orange-400' :
                  event.includes('committed') ? 'border-blue-500 text-blue-400' :
                  'border-gray-700 text-gray-400'
                }`}
              >
                {event}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-gray-800 space-y-2 text-[10px] font-mono">
            <div className="flex justify-between">
              <span className="text-gray-500">CURRENT TERM:</span>
              <span className="text-white">{Math.max(...servers.map(s => s.term))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">LEADER:</span>
              <span className="text-yellow-400">{servers.find(s => s.state === 'leader')?.name || 'NONE'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">ALIVE:</span>
              <span className="text-green-400">{servers.filter(s => s.state !== 'dead').length}/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">MAJORITY:</span>
              <span className="text-white">{getMajority()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-mono text-gray-500 border-t border-gray-900 pt-6">
        <div>ALGORITHM: RAFT_2014</div>
        <div>USED_BY: ETCD, COCKROACHDB, CONSUL</div>
        <div className="hidden md:block">HEARTBEAT: {HEARTBEAT_INTERVAL}ms</div>
        <div className="hidden md:block text-right">TIMEOUT: {ELECTION_TIMEOUT_MIN}-{ELECTION_TIMEOUT_MAX}ms</div>
      </div>
    </div>
  );
};

export default RaftConsensusDemo;
