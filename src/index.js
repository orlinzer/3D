
import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module';

import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

let container, stats;

let camera, controls, scene, renderer;

const worldWidth = 128, worldDepth = 128;
const worldHalfWidth = worldWidth / 2;
const worldHalfDepth = worldDepth / 2;
const data = generateHeight( worldWidth, worldDepth );

const clock = new THREE.Clock();

init();
animate();

function init() {

  container = document.getElementById( 'container' );

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
  camera.position.y = getY( worldHalfWidth, worldHalfDepth ) * 100 + 100;

  scene = new THREE.Scene();

  // The Sky color
  scene.background = new THREE.Color( 0xbfd1e5 );

  // sides

  const matrix = new THREE.Matrix4();

  const pxGeometry = new THREE.PlaneGeometry( 100, 100 );
  pxGeometry.attributes.uv.array[ 1 ] = 0.5;
  pxGeometry.attributes.uv.array[ 3 ] = 0.5;
  pxGeometry.rotateY( Math.PI / 2 );
  pxGeometry.translate( 50, 0, 0 );

  const nxGeometry = new THREE.PlaneGeometry( 100, 100 );
  nxGeometry.attributes.uv.array[ 1 ] = 0.5;
  nxGeometry.attributes.uv.array[ 3 ] = 0.5;
  nxGeometry.rotateY( - Math.PI / 2 );
  nxGeometry.translate( - 50, 0, 0 );

  const pyGeometry = new THREE.PlaneGeometry( 100, 100 );
  pyGeometry.attributes.uv.array[ 5 ] = 0.5;
  pyGeometry.attributes.uv.array[ 7 ] = 0.5;
  pyGeometry.rotateX( - Math.PI / 2 );
  pyGeometry.translate( 0, 50, 0 );

  const pzGeometry = new THREE.PlaneGeometry( 100, 100 );
  pzGeometry.attributes.uv.array[ 1 ] = 0.5;
  pzGeometry.attributes.uv.array[ 3 ] = 0.5;
  pzGeometry.translate( 0, 0, 50 );

  const nzGeometry = new THREE.PlaneGeometry( 100, 100 );
  nzGeometry.attributes.uv.array[ 1 ] = 0.5;
  nzGeometry.attributes.uv.array[ 3 ] = 0.5;
  nzGeometry.rotateY( Math.PI );
  nzGeometry.translate( 0, 0, - 50 );

  const geometries = [];

  for ( let z = 0; z < worldDepth; z++ ) {
    for ( let x = 0; x < worldWidth; x++ ) {
      const h = getY( x, z );

      matrix.makeTranslation(
        x * 100 - worldHalfWidth * 100,
        h * 100,
        z * 100 - worldHalfDepth * 100
      );

      const px = getY(x + 1, z); /* Right */
      const nx = getY(x - 1, z); /* Left */
      const pz = getY(x, z + 1); /* Forward */
      const nz = getY(x, z - 1); /* Backward */

      geometries.push( pyGeometry.clone().applyMatrix4( matrix ) );

      if ( ( px !== h && px !== h + 1 ) || x === 0 ) {
        geometries.push( pxGeometry.clone().applyMatrix4( matrix ) );
      }

      if ( ( nx !== h && nx !== h + 1 ) || x === worldWidth - 1 ) {
        geometries.push( nxGeometry.clone().applyMatrix4( matrix ) );
      }

      if ( ( pz !== h && pz !== h + 1 ) || z === worldDepth - 1 ) {
        geometries.push( pzGeometry.clone().applyMatrix4( matrix ) );
      }

      if ( ( nz !== h && nz !== h + 1 ) || z === 0 ) {
        geometries.push( nzGeometry.clone().applyMatrix4( matrix ) );
      }
    }
  }

  const geometry = BufferGeometryUtils.mergeBufferGeometries( geometries );
  geometry.computeBoundingSphere();

  const texture = new THREE.TextureLoader().load( '/models/textures/minecraft/atlas.png' );
  texture.magFilter = THREE.NearestFilter;

  const mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { map: texture, side: THREE.DoubleSide } ) );
  scene.add( mesh );

  // TODO:
  drawBlock(worldHalfWidth, 70, worldHalfDepth);

  const ambientLight = new THREE.AmbientLight( 0xcccccc );
  scene.add( ambientLight );

  const directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
  directionalLight.position.set( 1, 1, 0.5 ).normalize();
  scene.add( directionalLight );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  controls = new FirstPersonControls(camera, renderer.domElement);

  controls.movementSpeed = 1000;
  controls.lookSpeed = 0.125;
  controls.lookVertical = true;

  // controls.activeLook = false;
  controls.constrainVertical = true;

  stats = new Stats();
  container.appendChild( stats.dom );

  window.addEventListener( 'resize', onWindowResize );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

  controls.handleResize();
}

function generateHeight( width, height ) {
  const data = [], perlin = new ImprovedNoise(),
    size = width * height, z = Math.random() * 100;

  let quality = 4;

  for ( let j = 0; j < 4; j ++ ) {
    // TODO: better
    if ( j === 0 ) {
      for ( let i = 0; i < size; i ++ ) { data[i] = 0; }
    }

    for ( let i = 0; i < size; i ++ ) {
      const x = i % width, y = ( i / width ) | 0;
      data[i] += perlin.noise( x / quality, y / quality, z ) * quality;
    }
    quality *= 4;
  }

  return data;
}

function getY( x, z ) {
  return ( data[ x + z * worldWidth ] * 0.15 ) | 0;
}

function animate() {
  requestAnimationFrame(animate);

  render();
  stats.update();
}

function render() {
  controls.update(clock.getDelta());
  renderer.render(scene, camera);
}

function drawBlock(x, y, z) {
  const loader = new THREE.CubeTextureLoader();
  loader.setPath( '/models/textures/minecraft/' );

  // TODO
  const textureCube = loader.load( [
    'grass_dirt.png', // px
    'grass_dirt.png', // nx
    'grass.png', // py
    'dirt.png', // ny
    'grass_dirt.png', // pz
    'grass_dirt.png', // nz
  ] );

  // const geometry = new THREE.BoxGeometry(x, y, z, 16, 16, 16);
  const geometry = new THREE.BoxGeometry(16, 16, 16);
  // const material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube } );
  // const material = new THREE.MeshBasicMaterial( { color: 0xffffff, map: textureCube } );

  // var geometry = new THREE.CubeGeometry(10, 10, 10);
  var material = new THREE.MeshPhongMaterial({ transparent: false, map: THREE.ImageUtils.loadTexture('/models/textures/minecraft/dirt.png') });
  // material.side = THREE.;
  // material.side = THREE.Side;
  material.side = THREE.FrontSide;
  // material.side = THREE.BackSide;
  // material.side = THREE.DoubleSide;

  // const texture = new THREE.TextureLoader().load( '/models/textures/minecraft/atlas.png' );
  // texture.magFilter = THREE.NearestFilter;
  // var mesh = new THREE.Mesh(geometry, meshMaterial);

  const cube = new THREE.Mesh( geometry, material );

  scene.add(cube);
}
