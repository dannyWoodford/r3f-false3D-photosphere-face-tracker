import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'


import Scene from './components/Scene.js'
import Text from './components/Text.js'

function App() {
	
	return (
		<div
			className='canvas-container'
		>
			<Canvas
				className="webgl"
				camera={{ fov: 50, position: [0.3877541317884009, -0.7852562001645822, -0.4929700126621239] }}
				linear={true}
				flat={true}
			>
				<Scene />
				<AdaptiveDpr pixelated />
				<AdaptiveEvents />
			</Canvas>
			<Stats className="stats" />

			<div className="demo-container">
				<button className="demo-btn demo-1">Lake Demo</button>
				<button className="demo-btn demo-2">Space Demo</button>
			</div>
			<Text />
		</div>
    );
}

export default App;