
export default function Text() {
	return (
		<div
			className='text-container'
		>
			<h1 className='loaded-message'>False 3D Effect is loading...</h1>
			<div className='instruction-message'>
				<h1>Move your head around to gain false perspective and make the 2D background look 3D</h1>
				<span className="drag-message">
					<img src="https://img.icons8.com/ios-filled/50/ffffff/resize-four-directions.png" alt="drag icon"/>
					<h1>Drag mouse to look around photosphere</h1>
				</span>
			</div>
		</div>
	)
}
