import React, { Suspense, useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { FaceBufferGeometry, FaceTracker, ZapparCamera } from '@zappar/zappar-react-three-fiber'
import * as THREE from 'three'
import { OrbitControls, useDetectGPU } from '@react-three/drei'

import loadedMessageHandler  from '../helpers/loadedMessageHandler.js'
import FaceMeshMaterial  from '../helpers/FaceMeshMaterial.js'


const twgl = window.twgl

const m3scaling = (sx, sy) => {
	return [sx, 0, 0, 0, sy, 0, 0, 0, 1]
}

export default function Scene({ ...props }) {
	let mouse = [0, 0]
	let nMouse = [0, 0]

	const [canvasExist, setCanvasExist] = useState(false)
	const [isMobile, setIsMobile] = useState(true)

	const trackerGroup = useRef()
	const zapparCam = useRef()
	
	/**
	 * Sizes
	 */
	const sizes = {}
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight
	let widthHalf = sizes.width / 2
	let heightHalf = sizes.height / 2

	let canvas

	if (canvasExist === false) {
		canvas = document.createElement('canvas')
		setCanvasExist(true)
	} else { 
		// Grab existing canvas. Before, new canvas was being created every rerender. 
		canvas = document.querySelector('.canvas')
	}

	canvas.className = 'canvas'
	const gl = canvas.getContext('webgl')
	document.body.appendChild(canvas)

	let originalImage = { width: 1, height: 1 } // replaced after loading
	let originalTexture = twgl.createTexture(
		gl,
		{
			src: isMobile ? 'mobile-images/lake.jpg' : 'images/lake.jpg',
			crossOrigin: '',
		},
		(err, texture, source) => {
			originalImage = source
		}
	)

	let originalTexture1 = twgl.createTexture(
		gl,
		{
			src: isMobile ? 'mobile-images/lake.jpg' : 'images/lake.jpg',
			crossOrigin: '',
		},
		(err, texture, source) => {
			originalImage = source
		}
	)

	let originalTexture2 = twgl.createTexture(
		gl,
		{
			src: isMobile ? 'mobile-images/space-station.jpg' : 'images/space-station.jpg',
			crossOrigin: '',
		},
		(err, texture, source) => {
			originalImage = source
		}
	)

	let mapTexture = twgl.createTexture(gl, {
		src: isMobile ? 'mobile-images/lake-map-blurred.jpg' : 'images/lake-map-blurred.jpg',
		crossOrigin: '',
	})

	let mapTexture1 = twgl.createTexture(gl, {
		src: isMobile ? 'mobile-images/lake-map-blurred.jpg' : 'images/lake-map-blurred.jpg',
		crossOrigin: '',
	})

	let mapTexture2 = twgl.createTexture(gl, {
		src: isMobile ? 'mobile-images/space-station-map.jpg' : 'images/space-station-map.jpg',
		crossOrigin: '',
	})

	// compile shaders, link program, lookup location
	const programInfo = twgl.createProgramInfo(gl, ['vs', 'fs'])

	// calls gl.createBuffer, gl.bindBuffer, gl.bufferData for a quad
	const bufferInfo = twgl.primitives.createXYQuadBufferInfo(gl)

	const demo1Button = document.querySelector('.demo-1')
	const demo2Button = document.querySelector('.demo-2')

	demo1Button.addEventListener('click', (event) => {
		originalTexture = originalTexture1
		mapTexture = mapTexture1
	})

	demo2Button.addEventListener('click', (event) => {
		originalTexture = originalTexture2
		mapTexture = mapTexture2
	})

	let canvasTex = new THREE.CanvasTexture(gl.canvas)

	let vector = new THREE.Vector3()
	let prevTime = 0
	let currTime
	let interval = 0.05 // 50 Milliseconds

	useFrame(({ clock }) => { 
		currTime = clock.getElapsedTime()

		if (trackerGroup.current && zapparCam.current) {
			if (trackerGroup.current.position.x !== 0) {
				if (currTime - prevTime > interval) {
					prevTime = clock.getElapsedTime()
					
					vector.setFromMatrixPosition(trackerGroup.current.matrixWorld).project(zapparCam.current)

					vector.x = (vector.x * widthHalf) + widthHalf
					vector.y = - (vector.y * heightHalf) + heightHalf	
					
					mouse[0] = -((vector.x / sizes.width) * 2 - 1) * 0.05
					mouse[1] = ((vector.y / sizes.height) * 2 - 1) * 0.05
				}
			}
		}
	}) 

	useFrame(() => {
		twgl.resizeCanvasToDisplaySize(canvas)

		gl.viewport(0, 0, canvas.width, canvas.height)

		gl.clearColor(0, 0, 0, 0)
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.useProgram(programInfo.program)

		// calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
		twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)

		const canvasAspect = canvas.width / canvas.height
		const imageAspect = originalImage.width / originalImage.height
		const mat = m3scaling(imageAspect / canvasAspect, -1)

		nMouse[0] += (mouse[0] - nMouse[0]) * 0.05
		nMouse[1] += (mouse[1] - nMouse[1]) * 0.05

		// calls gl.activeTexture, gl.bindTexture, gl.uniformXXX
		twgl.setUniforms(programInfo, {
			u_matrix: mat,
			u_originalImage: originalTexture,
			u_mapImage: mapTexture,
			u_mouse: nMouse,
		})
		// calls gl.drawArrays or gl.drawElements
		twgl.drawBufferInfo(gl, bufferInfo)

		canvasTex.needsUpdate = true
	})

	const GPUTier = useDetectGPU()
  	// show a fallback for mobile or lowest tier GPUs
	
	useEffect(() => { 
		if (GPUTier) { 
			if (GPUTier.tier === "0" || GPUTier.isMobile) {
				setIsMobile(true)
			} else { 
				setIsMobile(false)
			}
		}
	}, [GPUTier, demo1Button.style])

	return (
		<>
			<ZapparCamera
				name='ZapparCamera'
				userFacing
				userCameraMirrorMode="css"
				makeDefault={false} // default: true
				renderPriority={0} //  default: 1
				ref={zapparCam}
			/>
			<FaceTracker
				name='FaceTracker'
				ref={trackerGroup}
				onVisible={() => loadedMessageHandler()}
			>
				<Suspense fallback={null}>
					<mesh
						// visible={false}
						position={[0, 0, 0]}
						scale={[2, 2, 2]}
					>
						<FaceMeshMaterial />
						<FaceBufferGeometry
							trackerGroup={trackerGroup}
						/>
					</mesh>
				</Suspense>
			</FaceTracker>

			<OrbitControls 
				enableZoom={false}
				enablePan={false}
				enableKeys={false}
			/>
			<mesh
				name='Photosphere'
				position={[0, 0, 0]}
				rotation={[0, Math.PI / 2, 0]}
				scale={[-1, 1, 1]}
				// scale={[-10, 10, 10]}
				// visible={false}
			>
				{/* <sphereGeometry args={[10, 32, 32, .5, 5.04539780166521, 0, 3.141592653589793]} /> */}
				<sphereGeometry args={[10, 32, 32]} />
				<meshBasicMaterial side={THREE.BackSide} map={canvasTex} />
			</mesh>
		</>
	)
}
