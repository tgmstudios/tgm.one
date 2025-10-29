<template>
    <div id="globeContainer" ref="globeContainer"></div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { getProjects } from '@/lib/projectsLoader.js';

export default {
    name: 'GlobeWidget',
    setup() {
        const router = useRouter();
        const globeContainer = ref(null);
        let myGlobe;
        let animationHandle;
        const objectGroups = [];

        const handleResize = () => {
            if (myGlobe && globeContainer.value && globeContainer.value.getBoundingClientRect().width) {
                const { width, height } = globeContainer.value.getBoundingClientRect();
                myGlobe.width(width);
                myGlobe.height(height);
            }
        };
        
        const N = 20;
        const arcsData = [...Array(N).keys()].map(() => ({
            startLat: (Math.random() - 0.5) * 180,
            startLng: (Math.random() - 0.5) * 360,
            endLat: (Math.random() - 0.5) * 180,
            endLng: (Math.random() - 0.5) * 360,
            color: [['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)], ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]]
        }));

        const storedCoordinates = [];
        const MAX_ATTEMPTS = 500;

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

        const projectsObj = getProjects();
        const projects = Object.keys(projectsObj).map(key => {
            const project = projectsObj[key];
            const { lat, lng } = randomLatLng();
            return { ...project, lat, lng };
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
                    
            myGlobe.customLayerData(projects) // Layer for images and text
                .customThreeObject(d => {
                    const group = new THREE.Group();

                    // Create sprite for the icon
                    const iconTexture = new THREE.TextureLoader().load(d.icon);
                    const iconMaterial = new THREE.SpriteMaterial({ map: iconTexture });
                    const iconSprite = new THREE.Sprite(iconMaterial);
                    iconSprite.scale.set(5, 5, 1); // Adjust the size as needed
                    group.add(iconSprite);

                    // Create text canvas
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    context.font = 'Bold 32px Arial';

                    // Measure text width and adjust canvas size dynamically
                    const textMetrics = context.measureText(d.title);
                    canvas.width = textMetrics.width + 20;  // Add padding
                    canvas.height = 64;

                    // Re-draw the text after adjusting the canvas size
                    context.font = 'Bold 32px Arial';
                    context.fillStyle = 'white';
                    context.textAlign = 'center';
                    context.fillText(d.title, canvas.width / 2, 40);

                    // Create text texture and sprite
                    const textTexture = new THREE.CanvasTexture(canvas);
                    textTexture.needsUpdate = true;
                    const textMaterial = new THREE.SpriteMaterial({ map: textTexture });
                    const textSprite = new THREE.Sprite(textMaterial);
                    textSprite.scale.set(canvas.width / 40, canvas.height / 40, 1);  // Scale based on canvas size

                    // Position text below the icon
                    textSprite.position.y = -2.5;

                    // Add sprites to group
                    group.add(textSprite);
                    group.userData = {
                        iconSprite,
                        textSprite,
                        title: d.title
                    };
                    objectGroups.push(group);
                    return group;
                })
                .customThreeObjectUpdate((obj, d) => {
                    const { x, y, z } = myGlobe.getCoords(d.lat, d.lng, .5);
                    obj.position.set(x, y, z);

                    //const scale = 7;
                    const screenWidth = window.innerWidth;
                    const baseScale = 7;
                    const scaleFactor = screenWidth < 768 ? 0.8 : 1; // Adjust for mobile
                    const scale = baseScale * scaleFactor;
                    obj.scale.set(scale, scale, scale);
                })
                .onCustomLayerClick((d) => {
                    if (d.path) {
                        router.push(d.path);
                    }
                })
                .onCustomLayerHover(obj => {
                    if (obj) {
                        document.body.style.cursor = 'pointer';
                    } else {
                        document.body.style.cursor = 'default';
                    }
                }).customLayerLabel(null);

            const screenWidth = window.innerWidth;
            const altitude = screenWidth < 768 ? 3.5 : 2.5; // Reduced altitude for mobile
            myGlobe.pointOfView({ altitude: altitude })

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

            const isFrontFacing = (worldPosition) => {
                // For a sphere centered at origin, a point is front-facing if
                // the angle between camera position vector and point vector < 90°
                // i.e., dot(P, C) > 0 in world space.
                const camera = myGlobe.camera();
                return worldPosition.dot(camera.position) > 0;
            };

            const updateLabelCollisions = () => {
                if (!myGlobe) return;
                const renderer = myGlobe.renderer();
                if (!renderer) return;
                const width = renderer.domElement.clientWidth || window.innerWidth;
                const height = renderer.domElement.clientHeight || window.innerHeight;

                // grid cell size in pixels
                const cellSize = 48;
                const gridCols = Math.ceil(width / cellSize);
                const grid = new Map();

                const temp = new THREE.Vector3();
                const items = [];

                for (const group of objectGroups) {
                    if (!group || !group.userData) continue;
                    group.getWorldPosition(temp);
                    // back-face cull
                    const visibleSide = isFrontFacing(temp);
                    group.visible = visibleSide;
                    if (!visibleSide) continue;

                    const screen = projectToScreen(temp);

                    // heuristic radius based on title length and screen size
                    const title = group.userData.title || '';
                    const baseR = 18;
                    const perChar = 0.45;
                    const maxExtra = 22;
                    const r = baseR + Math.min(maxExtra, title.length * perChar);

                    items.push({ group, x: screen.x, y: screen.y, z: screen.z, r });
                }

                // sort nearer first (smaller z in NDC closer to camera)
                items.sort((a, b) => a.z - b.z);

                const taken = [];
                for (const it of items) {
                    const col = Math.floor(it.x / cellSize);
                    const row = Math.floor(it.y / cellSize);
                    const key = `${col}:${row}`;
                    const neighbors = [];
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            neighbors.push(grid.get(`${col + dx}:${row + dy}`) || []);
                        }
                    }
                    let overlaps = false;
                    for (const list of neighbors) {
                        for (const other of list) {
                            const dx = it.x - other.x;
                            const dy = it.y - other.y;
                            const rr = it.r + other.r;
                            if (dx * dx + dy * dy < rr * rr) {
                                overlaps = true;
                                break;
                            }
                        }
                        if (overlaps) break;
                    }

                    const { textSprite } = it.group.userData;
                    if (textSprite) {
                        textSprite.visible = !overlaps;
                    }

                    if (!overlaps) {
                        const bucket = grid.get(key) || [];
                        bucket.push({ x: it.x, y: it.y, r: it.r });
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

        return { globeContainer };
    }
}
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