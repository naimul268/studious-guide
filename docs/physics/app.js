import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

const canvas = document.getElementById('three-canvas');
const intro = document.getElementById('intro');
const dot = document.getElementById('dot');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);
renderer.outputEncoding = THREE.sRGBEncoding;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.006);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 5, 16);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.3;
controls.enablePan = false;
controls.minDistance = 6;
controls.maxDistance = 30;

const ambientLight = new THREE.AmbientLight(0x999999, 0.75);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1.8, 120);
pointLight.position.set(8, 14, 12);
scene.add(pointLight);

const bloomPoint = new THREE.PointLight(0xffb86c, 1.6, 40);
bloomPoint.position.set(-5, 6, 6);
scene.add(bloomPoint);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80),
  new THREE.MeshStandardMaterial({ color: 0x080a15, roughness: 0.88, metalness: 0.05 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -3.2;
scene.add(ground);

const torus = new THREE.Mesh(
  new THREE.TorusKnotGeometry(2.2, 0.55, 260, 32),
  new THREE.MeshStandardMaterial({
    color: 0x83c1ff,
    metalness: 0.8,
    roughness: 0.18,
    emissive: 0x0f3b85,
    emissiveIntensity: 0.28,
  })
);
torus.position.y = 1.4;
scene.add(torus);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(5.2, 0.08, 20, 140),
  new THREE.MeshStandardMaterial({ color: 0x3c5d9c, roughness: 0.22, metalness: 0.4 })
);
ring.rotation.x = Math.PI / 2;
ring.position.y = 0.4;
scene.add(ring);

const particleGeometry = new THREE.BufferGeometry();
const particleCount = 220;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  positions[i * 3 + 0] = THREE.MathUtils.randFloatSpread(28);
  positions[i * 3 + 1] = THREE.MathUtils.randFloat(0, 12);
  positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(28);
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particles = new THREE.Points(
  particleGeometry,
  new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.09,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
  })
);
scene.add(particles);

const composer = new EffectComposer(renderer);
composer.setSize(window.innerWidth, window.innerHeight);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.35, 0.9);
bloomPass.threshold = 0.05;
bloomPass.strength = 1.4;
bloomPass.radius = 0.45;
composer.addPass(bloomPass);

const fxaaPass = new ShaderPass(FXAAShader);
fxaaPass.material.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
composer.addPass(fxaaPass);

const clock = new THREE.Clock();
let running = false;

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  fxaaPass.material.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
}

window.addEventListener('resize', resize);

function render() {
  if (!running) return;
  const elapsed = clock.getElapsedTime();

  torus.rotation.x = elapsed * 0.18;
  torus.rotation.y = elapsed * 0.13;
  ring.rotation.z = elapsed * -0.08;
  particles.rotation.y = elapsed * 0.03;

  controls.update();
  composer.render();
  requestAnimationFrame(render);
}

function startSimulation() {
  if (running) return;
  running = true;
  intro.classList.add('hidden');
  renderer.domElement.style.visibility = 'visible';
  render();
}

dot.addEventListener('click', startSimulation);
dot.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    startSimulation();
  }
});

renderer.domElement.style.visibility = 'hidden';
