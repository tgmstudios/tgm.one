<template>
    <ClientOnly>
        <div id="globeContainer" ref="globeContainer"></div>
        <template #fallback>
            <div class="w-full h-screen flex items-center justify-center">
                <div class="text-gray-400">Loading globe...</div>
            </div>
        </template>
    </ClientOnly>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import logoURL from '~/assets/logo.png';

const router = useRouter();
const globeContainer = ref(null);
let myGlobe;
let animationHandle;
const objectGroups = [];

const config = useRuntimeConfig()
const { createFoligoClient } = await import('~/lib/foligoClient.js')
const foligo = createFoligoClient({
  foligoBaseUrl: config.public.foligoBaseUrl,
  foligoProjectId: config.public.foligoProjectId,
  foligoSubdomain: config.public.foligoSubdomain
})

const { data: projectsData } = await useAsyncData(
  'globe-projects', 
  () => foligo.getProjects(),
  {
    lazy: true,
    server: false,
    default: () => []
  }
)

const handleResize = () => {
    if (myGlobe && globeContainer.value && globeContainer.value.getBoundingClientRect().width) {
        const { width, height } = globeContainer.value.getBoundingClientRect();
        myGlobe.width(width);
        myGlobe.height(height);
    }
};

const N = 20;
const arcColors = [
    ['#4fc3f7', '#29b6f6'], // Cyan
    ['#66bb6a', '#4caf50'], // Green
    ['#ab47bc', '#9c27b0'], // Purple
    ['#ffa726', '#ff9800'], // Orange
    ['#ef5350', '#f44336'], // Red
    ['#42a5f5', '#2196f3'], // Blue
];
const arcsData = [...Array(N).keys()].map(() => ({
    startLat: (Math.random() - 0.5) * 180,
    startLng: (Math.random() - 0.5) * 360,
    endLat: (Math.random() - 0.5) * 180,
    endLng: (Math.random() - 0.5) * 360,
    color: arcColors[Math.floor(Math.random() * arcColors.length)]
}));

const storedCoordinates = [];
const MAX_ATTEMPTS = 500;

// Memoize coordinates per project to avoid regenerating on every render
const projectCoordinates = new Map();

const randomLatLng = () => {
    const getRandom = (min, max) => Math.random() * (max - min) + min;
    
    const isFar = ({ lat, lng }) => {
        for (const { lat: l, lng: g } of storedCoordinates) {
            if (Math.hypot(lat - l, lng - g) < 50) return false;
        }
        return true;
    };

    let coord, attempts = 0;

    while (attempts < MAX_ATTEMPTS) {
        coord = {
            lat: parseFloat(getRandom(-40, 40).toFixed(4)),
            lng: parseFloat(getRandom(-180, 180).toFixed(4))
        };
        if (isFar(coord)) {
            storedCoordinates.push(coord);
            return coord;
        }
        attempts++;
    }

    console.warn("Could not find a suitable coordinate after maximum attempts. Icons will overlap!");
    return coord;
};

const projects = computed(() => {
    if (!projectsData.value) return []
    
    // Generate coordinates for new projects only
    const result = []
    for (const project of projectsData.value) {
        const projectId = project.id || project.slug || project._id || String(Math.random())
        
        // Reuse coordinates if already generated for this project
        let coords = projectCoordinates.get(projectId)
        if (!coords) {
            coords = randomLatLng()
            projectCoordinates.set(projectId, coords)
        }
        
        // Use featured image, then icon, then image, then default to high-quality logo
        const icon = project.featuredImage || project.featured_image || 
                     project.icon || 
                     project.image || 
                     logoURL
        
        result.push({
            ...project,
            title: project.title || project.name || 'Untitled Project',
            icon: icon,
            path: `/project/${project.slug || project.id}`,
            lat: coords.lat,
            lng: coords.lng
        })
    }
    return result
});

onMounted(async () => {
    const [{ default: Globe }, THREE] = await Promise.all([
        import('globe.gl'),
        import('three')
    ]);
    myGlobe = Globe()
    myGlobe(globeContainer.value)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
        .enablePointerInteraction(true)
        .width(globeContainer.value.clientWidth)
        .height(globeContainer.value.clientHeight)

    myGlobe.controls().autoRotate = true
    myGlobe.controls().autoRotateSpeed = 0.6
    myGlobe.controls().enableZoom = false
    myGlobe.controls().touches = false
    myGlobe.controls().enableRotate = false

    myGlobe.arcsData(arcsData)
        .arcColor('color')
        .arcDashLength(() => Math.random())
        .arcDashGap(() => Math.random())
        .arcDashAnimateTime(() => Math.random() * 4000 + 500)
        .arcStroke(() => 0.3)
    
    // Add starfield background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
    const starsVertices = [];
    for (let i = 0; i < 5000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    myGlobe.scene().add(stars);
    
    // Add enhanced lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    myGlobe.scene().add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    myGlobe.scene().add(directionalLight);
    
    // Add subtle point light (reduced intensity to not affect icon brightness)
    const pointLight = new THREE.PointLight(0x64a0ff, 0.1, 100);
    pointLight.position.set(0, 0, 0);
    myGlobe.scene().add(pointLight);
    
    // Set up custom layer configuration first
    myGlobe.customLayerData([]) // Start with empty array, will be updated when data loads
        .customThreeObject(d => {
            const group = new THREE.Group();

            // Create glow effect (halo behind icon)
            const glowCanvas = document.createElement('canvas');
            glowCanvas.width = 128;
            glowCanvas.height = 128;
            const glowContext = glowCanvas.getContext('2d');
            // Smaller radius for the glow (40 instead of 64)
            const gradient = glowContext.createRadialGradient(64, 64, 0, 64, 64, 40);
            // Reduced brightness - lower opacity values
            gradient.addColorStop(0, 'rgba(100, 150, 255, 0.3)');
            gradient.addColorStop(0.5, 'rgba(100, 150, 255, 0.15)');
            gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
            glowContext.fillStyle = gradient;
            glowContext.fillRect(0, 0, 128, 128);
            const glowTexture = new THREE.CanvasTexture(glowCanvas);
            const glowMaterial = new THREE.SpriteMaterial({ 
                map: glowTexture,
                transparent: true,
                blending: THREE.AdditiveBlending
            });
            const glowSprite = new THREE.Sprite(glowMaterial);
            // Smaller scale - reduced from 8 to 5.5
            glowSprite.scale.set(5.5, 5.5, 1);
            glowSprite.position.z = -0.1; // Behind the icon
            group.add(glowSprite);

            // Create sprite for the icon
            const iconTexture = new THREE.TextureLoader().load(d.icon);
            const iconMaterial = new THREE.SpriteMaterial({ 
                map: iconTexture,
                transparent: true,
                fog: false // Don't be affected by fog
            });
            // Ensure icon is not affected by scene lighting
            iconMaterial.color.setHex(0xffffff); // Maintain original colors
            const iconSprite = new THREE.Sprite(iconMaterial);
            iconSprite.scale.set(5, 5, 1); // Adjust the size as needed
            group.add(iconSprite);

            // Extract title before colon for display
            const displayTitle = d.title ? d.title.split(':')[0].trim() : '';

            // Create text canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            context.font = 'Bold 32px Arial';

            // Measure text width and adjust canvas size dynamically
            const textMetrics = context.measureText(displayTitle);
            canvas.width = textMetrics.width + 20;  // Add padding
            canvas.height = 64;

            // Re-draw the text after adjusting the canvas size
            context.font = 'Bold 32px Arial';
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.fillText(displayTitle, canvas.width / 2, 40);

            // Create text texture and sprite
            const textTexture = new THREE.CanvasTexture(canvas);
            textTexture.needsUpdate = true;
            const textMaterial = new THREE.SpriteMaterial({ 
                map: textTexture,
                transparent: true,
                fog: false, // Don't be affected by fog
                opacity: 1.0 // Initialize opacity
            });
            const textSprite = new THREE.Sprite(textMaterial);
            textSprite.scale.set(canvas.width / 40, canvas.height / 40, 1);  // Scale based on canvas size

            // Position text below the icon
            textSprite.position.y = -3;

            // Add sprites to group
            group.add(textSprite);
            group.userData = {
                iconSprite,
                textSprite,
                glowSprite,
                title: displayTitle, // Store truncated title for collision detection
                baseScale: 1,
                hoverScale: 1,
                pulsePhase: Math.random() * Math.PI * 2, // Random phase for pulsing
                opacity: 1.0, // Track opacity for smooth fade transitions
                textTargetOpacity: 1.0, // Track text visibility target for smooth transitions
                textBaseOpacity: 1.0 // Track text base opacity for stable transitions
            };
            objectGroups.push(group);
            return group;
        })
        .customThreeObjectUpdate((obj, d) => {
            const { x, y, z } = myGlobe.getCoords(d.lat, d.lng, .5);
            obj.position.set(x, y, z);

            const screenWidth = window.innerWidth;
            const baseScale = 7;
            const scaleFactor = screenWidth < 768 ? 0.8 : 1; // Adjust for mobile
            
            // Add subtle pulsing animation
            const time = Date.now() * 0.001;
            const pulse = 1 + Math.sin(time * 2 + obj.userData.pulsePhase) * 0.1;
            const hoverMultiplier = obj.userData.hoverScale || 1;
            const scale = baseScale * scaleFactor * pulse * hoverMultiplier;
            
            obj.scale.set(scale, scale, scale);
            
            // Get current opacity (default to 1 if not set)
            const opacity = obj.userData.opacity !== undefined ? obj.userData.opacity : 1.0;
            
            // Apply opacity to icon sprite
            if (obj.userData.iconSprite && obj.userData.iconSprite.material) {
                obj.userData.iconSprite.material.opacity = opacity;
            }
            
            // Apply opacity to text sprite
            if (obj.userData.textSprite && obj.userData.textSprite.material) {
                obj.userData.textSprite.material.opacity = opacity;
            }
            
            // Animate glow intensity with opacity
            if (obj.userData.glowSprite && obj.userData.glowSprite.material) {
                const baseGlowIntensity = 0.5 + Math.sin(time * 2 + obj.userData.pulsePhase) * 0.3;
                obj.userData.glowSprite.material.opacity = baseGlowIntensity * opacity;
            }
        })
        .onCustomLayerClick((d) => {
            if (d.path) {
                router.push(d.path);
            }
        })
        .onCustomLayerHover((obj, prevObj) => {
            // Reset previous hover
            if (prevObj && prevObj.userData) {
                prevObj.userData.hoverScale = 1;
            }
            
            // Apply hover effect
            if (obj && obj.userData) {
                document.body.style.cursor = 'pointer';
                obj.userData.hoverScale = 1.3; // Scale up on hover
                
                // Increase glow on hover (respect base opacity)
                if (obj.userData.glowSprite && obj.userData.glowSprite.material) {
                    const baseOpacity = obj.userData.opacity !== undefined ? obj.userData.opacity : 1.0;
                    // Reduced hover glow intensity to match lower base brightness
                    obj.userData.glowSprite.material.opacity = Math.min(0.6, baseOpacity * 1.3);
                }
            } else {
                document.body.style.cursor = 'default';
            }
        }).customLayerLabel(null);
    
    // Function to update projects on the globe
    const updateGlobeProjects = () => {
        if (myGlobe && projects.value && projects.value.length > 0) {
            myGlobe.customLayerData(projects.value) // Update with actual project data
        }
    }
    
    // Initial load if data is already available
    if (projects.value && projects.value.length > 0) {
        updateGlobeProjects()
    }
             
    // Watch for projects data changes and update globe
    watch(() => projects.value, (newProjects) => {
        if (newProjects && newProjects.length > 0 && myGlobe) {
            updateGlobeProjects()
        }
    }, { immediate: false, deep: true })

    const screenWidth = window.innerWidth;
    const altitude = screenWidth < 768 ? 3.5 : 2.5; // Reduced altitude for mobile
    myGlobe.pointOfView({ altitude: altitude })
    
    // Add atmospheric glow around the globe
    const atmosphereGeometry = new THREE.SphereGeometry(1.02, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            void main() {
                float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
            }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    myGlobe.scene().add(atmosphere);

    // Simple screen-space anti-collision for labels
    const projectToScreen = (vec3) => {
        const camera = myGlobe.camera();
        const renderer = myGlobe.renderer();
        const width = renderer.domElement.clientWidth;
        const height = renderer.domElement.clientHeight;
        const projected = vec3.clone().project(camera);
        return {
            x: (projected.x + 1) * 0.5 * width,
            y: (1 - (projected.y + 1) * 0.5) * height,
            z: projected.z
        };
    };

    const getFacingAngle = (worldPosition) => {
        // Calculate the dot product between world position and camera position
        // Returns a value from -1 (back) to 1 (front)
        const camera = myGlobe.camera();
        const normalizedPos = worldPosition.clone().normalize();
        const normalizedCam = camera.position.clone().normalize();
        return normalizedPos.dot(normalizedCam);
    };

    const updateLabelCollisions = () => {
        if (!myGlobe) return;
        const renderer = myGlobe.renderer();
        if (!renderer) return;
        const width = renderer.domElement.clientWidth || window.innerWidth;
        const height = renderer.domElement.clientHeight || window.innerHeight;

        // Adaptive grid cell size based on screen size
        const cellSize = Math.max(40, Math.min(60, width / 20));
        const grid = new Map();

        const temp = new THREE.Vector3();
        const items = [];

        for (const group of objectGroups) {
            if (!group || !group.userData) continue;
            group.getWorldPosition(temp);
            
            // Calculate facing angle (-1 = back, 1 = front)
            const facingAngle = getFacingAngle(temp);
            
            // Smooth fade based on angle
            // Start fading at 0.5 (about 60°), fully visible at 0.7 (45°), fully invisible at -0.1
            const fadeStart = 0.5;
            const fadeEnd = -0.1;
            let targetOpacity = 1.0;
            
            if (facingAngle < fadeStart) {
                // Fade out as it goes to the back
                targetOpacity = Math.max(0, Math.min(1, (facingAngle - fadeEnd) / (fadeStart - fadeEnd)));
            }
            
            // Smooth opacity transition (ease in/out)
            const currentOpacity = group.userData.opacity !== undefined ? group.userData.opacity : 1.0;
            const opacitySpeed = 0.15; // Transition speed
            const newOpacity = Math.max(0, Math.min(1, currentOpacity + (targetOpacity - currentOpacity) * opacitySpeed));
            group.userData.opacity = newOpacity;
            
            // Apply opacity directly to sprites here
            // Note: Text opacity is handled separately in collision detection
            if (group.userData.iconSprite && group.userData.iconSprite.material) {
                group.userData.iconSprite.material.opacity = newOpacity;
            }
            // Text opacity is set in collision detection, don't set it here to avoid conflicts
            if (group.userData.glowSprite && group.userData.glowSprite.material) {
                const time = Date.now() * 0.001;
                // Reduced brightness - lower base and smaller amplitude
                const baseGlowIntensity = 0.25 + Math.sin(time * 2 + (group.userData.pulsePhase || 0)) * 0.15;
                group.userData.glowSprite.material.opacity = baseGlowIntensity * newOpacity;
            }
            
            // Only process for collision if it's visible enough
            if (newOpacity < 0.01) {
                group.visible = false;
                // Initialize text visibility state if not exists
                if (group.userData.textSprite && group.userData.textTargetOpacity === undefined) {
                    group.userData.textTargetOpacity = 0;
                }
                continue;
            }
            
            group.visible = true;

            const screen = projectToScreen(temp);
            
            // Skip if outside screen bounds (with margin)
            const margin = 100;
            if (screen.x < -margin || screen.x > width + margin || 
                screen.y < -margin || screen.y > height + margin) {
                continue;
            }

            // Improved radius calculation
            // Account for icon size, text size, and add padding
            const title = group.userData.title || '';
            const screenWidth = window.innerWidth;
            const baseScale = screenWidth < 768 ? 5.6 : 7; // Match the scale used in customThreeObjectUpdate
            
            // Icon radius (scaled based on current scale)
            const iconRadius = (baseScale * 2.5) * (screenWidth < 768 ? 0.8 : 1);
            
            // Text radius calculation
            const baseTextR = 20;
            const perChar = 0.5;
            const maxExtra = 30;
            const textRadius = baseTextR + Math.min(maxExtra, title.length * perChar);
            
            // Combined radius with padding between items
            const padding = 8;
            const r = Math.max(iconRadius, textRadius) + padding;

            // Priority: closer items (smaller z) get higher priority
            // Also factor in opacity - more visible items get priority
            const priority = -screen.z * 1000 + newOpacity * 100;

            items.push({ 
                group, 
                x: screen.x, 
                y: screen.y, 
                z: screen.z, 
                r,
                priority,
                iconRadius,
                textRadius
            });
        }

        // Sort by priority (higher priority = closer/more visible = shown first)
        items.sort((a, b) => b.priority - a.priority);

        const taken = [];
        for (const it of items) {
            const col = Math.floor(it.x / cellSize);
            const row = Math.floor(it.y / cellSize);
            const key = `${col}:${row}`;
            
            // Check neighbors in a 3x3 grid
            const neighbors = [];
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const neighborKey = `${col + dx}:${row + dy}`;
                    const neighborList = grid.get(neighborKey) || [];
                    neighbors.push(...neighborList);
                }
            }
            
            // Check for overlaps with existing items
            // Add a small buffer to prevent flickering at boundaries
            const overlapBuffer = 2;
            let overlaps = false;
            let minOverlapDistance = Infinity;
            
            for (const other of neighbors) {
                const dx = it.x - other.x;
                const dy = it.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = it.r + other.r + overlapBuffer;
                
                if (distance < minDistance) {
                    overlaps = true;
                    minOverlapDistance = Math.min(minOverlapDistance, distance);
                }
            }

            // Smooth text visibility transition
            const { textSprite } = it.group.userData;
            if (textSprite && textSprite.material) {
                // Initialize target opacity if not exists
                if (it.group.userData.textTargetOpacity === undefined) {
                    it.group.userData.textTargetOpacity = overlaps ? 0 : 1;
                }
                
                // Use hysteresis to prevent flickering - only change target if significantly different
                const currentTarget = it.group.userData.textTargetOpacity;
                const newTarget = overlaps ? 0 : 1;
                
                // Only update target if change is significant (hysteresis threshold)
                if (Math.abs(newTarget - currentTarget) > 0.1) {
                    it.group.userData.textTargetOpacity = newTarget;
                }
                
                // Smooth transition towards target
                const targetTextOpacity = it.group.userData.textTargetOpacity;
                const baseTextOpacity = it.group.userData.textBaseOpacity !== undefined 
                    ? it.group.userData.textBaseOpacity 
                    : targetTextOpacity;
                
                // Update base opacity smoothly
                const textOpacitySpeed = 0.15; // Slightly slower for stability
                const newBaseOpacity = Math.max(0, Math.min(1, baseTextOpacity + (targetTextOpacity - baseTextOpacity) * textOpacitySpeed));
                it.group.userData.textBaseOpacity = newBaseOpacity;
                
                // Apply opacity (respect base group opacity) and clamp
                const finalOpacity = Math.max(0, Math.min(1, newBaseOpacity * it.group.userData.opacity));
                textSprite.material.opacity = finalOpacity;
                
                // Hide completely if opacity is very low
                textSprite.visible = finalOpacity > 0.02;
            }

            // Add to grid if no overlap (or if it's the closest item in case of conflict)
            if (!overlaps) {
                const bucket = grid.get(key) || [];
                bucket.push({ x: it.x, y: it.y, r: it.r, priority: it.priority });
                grid.set(key, bucket);
                taken.push(it);
            }
        }
    };

    const tick = () => {
        updateLabelCollisions();
        animationHandle = requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial resize
});
        
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    if (animationHandle) cancelAnimationFrame(animationHandle);
});
</script>

<style scoped>
#globeContainer {
    overflow-x:hidden;
    width: 100%; 
    height: 100vh;
}
@media (max-width: 768px) {
    #globeContainer {
       pointer-events: none;
    }
}
</style>