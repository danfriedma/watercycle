import * as THREE from 'three'
import { STLExporter } from 'three/addons/exporters/STLExporter.js'
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js'
import { PLYExporter } from 'three/addons/exporters/PLYExporter.js';
import {
	BufferGeometry,
	Float32BufferAttribute,
	Vector3
} from 'three';
import fs from 'fs'

class ParametricGeometry extends BufferGeometry {

	constructor( func = ( u, v, target ) => target.set( u, v, Math.cos( u ) * Math.sin( v ) ), slices = 8, stacks = 8 ) {

		super();

		this.type = 'ParametricGeometry';

		this.parameters = {
			func: func,
			slices: slices,
			stacks: stacks
		};

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		const EPS = 0.00001;

		const normal = new Vector3();

		const p0 = new Vector3(), p1 = new Vector3();
		const pu = new Vector3(), pv = new Vector3();

		// generate vertices, normals and uvs

		const sliceCount = slices + 1;

		for ( let i = 0; i <= stacks; i ++ ) {

			const v = i / stacks;

			for ( let j = 0; j <= slices; j ++ ) {

				const u = j / slices;

				// vertex

				func( u, v, p0 );
				vertices.push( p0.x, p0.y, p0.z );

				// normal

				// approximate tangent vectors via finite differences

				if ( u - EPS >= 0 ) {

					func( u - EPS, v, p1 );
					pu.subVectors( p0, p1 );

				} else {

					func( u + EPS, v, p1 );
					pu.subVectors( p1, p0 );

				}

				if ( v - EPS >= 0 ) {

					func( u, v - EPS, p1 );
					pv.subVectors( p0, p1 );

				} else {

					func( u, v + EPS, p1 );
					pv.subVectors( p1, p0 );

				}

				// cross product of tangent vectors returns surface normal

				normal.crossVectors( pu, pv ).normalize();
				normals.push( normal.x, normal.y, normal.z );

				// uv

				uvs.push( u, v );

			}

		}

		// generate indices

		for ( let i = 0; i < stacks; i ++ ) {

			for ( let j = 0; j < slices; j ++ ) {

				const a = i * sliceCount + j;
				const b = i * sliceCount + j + 1;
				const c = ( i + 1 ) * sliceCount + j + 1;
				const d = ( i + 1 ) * sliceCount + j;

				// faces one and two

				indices.push( a, b, d );
				indices.push( b, c, d );

			}

		}

		// build geometry

		this.setIndex( indices );
		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

}

const phi = (1 + Math.sqrt(5)) / 2
const phase0 = 2*Math.PI/5
const phase1 = 2*Math.PI/4

const phiSpiral = (a) => (
  (u, v, target) => {

		// normalize range
    u = 2 * Math.PI * ((u * 1.2) - .1)
    v = 2 * Math.PI * v

    const phiPower = Math.pow(phi, u)

		// Sine wave approximation of a triangle wave
		// See https://en.wikipedia.org/wiki/Triangle_wave#Harmonics
		//
		// First 8 Harmonics
    const triangleWave = 8 / (Math.PI*Math.PI) * [...Array(8).keys()].reduce((acc, i) => {
      const n = 2*i + 1
      return acc + (Math.pow(-1,i)*Math.pow(n,-2)*Math.sin(2*Math.PI*u*n/(Math.PI*4)))
    },0)

    let x, y, z

		x = phi*triangleWave*-Math.sin(u*2)
    y = phi*triangleWave*Math.cos(u*2)
    z = u - (Math.PI)

    if(v == 0) {
      target.set(z, x, y)
    } else {
      target.set(0,0,0)
    }
  }
)

const geometry = new ParametricGeometry( phiSpiral(0), 256*4, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

const mesh = new THREE.Mesh( geometry, material );

const exporter = new STLExporter();
// Configure export options
const options = { binary: true }

// Parse the input and generate the STL encoded output
const result = exporter.parse( mesh, options );

const filename = 'spiral_v0.stl'
const data = new Uint8Array(result.buffer)


fs.writeFile(filename, data, (err) => {
  if (err) {
    console.error('Error writing to the file:', err);
  } else {
    console.log('Data has been written to the file:', filename);
  }
});
