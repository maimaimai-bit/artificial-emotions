class EmotionVisualizer {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000);
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 45;

    // Add ambient and point lights for depth
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    const pointLight = new THREE.PointLight(0xffffff, 0.6);
    pointLight.position.set(0, 30, 30);
    this.scene.add(ambientLight, pointLight);

    this.particleSystems = {
      happy: this.createHappySystem(),    // Golden ratio spiral + sacred geometry
      sad: this.createSadSystem(),        // Oceanic depth + particle curtains
      angry: this.createAngrySystem(),    // Volcanic chaos + turbulent fields
      surprised: this.createSurprisedSystem(), // Cosmic expansion + radial bursts
      neutral: this.createNeutralSystem() // Gentle floating geometric forms
    };

    this.currentEmotion = 'neutral';
    this.scene.add(this.particleSystems.neutral);

    this.time = 0;
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Add ambient floating particles
    this.ambientParticles = this.createAmbientParticles();
    this.scene.add(this.ambientParticles);
  }

  createHappySystem() {
    const group = new THREE.Group();
    
    // Golden spiral particles
    const spiralCount = 8000;
    const spiralGeometry = new THREE.BufferGeometry();
    const spiralPositions = new Float32Array(spiralCount * 3);
    const spiralColors = new Float32Array(spiralCount * 3);
    
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    
    for (let i = 0; i < spiralCount; i++) {
      const t = i / spiralCount;
      const angle = goldenAngle * i;
      const radius = 40 * Math.sqrt(t);
      
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const z = (Math.random() - 0.5) * 10;
      
      spiralPositions[i * 3] = x;
      spiralPositions[i * 3 + 1] = y;
      spiralPositions[i * 3 + 2] = z;
      
      // Gradient from gold to warm white
      spiralColors[i * 3] = 1.0;
      spiralColors[i * 3 + 1] = 0.8 + t * 0.2;
      spiralColors[i * 3 + 2] = 0.4 + t * 0.4;
    }
    
    spiralGeometry.setAttribute('position', new THREE.BufferAttribute(spiralPositions, 3));
    spiralGeometry.setAttribute('color', new THREE.BufferAttribute(spiralColors, 3));
    
    const spiralMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8
    });
    
    const spiralSystem = new THREE.Points(spiralGeometry, spiralMaterial);
    spiralSystem.userData = { originalPositions: [...spiralPositions] };
    group.add(spiralSystem);
    
    // Sacred geometry overlay
    const geometryCount = 6;
    for (let i = 0; i < geometryCount; i++) {
      const radius = 5 + i * 3;
      const segments = 12 + i * 3;
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      
      for (let j = 0; j <= segments; j++) {
        const angle = (j / segments) * Math.PI * 2;
        positions.push(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        );
      }
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      
      const material = new THREE.LineBasicMaterial({
        color: 0xffdd88,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      
      const line = new THREE.LineLoop(geometry, material);
      line.userData = { radius, originalRotation: i * Math.PI / geometryCount };
      group.add(line);
    }
    
    // Add soft light rays
    const rayCount = 24;
    const rayGeometry = new THREE.BufferGeometry();
    const rayPositions = new Float32Array(rayCount * 2 * 3); // 2 points per ray
    const rayColors = new Float32Array(rayCount * 2 * 3);
    
    for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2;
        const innerRadius = 5;
        const outerRadius = 40;
        
        // Inner point
        rayPositions[i * 6] = Math.cos(angle) * innerRadius;
        rayPositions[i * 6 + 1] = Math.sin(angle) * innerRadius;
        rayPositions[i * 6 + 2] = 0;
        
        // Outer point
        rayPositions[i * 6 + 3] = Math.cos(angle) * outerRadius;
        rayPositions[i * 6 + 4] = Math.sin(angle) * outerRadius;
        rayPositions[i * 6 + 5] = 0;
        
        // Warm colors gradient
        rayColors[i * 6] = 1.0;     // Inner R
        rayColors[i * 6 + 1] = 0.8; // Inner G
        rayColors[i * 6 + 2] = 0.4; // Inner B
        
        rayColors[i * 6 + 3] = 1.0;     // Outer R
        rayColors[i * 6 + 4] = 0.6;     // Outer G
        rayColors[i * 6 + 5] = 0.2;     // Outer B
    }
    
    rayGeometry.setAttribute('position', new THREE.BufferAttribute(rayPositions, 3));
    rayGeometry.setAttribute('color', new THREE.BufferAttribute(rayColors, 3));
    
    const rayMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            
            void main() {
                vColor = color;
                vec3 pos = position;
                float angle = atan(pos.y, pos.x);
                float dist = length(pos.xy);
                
                // Add wave motion to rays
                float wave = sin(angle * 3.0 + time) * 0.2;
                pos.x += cos(angle) * wave * dist * 0.2;
                pos.y += sin(angle) * wave * dist * 0.2;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                gl_FragColor = vec4(vColor, 0.3);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    const rays = new THREE.LineSegments(rayGeometry, rayMaterial);
    group.add(rays);
    
    // Add floating light orbs
    const orbCount = 100;
    const orbGeometry = new THREE.BufferGeometry();
    const orbPositions = new Float32Array(orbCount * 3);
    const orbSizes = new Float32Array(orbCount);
    
    for (let i = 0; i < orbCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * 35;
        orbPositions[i * 3] = Math.cos(angle) * radius;
        orbPositions[i * 3 + 1] = Math.sin(angle) * radius;
        orbPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        
        orbSizes[i] = 0.5 + Math.random() * 1.5;
    }
    
    orbGeometry.setAttribute('position', new THREE.BufferAttribute(orbPositions, 3));
    orbGeometry.setAttribute('size', new THREE.BufferAttribute(orbSizes, 1));
    
    const orbMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            uniform float time;
            varying float vAlpha;
            
            void main() {
                vec3 pos = position;
                float angle = atan(pos.y, pos.x);
                float dist = length(pos.xy);
                
                // Spiral motion
                float t = time * 0.3;
                float spiral = dist * 0.1 + t;
                pos.x = cos(spiral) * dist;
                pos.y = sin(spiral) * dist;
                
                vAlpha = 0.3 + 0.2 * sin(time + dist * 0.2);
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (300.0 / length(mvPosition.xyz));
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying float vAlpha;
            
            void main() {
                vec2 center = gl_PointCoord - 0.5;
                float dist = length(center);
                
                // Soft glow
                float strength = exp(-dist * 4.0);
                float glow = exp(-dist * 2.0) * 0.4;
                
                vec3 color = mix(
                    vec3(1.0, 0.9, 0.5),  // Core color
                    vec3(1.0, 0.7, 0.3),  // Glow color
                    dist
                );
                
                float alpha = (strength + glow) * vAlpha;
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    const orbs = new THREE.Points(orbGeometry, orbMaterial);
    group.add(orbs);
    
    return group;
  }

  createSadSystem() {
    const group = new THREE.Group();
    
    // Particle curtains
    const curtainCount = 5;
    for (let c = 0; c < curtainCount; c++) {
      const particleCount = 2000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        const x = (Math.random() - 0.5) * 80;
        const y = (Math.random() - 0.5) * 80;
        const z = (Math.random() - 0.5) * 20 + c * 10;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Deep blue gradient
        const depth = Math.abs(y / 40);
        colors[i * 3] = 0.1 * depth;
        colors[i * 3 + 1] = 0.2 * depth;
        colors[i * 3 + 2] = 0.4 + 0.6 * depth;
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.6
      });
      
      const curtain = new THREE.Points(geometry, material);
      curtain.userData = { 
        originalPositions: [...positions],
        curtainIndex: c 
      };
      group.add(curtain);
    }
    
    // Add flowing wave lines
    const waveCount = 8;
    for (let i = 0; i < waveCount; i++) {
      const points = [];
      const segmentCount = 100;
      for (let j = 0; j < segmentCount; j++) {
        const x = (j - segmentCount/2) * 1.5;
        points.push(new THREE.Vector3(x, 0, 0));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x0066ff,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      
      const wave = new THREE.Line(geometry, material);
      wave.userData = { 
        waveIndex: i,
        amplitude: 2 + Math.random() * 3,
        frequency: 0.02 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2
      };
      group.add(wave);
    }
    
    return group;
  }

  createAngrySystem() {
    const group = new THREE.Group();
    
    // Turbulent particle field
    const particleCount = 10000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Fire gradient
      const t = radius / 40;
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.2 + 0.3 * t;
      colors[i * 3 + 2] = 0.1 * t;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    
    const particles = new THREE.Points(geometry, material);
    particles.userData = { originalPositions: [...positions] };
    group.add(particles);
    
    // Add energy rings
    const ringCount = 12;
    for (let i = 0; i < ringCount; i++) {
      const radius = 5 + i * 2;
      const geometry = new THREE.RingGeometry(radius, radius + 0.3, 64);
      const material = new THREE.MeshBasicMaterial({
        color: 0xff3300,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      
      const ring = new THREE.Mesh(geometry, material);
      ring.userData = { 
        ringIndex: i,
        rotationSpeed: (0.01 + Math.random() * 0.02) * (Math.random() > 0.5 ? 1 : -1)
      };
      group.add(ring);
    }
    
    return group;
  }

  createSurprisedSystem() {
    const group = new THREE.Group();
    
    // Radial burst particles
    const burstCount = 12;
    for (let b = 0; b < burstCount; b++) {
      const particleCount = 1000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      
      const angle = (b / burstCount) * Math.PI * 2;
      const baseDirection = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0);
      
      for (let i = 0; i < particleCount; i++) {
        const distance = Math.random() * 40;
        const spread = Math.random() * 0.2;
        const direction = baseDirection.clone()
          .add(new THREE.Vector3(spread, spread, spread))
          .normalize();
        
        positions[i * 3] = direction.x * distance;
        positions[i * 3 + 1] = direction.y * distance;
        positions[i * 3 + 2] = direction.z * distance;
        
        // Electric color gradient
        const t = distance / 40;
        colors[i * 3] = 0.7 + 0.3 * t;
        colors[i * 3 + 1] = 0.3 + 0.4 * t;
        colors[i * 3 + 2] = 1.0;
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true
      });
      
      const burst = new THREE.Points(geometry, material);
      burst.userData = { 
        originalPositions: [...positions],
        burstIndex: b 
      };
      group.add(burst);
    }
    
    // Add expanding rings
    const ringCount = 5;
    for (let i = 0; i < ringCount; i++) {
      const geometry = new THREE.RingGeometry(1, 1.5, 128);
      const material = new THREE.MeshBasicMaterial({
        color: 0x8866ff,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      
      const ring = new THREE.Mesh(geometry, material);
      ring.userData = { 
        ringIndex: i,
        expansionRate: 0.2 + Math.random() * 0.3,
        maxRadius: 20 + Math.random() * 20
      };
      group.add(ring);
    }
    
    return group;
  }

  createNeutralSystem() {
    const group = new THREE.Group();
    
    // 1. Fibonacci Spiral Field
    const spiralCount = 5;
    for (let s = 0; s < spiralCount; s++) {
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const phi = (1 + Math.sqrt(5)) / 2;
        const angleStep = 2 * Math.PI * phi;
        
        for (let i = 0; i < particleCount; i++) {
            const t = i / particleCount;
            const angle = angleStep * i;
            const radius = 40 * Math.pow(t, 0.5);
            const height = (s - spiralCount/2) * 10;
            
            positions[i * 3] = radius * Math.cos(angle);
            positions[i * 3 + 1] = height + (Math.random() - 0.5) * 5;
            positions[i * 3 + 2] = radius * Math.sin(angle);
            
            sizes[i] = 0.1 + 0.1 * (1 - t);
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                baseColor: { value: new THREE.Color(0xcccccc) }
            },
            vertexShader: `
                attribute float size;
                uniform float time;
                varying float vAlpha;
                varying vec2 vUv;
                
                void main() {
                    vec3 pos = position;
                    float wave = sin(time * 0.5 + length(position) * 0.05) * 2.0;
                    pos.y += wave;
                    
                    vAlpha = 0.3 + 0.2 * sin(time * 0.3 + length(position) * 0.1);
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (400.0 / length(mvPosition.xyz));
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 baseColor;
                varying float vAlpha;
                
                void main() {
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    
                    // Soft circular shape with exponential falloff
                    float strength = exp(-dist * 8.0);
                    
                    // Add a subtle glow effect
                    float glow = exp(-dist * 3.0) * 0.3;
                    
                    vec3 color = baseColor + glow;
                    float alpha = (strength + glow) * vAlpha;
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const spiral = new THREE.Points(geometry, material);
        spiral.rotation.x = Math.PI * 0.2;
        spiral.userData = { layer: s };
        group.add(spiral);
    }

    // 2. Flowing Grid
    const gridSize = 20;
    const gridPoints = [];
    for (let x = -gridSize; x <= gridSize; x += 2) {
        for (let z = -gridSize; z <= gridSize; z += 2) {
            gridPoints.push(new THREE.Vector3(x, 0, z));
        }
    }
    
    const gridGeometry = new THREE.BufferGeometry().setFromPoints(gridPoints);
    const gridMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            uniform float time;
            
            void main() {
                vec3 pos = position;
                float wave = sin(time + position.x * 0.1) * cos(time + position.z * 0.1) * 2.0;
                pos.y = wave;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = 2.0;
            }
        `,
        fragmentShader: `
            void main() {
                gl_FragColor = vec4(0.8, 0.8, 0.8, 0.2);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    
    const grid = new THREE.Points(gridGeometry, gridMaterial);
    group.add(grid);

    // 3. Orbital Rings
    const ringCount = 12;
    for (let i = 0; i < ringCount; i++) {
        const radius = 5 + i * 3;
        const geometry = new THREE.TorusGeometry(radius, 0.05, 16, 100);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending
        });
        
        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.x = Math.PI * 0.5;
        ring.userData = {
            radius,
            rotationSpeed: 0.0005 * (i % 2 ? 1 : -1),
            wobblePhase: i * Math.PI / ringCount
        };
        group.add(ring);
    }

    // 4. Cellular Automata Pattern
    const cellCount = 50;
    const cellGeometry = new THREE.BufferGeometry();
    const cellPositions = new Float32Array(cellCount * cellCount * 3);
    const cellStates = new Float32Array(cellCount * cellCount);
    
    for (let i = 0; i < cellCount; i++) {
        for (let j = 0; j < cellCount; j++) {
            const idx = (i * cellCount + j) * 3;
            cellPositions[idx] = (i - cellCount/2) * 0.5;
            cellPositions[idx + 1] = 0;
            cellPositions[idx + 2] = (j - cellCount/2) * 0.5;
            cellStates[i * cellCount + j] = Math.random();
        }
    }
    
    cellGeometry.setAttribute('position', new THREE.BufferAttribute(cellPositions, 3));
    cellGeometry.setAttribute('state', new THREE.BufferAttribute(cellStates, 1));
    
    const cellMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            attribute float state;
            uniform float time;
            varying float vState;
            
            void main() {
                vec3 pos = position;
                float wave = sin(time + state * 6.28) * 0.5;
                pos.y = wave;
                vState = state;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = 2.0;
            }
        `,
        fragmentShader: `
            varying float vState;
            
            void main() {
                gl_FragColor = vec4(0.8, 0.8, 0.8, 0.1 + 0.2 * vState);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    
    const cells = new THREE.Points(cellGeometry, cellMaterial);
    cells.position.y = -10;
    group.add(cells);

    return group;
  }

  createAmbientParticles() {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    // Create particles in a spherical volume
    for (let i = 0; i < particleCount * 3; i += 3) {
      // Random position in a sphere
      const radius = 50 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);
      
      // Random gentle velocity
      velocities[i] = (Math.random() - 0.5) * 0.05;
      velocities[i + 1] = (Math.random() - 0.5) * 0.05;
      velocities[i + 2] = (Math.random() - 0.5) * 0.05;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(0xffffff) }
        },
        vertexShader: `
            uniform float time;
            varying float vAlpha;
            
            void main() {
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = 3.0 * (300.0 / length(mvPosition.xyz));
                gl_Position = projectionMatrix * mvPosition;
                vAlpha = 0.3 + 0.2 * sin(time * 0.5 + length(position) * 0.1);
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            varying float vAlpha;
            
            void main() {
                vec2 center = gl_PointCoord - 0.5;
                float dist = length(center);
                
                // Soft circular shape
                float strength = exp(-dist * 8.0);
                
                // Add glow
                float glow = exp(-dist * 3.0) * 0.3;
                
                vec3 finalColor = color + glow;
                float alpha = (strength + glow) * vAlpha;
                
                gl_FragColor = vec4(finalColor, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    const points = new THREE.Points(geometry, material);
    points.userData = { 
        velocities,
        originalPositions: [...positions]
    };
    
    return points;
  }

  updateHappySystem(system, deltaTime) {
    this.time += deltaTime;
    
    // Update spiral system (first child)
    const spiralSystem = system.children[0];
    const positions = spiralSystem.geometry.attributes.position.array;
    const original = spiralSystem.userData.originalPositions;
    
    for (let i = 0; i < positions.length; i += 3) {
        const t = this.time + i * 0.0001;
        positions[i] = original[i] + Math.sin(t) * 0.3;
        positions[i + 1] = original[i + 1] + Math.cos(t) * 0.3;
        positions[i + 2] = original[i + 2] + Math.sin(t * 0.5) * 0.3;
    }
    spiralSystem.geometry.attributes.position.needsUpdate = true;
    
    // Update sacred geometry lines (children 1 to n-2)
    const geometryLines = system.children.slice(1, -2);
    geometryLines.forEach(line => {
        line.rotation.z = line.userData.originalRotation + this.time * 0.2;
        line.scale.setScalar(1 + Math.sin(this.time + line.userData.originalRotation) * 0.1);
    });
    
    // Update rays (second to last child)
    const rays = system.children[system.children.length - 2];
    if (rays && rays.material.uniforms) {
        rays.material.uniforms.time.value = this.time * 0.5;
    }
    
    // Update orbs (last child)
    const orbs = system.children[system.children.length - 1];
    if (orbs && orbs.material.uniforms) {
        orbs.material.uniforms.time.value = this.time;
    }
    
    // Gentle camera movement for more immersion
    this.camera.position.x = Math.sin(this.time * 0.2) * 5;
    this.camera.position.y = Math.cos(this.time * 0.15) * 5;
    this.camera.lookAt(0, 0, 0);
    
    // Scale up the system slightly
    system.scale.setScalar(1.1);
  }

  updateSadSystem(system, deltaTime) {
    this.time += deltaTime;
    
    // Update curtains
    system.children.forEach(child => {
      if (child instanceof THREE.Points) {
        const positions = child.geometry.attributes.position.array;
        const original = child.userData.originalPositions;
        
        for (let i = 0; i < positions.length; i += 3) {
          const t = this.time + i * 0.0001;
          positions[i + 1] -= 0.05;
          if (positions[i + 1] < -40) {
            positions[i + 1] = 40;
          }
          positions[i] = original[i] + Math.sin(t + child.userData.curtainIndex) * 0.5;
        }
        child.geometry.attributes.position.needsUpdate = true;
      } else if (child instanceof THREE.Line) {
        const positions = child.geometry.attributes.position.array;
        const wave = child.userData;
        
        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i];
          positions[i + 1] = Math.sin(
            x * wave.frequency + this.time + wave.phase
          ) * wave.amplitude;
        }
        child.geometry.attributes.position.needsUpdate = true;
      }
    });

    // Scale up the system slightly
    system.scale.setScalar(1.1);
    this.updateAmbientParticles(deltaTime);
  }

  updateAngrySystem(system, deltaTime) {
    this.time += deltaTime;
    
    // Update turbulent particles
    const particles = system.children[0];
    const positions = particles.geometry.attributes.position.array;
    const original = particles.userData.originalPositions;
    
    for (let i = 0; i < positions.length; i += 3) {
      const t = this.time + i * 0.0001;
      const noise = Math.sin(t * 2) * Math.cos(t * 3) * Math.sin(t * 5);
      
      positions[i] = original[i] + noise * 2;
      positions[i + 1] = original[i + 1] + noise * 2;
      positions[i + 2] = original[i + 2] + noise * 2;
    }
    particles.geometry.attributes.position.needsUpdate = true;
    
    // Update energy rings
    system.children.slice(1).forEach(ring => {
      ring.rotation.z += ring.userData.rotationSpeed;
      ring.rotation.x = Math.sin(this.time * 0.5) * 0.3;
      ring.rotation.y = Math.cos(this.time * 0.5) * 0.3;
    });

    // Scale up the system slightly
    system.scale.setScalar(1.1);
    this.updateAmbientParticles(deltaTime);
  }

  updateSurprisedSystem(system, deltaTime) {
    this.time += deltaTime;
    
    // Update burst particles
    system.children.forEach(child => {
      if (child instanceof THREE.Points) {
        const positions = child.geometry.attributes.position.array;
        const original = child.userData.originalPositions;
        const burstIndex = child.userData.burstIndex;
        
        for (let i = 0; i < positions.length; i += 3) {
          const t = this.time + burstIndex * 0.5;
          const scale = 1 + Math.sin(t) * 0.3;
          
          positions[i] = original[i] * scale;
          positions[i + 1] = original[i + 1] * scale;
          positions[i + 2] = original[i + 2] * scale;
        }
        child.geometry.attributes.position.needsUpdate = true;
      } else if (child instanceof THREE.Mesh) {
        const ring = child.userData;
        child.scale.setScalar(
          (Math.sin(this.time * ring.expansionRate) * 0.5 + 0.5) * ring.maxRadius
        );
        child.rotation.z = this.time * 0.2;
      }
    });

    // Scale up the system slightly
    system.scale.setScalar(1.1);
    this.updateAmbientParticles(deltaTime);
  }

  updateNeutralSystem(system, deltaTime) {
    this.time += deltaTime;
    
    // Update all shader uniforms
    system.children.forEach(child => {
        if (child.material.uniforms) {
            child.material.uniforms.time.value = this.time;
        }
    });
    
    // Gentle camera movement
    this.camera.position.x = Math.sin(this.time * 0.1) * 10;
    this.camera.position.y = Math.cos(this.time * 0.08) * 5 + 30;
    this.camera.lookAt(0, 0, 0);
    
    // Update orbital rings
    system.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.TorusGeometry) {
            const ring = child.userData;
            
            // Rotation
            child.rotation.y += ring.rotationSpeed;
            
            // Wobble effect
            const wobble = Math.sin(this.time * 0.5 + ring.wobblePhase) * 0.1;
            child.rotation.x = Math.PI * 0.5 + wobble;
            
            // Breathing scale
            const scale = 1 + Math.sin(this.time * 0.3 + ring.wobblePhase) * 0.05;
            child.scale.setScalar(scale);
        }
    });

    // Scale up the system slightly
    system.scale.setScalar(1.1);
    
    // Update ambient particles
    this.updateAmbientParticles(deltaTime);
  }

  updateAmbientParticles(deltaTime) {
    if (!this.ambientParticles) return;
    
    const positions = this.ambientParticles.geometry.attributes.position.array;
    const velocities = this.ambientParticles.userData.velocities;
    
    for (let i = 0; i < positions.length; i += 3) {
      // Update positions with velocities
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2];
      
      // Check boundaries and reset particles if they go too far
      const distance = Math.sqrt(
        positions[i] * positions[i] + 
        positions[i + 1] * positions[i + 1] + 
        positions[i + 2] * positions[i + 2]
      );
      
      if (distance > 80) {
        // Reset to original position
        const radius = 50;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
      }
    }
    
    this.ambientParticles.geometry.attributes.position.needsUpdate = true;
  }

  setEmotion(emotion) {
    if (this.currentEmotion === emotion) return;
    
    if (this.currentEmotion) {
      this.scene.remove(this.particleSystems[this.currentEmotion]);
    }
    
    // Map disgusted to angry
    if (emotion === 'disgusted') emotion = 'angry';
    
    this.currentEmotion = emotion;
    this.scene.add(this.particleSystems[emotion]);
  }

  animate() {
    requestAnimationFrame(this.animate);
    
    const deltaTime = 0.016;
    
    // Update ambient particles regardless of emotion
    this.updateAmbientParticles(deltaTime);
    
    if (this.currentEmotion) {
      switch (this.currentEmotion) {
        case 'happy':
          this.updateHappySystem(this.particleSystems.happy, deltaTime);
          break;
        case 'sad':
          this.updateSadSystem(this.particleSystems.sad, deltaTime);
          break;
        case 'angry':
          this.updateAngrySystem(this.particleSystems.angry, deltaTime);
          break;
        case 'surprised':
          this.updateSurprisedSystem(this.particleSystems.surprised, deltaTime);
          break;
        case 'neutral':
          this.updateNeutralSystem(this.particleSystems.neutral, deltaTime);
          break;
      }
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}

window.EmotionVisualizer = EmotionVisualizer;
