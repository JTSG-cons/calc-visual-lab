// 3D hero: a curve in space with a glowing point and its tangent line sliding along it.
import * as THREE from "../vendor/three.module.js";

const canvas = document.getElementById("hero3d");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.set(0, 1.2, 11);

const group = new THREE.Group();
group.position.set(2.2, -0.2, 0);
scene.add(group);

// r(t) = (t, 1.3 sin t, 1.1 cos 0.7t), t in [-5, 5]
const r = (t) => new THREE.Vector3(t * 0.9, 1.3 * Math.sin(t), 1.1 * Math.cos(0.7 * t));
const dr = (t) => new THREE.Vector3(0.9, 1.3 * Math.cos(t), -0.77 * Math.sin(0.7 * t)).normalize();

class Curve extends THREE.Curve {
  getPoint(u, target = new THREE.Vector3()) { return target.copy(r(-5 + 10 * u)); }
}

const tube = new THREE.Mesh(
  new THREE.TubeGeometry(new Curve(), 400, 0.055, 12, false),
  new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x1d4ed8, emissiveIntensity: 0.6, roughness: 0.35, metalness: 0.2 })
);
group.add(tube);

// faint grid floor
const grid = new THREE.GridHelper(14, 28, 0x334155, 0x1e293b);
grid.position.y = -2.2;
grid.material.transparent = true;
grid.material.opacity = 0.5;
group.add(grid);

// moving point + tangent
const dot = new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 32), new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
const halo = new THREE.Mesh(new THREE.SphereGeometry(0.36, 32, 32), new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.18 }));
group.add(dot, halo);
const tanGeom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
const tangent = new THREE.Line(tanGeom, new THREE.LineBasicMaterial({ color: 0xfb7185 }));
group.add(tangent);

// sparkles
const pts = new Float32Array(600);
for (let i = 0; i < pts.length; i++) pts[i] = (Math.random() - 0.5) * 18;
const stars = new THREE.Points(
  new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(pts, 3)),
  new THREE.PointsMaterial({ color: 0xa78bfa, size: 0.04, transparent: true, opacity: 0.7 })
);
scene.add(stars);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const light = new THREE.PointLight(0xffffff, 60);
light.position.set(4, 6, 8);
scene.add(light);

let mx = 0, my = 0;
addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  // on narrow screens, center the curve and push it back
  group.position.x = w < 860 ? 0 : 2.2;
  camera.position.z = w < 860 ? 15 : 11;
}
addEventListener("resize", resize);
resize();

function frame(time) {
  const s = time * 0.001;
  const t = -4 + ((s * 0.35) % 1) * 8;
  const p = r(t), d = dr(t).multiplyScalar(1.8);
  dot.position.copy(p);
  halo.position.copy(p);
  halo.scale.setScalar(1 + 0.15 * Math.sin(s * 4));
  tanGeom.setFromPoints([p.clone().sub(d), p.clone().add(d)]);
  group.rotation.y = 0.35 * Math.sin(s * 0.25) + mx * 0.4;
  group.rotation.x = 0.12 + my * 0.2;
  stars.rotation.y = s * 0.02;
  renderer.render(scene, camera);
}

if (reduceMotion) frame(4000);
else renderer.setAnimationLoop(frame);
