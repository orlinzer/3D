import * as THREE from 'three';
// import { Scene } from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const gltfLoader = new GLTFLoader();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const camera = new THREE.PerspectiveCamera( 75,
  window.innerWidth / window.innerHeight, 1, 500 );

camera.position.set( 0, 0, 100 );
// camera.position.z = 5;
// camera.position.x = 1;

const scene = new THREE.Scene();


//create a blue LineBasicMaterial
const lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );
const points = [];
points.push( new THREE.Vector3( -10, 0, 0 ) );
points.push( new THREE.Vector3( 0, 10, 0 ) );
points.push( new THREE.Vector3( 10, 0, 0 ) );
points.push( new THREE.Vector3( 20, 10, 0 ) );
const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
const line = new THREE.Line( lineGeometry, lineMaterial );
scene.add( line );

const boxGeometry = new THREE.BoxGeometry();
const meshMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const cube = new THREE.Mesh( boxGeometry, meshMaterial );
scene.add( cube );

const textGeometry = new THREE.TextGeometry("Liza", {
		// font: font,
		size: 80,
		height: 5,
		curveSegments: 12,
		bevelEnabled: true,
		bevelThickness: 10,
		bevelSize: 8,
		bevelOffset: 0,
		bevelSegments: 5
	});
// const meshMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
// const text = new THREE.TextMesh( textGeometry, meshMaterial );
scene.add( textGeometry );

gltfLoader.load( '/models/source/OilCan.glb', function ( gltf ) {
	scene.add( gltf.scene );
}, undefined, function ( error ) {
	console.error( error );
} );

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}

// TODO
// if ( WebGL.isWebGLAvailable() ) {
	// Initiate function or other initializations here
	animate();
// } else {
	// const warning = WebGL.getWebGLErrorMessage();
	// document.getElementById( 'container' ).appendChild( warning );
// }
