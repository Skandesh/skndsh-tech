import { BlogPost } from '../types/blog';

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '001',
    slug: 'debugging-distributed-state',
    date: '2024.11.24',
    title: 'THE GHOST IN THE SHELL: DEBUGGING DISTRIBUTED STATE',
    category: 'SYSTEMS',
    readTime: '12 MIN',
    content: [
      {
        type: 'header',
        content: 'THE LIE OF "NOW"',
        level: 1
      },
      {
        type: 'text',
        content: 'If you ask two computers "what time is it?", they will give you different answers. In a distributed system (like a real-time collaborative editor), this tiny discrepancy—even just a few milliseconds—is catastrophic. It breaks the concept of "now".'
      },
      {
        type: 'text',
        content: 'I recently built a collaborative text editor using CRDTs (Conflict-free Replicated Data Types). We hit a bug where users would see text flicker or disappear. The root cause? We trusted the system clock. We assumed that if Event A happened at 12:00:01 and Event B at 12:00:02, then A happened before B. In distributed systems, this assumption is false.'
      },
      {
        type: 'header',
        content: 'CAUSALITY VS. TIME',
        level: 2
      },
      {
        type: 'text',
        content: 'To fix this, we have to stop thinking about "time" (when something happened) and start thinking about "causality" (what caused what). If I reply to your message, my message is *caused by* yours. It doesn\'t matter what the clock says; my message *must* come after yours.'
      },
      {
        type: 'text',
        content: 'We track this using **Vector Clocks**. A Vector Clock isn\'t a single number; it\'s an array of counters, one for each node in the system. It looks like this: `[Alice: 2, Bob: 1]`.'
      },
      {
        type: 'code',
        language: 'typescript',
        filename: 'VectorClock.ts',
        code: `class VectorClock {
  private clocks: Map<string, number>;
  private nodeId: string;

  constructor(nodeId: string) {
    this.nodeId = nodeId;
    this.clocks = new Map();
    this.clocks.set(nodeId, 0);
  }

  // When we do something, we increment our own clock
  increment() {
    const current = this.clocks.get(this.nodeId) || 0;
    this.clocks.set(this.nodeId, current + 1);
    return this.clone();
  }

  // When we receive a message, we merge the clocks
  // This is the magic: we take the MAXIMUM of what we know vs what they know
  merge(other: VectorClock) {
    for (const [node, time] of other.clocks) {
      const localTime = this.clocks.get(node) || 0;
      this.clocks.set(node, Math.max(localTime, time));
    }
  }

  // Compare two clocks to see if they are concurrent (conflict!)
  // Returns: 'before', 'after', or 'concurrent'
  compare(other: VectorClock): 'before' | 'after' | 'concurrent' {
    let isBefore = false;
    let isAfter = false;

    // Check every node's time
    const allNodes = new Set([...this.clocks.keys(), ...other.clocks.keys()]);
    
    for (const node of allNodes) {
      const myTime = this.clocks.get(node) || 0;
      const theirTime = other.clocks.get(node) || 0;

      if (myTime < theirTime) isBefore = true;
      if (myTime > theirTime) isAfter = true;
    }

    // If I have some newer info AND they have some newer info,
    // neither happened "before" the other. They are concurrent.
    if (isBefore && isAfter) return 'concurrent';
    return isBefore ? 'before' : 'after';
  }
}`
      },
      {
        type: 'text',
        content: 'This `compare` function is the key. If two operations are "concurrent", it means neither caused the other—they happened independently (like two people talking at once). This is where the "ghost" lived. By detecting concurrency, we could deterministically resolve conflicts (e.g., sort by User ID) instead of letting network latency decide the winner.'
      }
    ]
  },
  {
    id: '002',
    slug: 'webgl-particle-system',
    date: '2024.10.15',
    title: 'RENDERING 1 MILLION PARTICLES: A GPGPU DEEP DIVE',
    category: 'GRAPHICS',
    readTime: '15 MIN',
    content: [
      {
        type: 'header',
        content: 'THE CPU BOTTLENECK',
        level: 1
      },
      {
        type: 'text',
        content: 'JavaScript is single-threaded. If you want to animate 1,000 particles, you loop through them, update `x` and `y`, and draw. Easy. But 1,000,000 particles? That loop takes 500ms. Your 60fps animation becomes a 2fps slideshow.'
      },
      {
        type: 'text',
        content: 'To hit 60fps, we have 16 milliseconds per frame. We can\'t touch the CPU. We need the GPU. But GPUs don\'t run JavaScript loops; they run Shaders. And Shaders don\'t have "arrays" of objects. They have Textures.'
      },
      {
        type: 'header',
        content: 'TEXTURES AS DATA',
        level: 2
      },
      {
        type: 'text',
        content: 'This is the core concept of GPGPU (General Purpose GPU). We usually think of a texture as an image (Red, Green, Blue). But to a computer, Red is just a number. So, we can store data in those colors.'
      },
      {
        type: 'text',
        content: 'Imagine a 1000x1000 image. That\'s 1,000,000 pixels. \n- `Red` channel = X position\n- `Green` channel = Y position\n- `Blue` channel = Z position\n- `Alpha` channel = Mass or Life'
      },
      {
        type: 'code',
        language: 'glsl',
        filename: 'simulation.frag',
        code: `// This shader runs for EVERY particle (pixel) simultaneously
uniform sampler2D uPositionTexture; // The "Old" positions
uniform sampler2D uVelocityTexture; // The velocities
uniform float uTime;

void main() {
  // 1. Where am I in the texture? (0.0 to 1.0)
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  
  // 2. Read my current state from the data texture
  vec4 posData = texture2D(uPositionTexture, uv);
  vec3 position = posData.rgb;
  float life = posData.a; // Stored in alpha channel

  // 3. Read my velocity
  vec3 velocity = texture2D(uVelocityTexture, uv).rgb;

  // 4. Apply Physics (The Math)
  // Curl noise for fluid motion
  vec3 noise = curlNoise(position * 0.1 + uTime * 0.1);
  velocity += noise * 0.01;
  
  // Euler integration: pos = pos + vel * dt
  position += velocity;

  // 5. Reset if dead
  life -= 0.01;
  if (life < 0.0) {
    position = vec3(0.0); // Reset to center
    life = 1.0;
  }

  // 6. Save the new state back to the texture (as a color!)
  gl_FragColor = vec4(position, life);
}`
      },
      {
        type: 'header',
        content: 'THE PING-PONG TECHNIQUE',
        level: 2
      },
      {
        type: 'text',
        content: 'There\'s a catch: You can\'t read from and write to the same texture at the same time. It creates a feedback loop. So we use "Ping-Pong Buffering".'
      },
      {
        type: 'text',
        content: 'We create **two** textures: A and B.\n\n**Frame 1:** Read from A -> Run Physics -> Write to B.\n**Frame 2:** Read from B -> Run Physics -> Write to A.\n\nWe swap them every frame. This allows us to maintain state entirely on the GPU, updating 1 million data points in parallel in less than 1 millisecond.'
      }
    ]
  },
  {
    id: '003',
    slug: 'physics-based-ui',
    date: '2024.09.02',
    title: 'THE MATH OF "FEEL": PHYSICS-BASED UI',
    category: 'DESIGN ENGINEERING',
    readTime: '10 MIN',
    content: [
      {
        type: 'header',
        content: 'WHY EASING ISN\'T ENOUGH',
        level: 1
      },
      {
        type: 'text',
        content: 'Most animations use "easing curves" (ease-in, ease-out). They are predefined paths: "Move from A to B in 0.5 seconds." But real life doesn\'t work like that. In real life, if I interrupt a moving object, it carries its momentum. Easing curves can\'t handle interruption—they just snap to a new path. It feels fake.'
      },
      {
        type: 'header',
        content: 'HOOKE\'S LAW',
        level: 2
      },
      {
        type: 'text',
        content: 'To make UI feel "real", we simulate a spring. A spring is defined by Hooke\'s Law: `F = -k * x`. The force pulling it back is proportional to how far you stretched it.'
      },
      {
        type: 'text',
        content: 'But a spring alone oscillates forever. We need friction (damping) to stop it. The full equation for our UI spring is:\n\n`Acceleration = (-Stiffness * Displacement) - (Damping * Velocity)`'
      },
      {
        type: 'code',
        language: 'typescript',
        filename: 'SpringPhysics.ts',
        code: `class Spring {
  private position: number = 0;
  private velocity: number = 0;
  private target: number = 0;
  
  // Configuration
  private stiffness: number = 120; // Tension (k)
  private damping: number = 20;    // Friction (b)
  private mass: number = 1;        // Mass (m)

  update(deltaTime: number) {
    // 1. Calculate distance to target
    const displacement = this.position - this.target;
    
    // 2. Calculate Spring Force (Hooke's Law)
    // F_spring = -k * x
    const springForce = -this.stiffness * displacement;
    
    // 3. Calculate Damping Force (Friction)
    // F_damping = -b * v
    const dampingForce = -this.damping * this.velocity;
    
    // 4. Newton's Second Law: F = ma -> a = F/m
    const acceleration = (springForce + dampingForce) / this.mass;
    
    // 5. Integrate Physics
    this.velocity += acceleration * deltaTime; // Update velocity
    this.position += this.velocity * deltaTime; // Update position
    
    return this.position;
  }
}`
      },
      {
        type: 'text',
        content: 'This code runs every frame (60 times a second). Unlike a CSS transition, this system is "interruptible". If the user grabs the object mid-animation, we just update the `velocity` based on their throw. The math handles the rest, preserving the momentum perfectly. This is why iOS animations feel so "heavy" and responsive compared to the web.'
      }
    ]
  }
];
