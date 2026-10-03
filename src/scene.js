import * as THREE from 'three';

export function initScene(canvas) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' }); }
  catch { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.set(0, 0, 19);
  const sculpture = new THREE.Group();
  scene.add(sculpture);
  const orange = new THREE.MeshStandardMaterial({ color: 0xff5b20, metalness: .65, roughness: .3 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x41372d, metalness: .85, roughness: .35 });
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xff6a2c, transparent: true, opacity: .6 });
  const softMaterial = new THREE.LineBasicMaterial({ color: 0xb8aa8c, transparent: true, opacity: .22 });
  const geometries = [new THREE.BoxGeometry(1,1,1), new THREE.OctahedronGeometry(.7)];
  const edges = geometries.map((geometry) => new THREE.EdgesGeometry(geometry));
  const fragments = [];
  for (let i = 0; i < 32; i++) {
    const angle = i * 2.399963;
    const radius = 1.25 + Math.sqrt(i / 32) * 2.2;
    const target = new THREE.Vector3(Math.cos(angle)*radius, Math.sin(angle)*radius, Math.sin(i*1.7)*1.3);
    const spread = target.clone().multiplyScalar(1.55);
    const group = new THREE.Group();
    const type = i % 5 === 0 ? 1 : 0;
    const size = .26 + (i % 7) * .09;
    group.scale.setScalar(size);
    if (i % 3 !== 0) group.add(new THREE.Mesh(geometries[type], i % 4 === 0 ? orange : dark));
    group.add(new THREE.LineSegments(edges[type], edgeMaterial));
    group.rotation.set(i*.7, i*.34, i*.43);
    sculpture.add(group);
    fragments.push({ group, target, spread, phase:i*.43 });
  }
  const cageGeometry = new THREE.IcosahedronGeometry(4.15, 0);
  const cageEdges = new THREE.EdgesGeometry(cageGeometry);
  const cage = new THREE.LineSegments(cageEdges, softMaterial);
  sculpture.add(cage);
  const ringGeometries = [];
  for(let i=0;i<3;i++){
    const points = Array.from({length:129},(_,j)=>{const a=j/128*Math.PI*2;return new THREE.Vector3(Math.cos(a)*4.6,Math.sin(a)*4.6,0);});
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    ringGeometries.push(geometry);
    const ring = new THREE.Line(geometry, softMaterial);
    ring.rotation.set(i*.85,.6+i*.3,.4);
    sculpture.add(ring);
  }
  scene.add(new THREE.HemisphereLight(0xffd7b2, 0x151515, 2));
  const light = new THREE.PointLight(0xff6a2a, 120, 30); light.position.set(3,4,5); scene.add(light);
  const whiteLight = new THREE.DirectionalLight(0xfff1df, 3); whiteLight.position.set(-4,3,6); scene.add(whiteLight);
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointerMedia = window.matchMedia('(pointer: fine)');
  let paused=false, lost=false, disposed=false, frame=0, lastTime=0, elapsed=0;
  const pointer = new THREE.Vector2();
  const currentPointer = new THREE.Vector2();
  function resize(){
    const width=canvas.clientWidth, height=canvas.clientHeight;
    if(!width || !height) return;
    renderer.setSize(width,height,false); camera.aspect=width/height;
    camera.position.z=width<600?26:19; camera.updateProjectionMatrix();
    sculpture.position.set(width<600?1:3.1, width<600?1:.35, 0);
    render();
  }
  function render(){
    const moving=!motion.matches;
    const t=moving?elapsed:2.8;
    const assembled=(Math.sin(t*.24)+1)*.5;
    fragments.forEach(({group,target,spread,phase})=>{
      group.position.lerpVectors(spread,target,assembled);
      if(moving){group.rotation.x=t*.09+phase;group.rotation.y=t*.12+phase;group.position.y+=Math.sin(t*.4+phase)*.12;}
    });
    currentPointer.lerp(moving?pointer:new THREE.Vector2(),.035);
    sculpture.rotation.set(.2+currentPointer.y*.16,t*.035+currentPointer.x*.2,-.16);
    cage.rotation.set(t*.025,t*-.045,.25);
    renderer.render(scene,camera);
  }
  function tick(time){
    frame=0;
    if(disposed||lost||paused||motion.matches||document.hidden) return;
    if(lastTime) elapsed+=Math.min((time-lastTime)/1000,.05);
    lastTime=time;render();frame=requestAnimationFrame(tick);
  }
  function sync(){
    cancelAnimationFrame(frame);frame=0;lastTime=0;
    if(disposed||lost) return;
    render();
    if(!paused&&!motion.matches&&!document.hidden) frame=requestAnimationFrame(tick);
  }
  function onPointer(event){if(pointerMedia.matches&&!motion.matches&&!paused){pointer.set(event.clientX/window.innerWidth-.5, .5-event.clientY/window.innerHeight);}}
  function onLost(event){event.preventDefault();lost=true;cancelAnimationFrame(frame);document.documentElement.classList.remove('webgl-ready');}
  function onRestored(){if(disposed)return;lost=false;document.documentElement.classList.add('webgl-ready');resize();sync();canvas.dispatchEvent(new Event('sceneavailable'));}
  window.addEventListener('resize',resize);
  window.addEventListener('pointermove',onPointer,{passive:true});
  document.addEventListener('visibilitychange',sync);
  motion.addEventListener('change',sync);
  canvas.addEventListener('webglcontextlost',onLost);
  canvas.addEventListener('webglcontextrestored',onRestored);
  try { resize();sync();document.documentElement.classList.add('webgl-ready'); }
  catch { dispose();return null; }
  function dispose(){
    disposed=true;cancelAnimationFrame(frame);
    window.removeEventListener('resize',resize);window.removeEventListener('pointermove',onPointer);
    document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);
    canvas.removeEventListener('webglcontextlost',onLost);canvas.removeEventListener('webglcontextrestored',onRestored);
    [...geometries,...edges,cageGeometry,cageEdges,...ringGeometries].forEach(g=>g.dispose());
    [orange,dark,edgeMaterial,softMaterial].forEach(m=>m.dispose());
    renderer.dispose();document.documentElement.classList.remove('webgl-ready');
  }
  return {get available(){return !lost&&!disposed;},togglePause(){paused=!paused;sync();return paused;},dispose};
}
