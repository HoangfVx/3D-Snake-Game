import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'lil-gui'
import Snake from './src/Snake'
import Candy from './src/Candy'
import Rock from './src/Rock'
import Tree from './src/Tree'
import { dirLight, ambLight } from './src/Lights'
import { resolution } from './src/Params'
import gsap from 'gsap'
import Entity from './src/Entity'
import { MeshStandardMaterial } from 'three'
import { Vector3 } from 'three'


const isMobile = window.innerWidth <= 768


// loader.load(fontSrc, function (loadedFont) {
// 	font = loadedFont

// 	printScore()
// })

/**
 * Debug
*/
let gui //= new dat.GUI()

const palettes = {
	green: {
		groundColor: 0x6CB4EE,
		fogColor: 0x39c09f,
		rockColor: 0xebebeb, //0x7a95ff,
		treeColor: 0x639541, //0x1d5846,
		candyColor: 0x1d5846, //0x614bdd,
		// snakeColor: 0xc9e4c3, //0xff470a,
		mouthColor: 0x39c09f,
	},
	orange: {
		groundColor: 0xd68a4c,
		fogColor: 0xffac38,
		rockColor: 0xacacac,
		treeColor: 0xa2d109,
		candyColor: 0x614bdd,
		// snakeColor: 0xff470a,
		mouthColor: 0x614bdd,
	},
	lilac: {
		groundColor: 0xd199ff,
		fogColor: 0xb04ce6,
		rockColor: 0xebebeb,
		treeColor: 0x53d0c1,
		candyColor: 0x9900ff,
		// snakeColor: 0xff2ed2,
		mouthColor: 0x614bdd,
	},
}

let paletteName = localStorage.getItem('paletteName') || 'green'
let selectedPalette = palettes[paletteName]

const params = {
	...selectedPalette,
}

function applyPalette(paletteName) {
	const palette = palettes[paletteName]
	localStorage.setItem('paletteName', paletteName)

	selectedPalette = palette

	if (!palette) return

	const {
		groundColor,
		fogColor,
		rockColor,
		treeColor,
		candyColor,
		snakeColor,
		mouthColor,
	} = palette

	planeMaterial.color.set(groundColor)
	scene.fog.color.set(fogColor)
	const loader = new THREE.TextureLoader();
	loader.load('./assets/bg.png', function (texture) {
    scene.background = texture;
	});
	// scene.background.set(fogColor)

	entities
		.find((entity) => entity instanceof Rock)
		?.mesh.material.color.set(rockColor)
	entities
		.find((entity) => entity instanceof Tree)
		?.mesh.material.color.set(treeColor)
	candies[0].mesh.material.color.set(candyColor)
	snake.body.head.data.mesh.material.color.set(snakeColor)

	snake.body.head.data.mesh.material.color.set(snakeColor)
	snake.mouthColor = mouthColor
	snake.mouth.material.color.set(mouthColor)

	btnPlayImg.src = `/btn-play-bg-${paletteName}.png`
}

if (gui) {
	gui
		.addColor(params, 'groundColor')
		.name('Ground color')
		.onChange((val) => planeMaterial.color.set(val))

	gui
		.addColor(params, 'fogColor')
		.name('Fog color')
		.onChange((val) => {
			scene.fog.color.set(val)
			scene.background.color.set(val)
		})

	gui
		.addColor(params, 'rockColor')
		.name('Rock color')
		.onChange((val) => {
			entities
				.find((entity) => entity instanceof Rock)
				?.mesh.material.color.set(val)
		})

	gui
		.addColor(params, 'treeColor')
		.name('Tree color')
		.onChange((val) => {
			entities
				.find((entity) => entity instanceof Tree)
				?.mesh.material.color.set(val)
		})

	gui
		.addColor(params, 'candyColor')
		.name('Candy color')
		.onChange((val) => {
			candies[0].mesh.material.color.set(val)
		})

	gui
		.addColor(params, 'snakeColor')
		.name('Snake color')
		.onChange((val) => {
			snake.body.head.data.mesh.material.color.set(val)
		})
}

let score = 0

// const resolution = new THREE.Vector2(20, 20);
const gridHelperXY = new THREE.GridHelper(
	resolution.x,
	resolution.y,
	0xffffff,
	0xffffff
)
gridHelperXY.position.set(resolution.x / 2 - 0.5, -0.49, resolution.y / 2 - 0.5)
gridHelperXY.material.transparent = true
gridHelperXY.material.opacity = isMobile ? 0.75 : 0.3

const gridHelperYX = new THREE.GridHelper(
	resolution.x,
	resolution.y,
	0xffffff,
	0xffffff
)
gridHelperYX.position.set(resolution.x / 2 - 0.5, -0.5- resolution.y, resolution.y / 2 - 0.5)
gridHelperYX.material.transparent = true
gridHelperYX.material.opacity = isMobile ? 0.75 : 0.3

const gridHelperXZ = new THREE.GridHelper(
	resolution.x,
	resolution.y,
	0xffffff,
	0xffffff
)
gridHelperXZ.rotation.x = Math.PI / 2;
gridHelperXZ.position.set(resolution.x / 2 - 0.5, resolution.y / 2 - 0.5 - resolution.y, -0.5)
gridHelperXZ.material.transparent = true
gridHelperXZ.material.opacity = isMobile ? 0.75 : 0.3

const gridHelperZX = new THREE.GridHelper(
	resolution.x,
	resolution.y,
	0xffffff,
	0xffffff
)
gridHelperZX.rotation.x = Math.PI / 2;
gridHelperZX.position.set(resolution.x / 2 - 0.5, resolution.y / 2 - 0.5 - resolution.y, -0.5 + resolution.y)
gridHelperZX.material.transparent = true
gridHelperZX.material.opacity = isMobile ? 0.75 : 0.3

const gridHelperYZ = new THREE.GridHelper(
	resolution.x,
	resolution.y,
	0xffffff,
	0xffffff
)
gridHelperYZ.rotation.z = Math.PI / 2;
gridHelperYZ.position.set(-0.5, resolution.x / 2 - 0.5 - resolution.y, resolution.y / 2 - 0.5)
gridHelperYZ.material.transparent = true
gridHelperYZ.material.opacity = isMobile ? 0.75 : 0.3

const gridHelperZY = new THREE.GridHelper(
	resolution.x,
	resolution.y,
	0xffffff,
	0xffffff
)
gridHelperZY.rotation.z = Math.PI / 2;
gridHelperZY.position.set(-0.5 + resolution.y, resolution.x / 2 - 0.5 - resolution.y, resolution.y / 2 - 0.5)
gridHelperZY.material.transparent = true
gridHelperZY.material.opacity = isMobile ? 0.75 : 0.3
/**
 * Scene
 */
const scene = new THREE.Scene();
scene.background = new THREE.Color(params.fogColor)

scene.fog = new THREE.Fog(params.fogColor, 5, 40)

scene.add(gridHelperXY)
scene.add(gridHelperYX)

scene.add(gridHelperXZ)
scene.add(gridHelperZX)

scene.add(gridHelperYZ)
scene.add(gridHelperZY)
/**
 * Cube
 */
// const material = new THREE.MeshNormalMaterial()
// const geometry = new THREE.BoxGeometry(1, 1, 1);

// const mesh = new THREE.Mesh(geometry, material);
//scene.add(mesh);
/**
 * render sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};
/**
 * Camera
 */
const fov = 70;
const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1);
camera.lookAt(new THREE.Vector3(10, 0, 10))
camera.rotateX(Math.PI / 2)



let finalPosition = isMobile
	? new THREE.Vector3(resolution.x / 2 - 0.5, resolution.x + 15, resolution.y)
	: new THREE.Vector3(
			resolution.x / 2,
			15,
			resolution.y + 5
	  )
const initialPosition = new THREE.Vector3(
	resolution.x / 2 + 5,
	4,
	resolution.y / 2 + 4
)
camera.position.copy(initialPosition)
// camera.lookAt(new THREE.Vector3(0, 2.5, 0));

/**
 * Show the axes of coordinates system
 */
const axesHelper = new THREE.AxesHelper(3);
// scene.add(axesHelper);

/**
 * renderer
 */
const renderer = new THREE.WebGLRenderer({
	antialias: window.devicePixelRatio < 2,
	logarithmicDepthBuffer: true,
});
document.body.appendChild(renderer.domElement);
handleResize();

renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.2
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.VSMShadowMap


/**
 * OrbitControls
 */
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.enableZoom = true
controls.enablePan = false
controls.enableRotate = true
controls.target.set(resolution.x / 2, 0, resolution.z / 2 + (isMobile ? 0 : 2))

/**
 * Three js Clock
 */
// const clock = new THREE.Clock()

//Grid

const planeGeometry = new THREE.BoxGeometry(
	resolution.x,
	resolution.y,
	resolution.z 
);
planeGeometry.rotateX(-Math.PI * 0.5);
const planeMaterial = new THREE.MeshStandardMaterial({ color: params.groundColor, side: THREE.DoubleSide})
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.x = resolution.x / 2 - 0.5;
plane.position.z = resolution.y / 2 - 0.5;
plane.position.y = -10.5
scene.add(plane);

plane.receiveShadow = true
plane.castShadow = true

// Create Snake 
const snake = new Snake({
	scene,
	resolution,
	color: selectedPalette.snakeColor,
	mouthColor: selectedPalette.mouthColor,
})
// console.log(snake);



snake.addEventListener('updated', function () {

	if (snake.checkSelfCollision() || snake.checkEntitiesCollision(entities)) {
		snake.die()
		resetGame()
	}

	const headIndex = snake.indexes.at(-1)
	const candyIndex = candies.findIndex(
		(candy) => candy.getIndexByCoord() === headIndex
	)
	// console.log(headIndex, candyIndex)
	if (candyIndex >= 0) {
		const candy = candies[candyIndex]
		scene.remove(candy.mesh)
		candies.splice(candyIndex, 1)
		snake.body.head.data.candy = candy
		addCandy()
		score += 1
		// console.log(candies)

		updateScore(score)
		// printScore()
	}

	if(snake.headPosition.z >= 20 && snake.headPosition.y < 0) {
		finalPosition = new THREE.Vector3(
			resolution.x / 2,
			-resolution.y - 4,
			resolution.z + 15
	  )
	  gsap.to(camera.position, {
        ...finalPosition,
        duration: 0.7,
        onUpdate: () => {
            camera.lookAt(resolution.x / 2, -resolution.y / 2 - 2, resolution.z);
        },
    });
		gsap.to(camera.rotation, { x: Math.PI / 4});
		camera.up.set(0, 1, 0);
		dirLight.position.set(resolution.x + 10, -resolution.y - 4, resolution.z)
		dirLight.target.position.set(resolution.x / 2, -resolution.y / 2 - 2, resolution.z)
	}
	if(snake.headPosition.x >= 20 && snake.headPosition.z <= resolution.z) {
		finalPosition = new THREE.Vector3(
			resolution.x + 15,
			-resolution.y - 2,
			resolution.z / 2
	  )
	  gsap.to(camera.position, {
        ...finalPosition,
        duration: 0.7,
        onUpdate: () => {
            camera.lookAt(resolution.x, -resolution.y / 2, resolution.z/2);
        },
    });
		// gsap.to(camera.rotation, { x: Math.PI / 4});
		camera.up.set(0, 1, 0);
		dirLight.position.set(resolution.x + 15, -resolution.y - 2, - resolution.z)
		dirLight.target.position.set(resolution.x, -resolution.y / 2, resolution.z/2)
	}

	if(snake.headPosition.z < 0 && snake.headPosition.y < 0) {
		finalPosition = new THREE.Vector3(
			resolution.x / 2,
			-resolution.y - 6,
			-resolution.z / 2
	  )
	  gsap.to(camera.position, {
        ...finalPosition,
        duration: 0.7,
        onUpdate: () => {
            camera.lookAt(resolution.x/2, -resolution.y / 2, 0);
        },
    });
		// gsap.to(camera.rotation, { x: Math.PI / 4});
		camera.up.set(0, 1, 0);
		dirLight.position.set(- resolution.x, -resolution.y - 6, -resolution.z)
		dirLight.target.position.set(resolution.x/2, -resolution.y / 2, 0)
	}
	if(snake.headPosition.x >= 0 && snake.headPosition.y >= 0) {
		finalPosition = new THREE.Vector3(
			resolution.x / 2,
			15,
			resolution.y + 5
		)
		gsap.to(camera.position, {
			...finalPosition,
			duration: 0.7,
			onUpdate: () => {
				camera.lookAt(resolution.x / 2, 0, resolution.y / 2);
			},
		});
		camera.up.set(0, 1, 0);
		dirLight.position.set(20, 20, 18)
		dirLight.target.position.set(resolution.x / 2, 0, resolution.y / 2)
	}
	if(snake.headPosition.x < 0 && snake.headPosition.y < 0) {
		finalPosition = new THREE.Vector3(
			-resolution.x + 5,
			-resolution.y -5,
			resolution.z /2
		)
		gsap.to(camera.position, {
			...finalPosition,
			duration: 0.7,
			onUpdate: () => {
				camera.lookAt(0, resolution.y / 2, resolution.z / 2);
			},
		});
		camera.up.set(0, 1, 0);
		gsap.to(camera.rotation, {y: -Math.PI / 4})
		dirLight.position.set(-resolution.x + 5, -resolution.y -5, resolution.z + 10)
		dirLight.target.position.set(0, resolution.y / 2, resolution.z / 2)
	}
	if(snake.headPosition.y < -resolution.y) {
		const finalPosition = new THREE.Vector3(
			resolution.x / 2,
			-resolution.y - 12,
			-resolution.z / 2
		);
		
		gsap.to(camera.position, {
			...finalPosition,
			duration: 0.7,
			onUpdate: () => {
				camera.lookAt(resolution.x / 2, -resolution.y, resolution.z / 2);
			}
		});		
		camera.up.set(0, -1, 0);
		// gsap.to(camera.scale, { y: -1});
		dirLight.position.set(- resolution.x, -resolution.y - 12, -resolution.z / 2)
		dirLight.target.position.set(resolution.x / 2, -resolution.y, resolution.z / 2)
	}
})

let scoreEntity

const scoreElement = document.getElementById('score');

function updateScore() {
	if (!score) {
		score = 0
	}
	scoreElement.textContent = `Score: ${score}`;
	if (score >= 5 && score <10) {
		scoreElement.style.color = '#7ebb42'; 
	} else if (score >= 10){
		scoreElement.style.color = '#bc1f26'; 
	}
}

// function printScore() {
// 	if (!font) {
// 		return
// 	}

// 	if (!score) {
// 		score = 0
// 	}

// 	if (scoreEntity) {
// 		scene.remove(scoreEntity.mesh)
// 		scoreEntity.mesh.geometry.dispose()
// 		scoreEntity.mesh.material.dispose()
// 	}

// 	const geometry = new TextGeometry(`${score}`, {
// 		font: font,
// 		size: 3,
// 		//height: 1,
// 		depth: 1,
// 		curveSegments: 12,
// 		bevelEnabled: true,
// 		bevelThickness: 0.1,
// 		bevelSize: 0.1,
// 		bevelOffset: 0,
// 		bevelSegments: 5,
// 	})

// 	geometry.center()

// 	if (isMobile) {
// 		geometry.rotateX(-Math.PI * 0.5)
// 	}
// 	const SCORE_MATERIAL = new MeshStandardMaterial({
// 		color: 0x1B1C1C
// 	})
// 	const mesh = new THREE.Mesh(
// 		geometry,
// 		SCORE_MATERIAL
// 	)

// 	mesh.position.x = resolution.x / 2 - 0.5
// 	mesh.position.z = -4
// 	mesh.position.y = 1.8

// 	mesh.castShadow = true

// 	scoreEntity = new Entity(mesh, resolution, { size: 0.8, number: 0.3 })

// 	console.log('font mesh:', mesh)

// 	scoreEntity.in()
// 	scene.add(scoreEntity.mesh)
// }

// window.addEventListener('click', function() {
// 	!isRunning ? startGame() : stopGame();
// })


function registerEventListener() {
	if (isMobile) {
		//mobile
		const prevTouch = new THREE.Vector2()
		let middle = 1.55
		let scale = 1

		window.addEventListener('touchstart', (event) => {
			const touch = event.targetTouches[0]

			middle = THREE.MathUtils.clamp(middle, 1.45, 1.65)

			// console.log(event)
			let x, y
			x = (2 * touch.clientX) / window.innerWidth - 1
			y = (2 * touch.clientY) / window.innerHeight - middle

			// if (Math.abs(x) < 0.15 && Math.abs(y) < 0.15) {
			// 	return
			// }

			if (!isRunning) {
				startGame()
			}

			// console.log('click', x, y)

			if (x * scale > y) {
				if (x * scale < -y) {
					snake.setDirection('ArrowUp')
					scale = 3
				} else {
					snake.setDirection('ArrowRight')
					middle += y
					scale = 0.33
				}
			} else {
				if (-x * scale > y) {
					snake.setDirection('ArrowLeft')
					middle += y
					scale = 0.33
				} else {
					snake.setDirection('ArrowDown')
					scale = 3
				}
			}

			prevTouch.x = x
			prevTouch.y = y
		})
	} else {
		// keyboard
		window.addEventListener('keydown', function (e) {
			// console.log(e.code)
			const keyCode = e.code
			if((snake.headPosition.z >= 20 && snake.headPosition.y < 0) || (snake.headPosition.z < 0 && snake.headPosition.y < 0)) {
				if(keyCode == "ArrowUp") {
					snake.setDirection("KeyQ")
				} else if (keyCode == "ArrowDown") {
					snake.setDirection("KeyE")
				} else {
					snake.setDirection(keyCode)	
				}
			} else if((snake.headPosition.x >= 20 && snake.headPosition.y < 0)) {
				if(keyCode == "ArrowUp") {
					snake.setDirection("KeyQ")
				} else if (keyCode == "ArrowDown") {
					snake.setDirection("KeyE")
				} else if (keyCode == "ArrowRight") {
					snake.setDirection("ArrowUp")
				} else if (keyCode == "ArrowLeft") {
					snake.setDirection("ArrowDown")
				} else {
					snake.setDirection(keyCode)	
				}
			} else {
				snake.setDirection(keyCode)
			}

			if(snake.headPosition.x < 0) {
				if(keyCode == "ArrowUp") {
					snake.setDirection("KeyQ")
				} else if (keyCode == "ArrowDown") {
					snake.setDirection("KeyE")
				} else if (keyCode == "ArrowRight") {
					snake.setDirection("ArrowDown")
				} else if (keyCode == "ArrowLeft") {
					snake.setDirection("ArrowUp")
				} else {
					snake.setDirection(keyCode)	
				}
			}

			if(snake.headPosition.z < 0) {
				if(keyCode == "ArrowUp") {
					snake.setDirection("KeyQ")
				} else if (keyCode == "ArrowDown") {
					snake.setDirection("KeyE")
				} else if (keyCode == "ArrowRight") {
					snake.setDirection("ArrowLeft")
				} else if (keyCode == "ArrowLeft") {
					snake.setDirection("ArrowRight")
				} else {
					snake.setDirection(keyCode)	
				}
			}

			if(snake.headPosition.y < -resolution.y) {
				if(keyCode == "ArrowUp") {
					snake.setDirection("ArrowDown")
				} else if (keyCode == "ArrowDown") {
					snake.setDirection("ArrowUp")
				} else {
					snake.setDirection(keyCode)	
				}
			}

			if (keyCode === 'Space') {
				!isRunning ? startGame() : stopGame()
			} else if (!isRunning) {
				startGame()
			}
		})
	}
}

let isRunning;

function startGame() {
	if(!snake.isMoving) {
		isRunning = setInterval(() => {
			snake.update()
		}, 240)
	}
}

function stopGame() {
	clearInterval(isRunning)
	isRunning = null
}

function resetGame() {
	stopGame()
	score = 0

	let candy = candies.pop()
	while (candy) {
		scene.remove(candy.mesh)
		candy = candies.pop()
	}

	let entity = entities.pop()
	while (entity) {
		scene.remove(entity.mesh)
		entity = entities.pop()
	}

	addCandy()
	generateEntities()
	// printScore()
	updateScore()
}

const candies = [];
const entities = [];

function addCandy() {
	const candy = new Candy(resolution, selectedPalette.candyColor)

	let index = getFreeIndex()
	const randomS = [
		new THREE.Vector3(-1, 5, 5),
		new THREE.Vector3(resolution.x + 1, 5, 5),
		new THREE.Vector3(5, 0, 5),
		new THREE.Vector3(5, -resolution.y - 1 , 5),
		new THREE.Vector3(5, 5, -1),
		new THREE.Vector3(5, 5, resolution.z + 1)
	]

	function getRandomVector(array) {
		const randomIndex = Math.floor(Math.random() * array.length);
		console.log("Random vector", array[randomIndex])
		return array[randomIndex];
	}

	let randomVector = getRandomVector(randomS);
	if(randomVector.x == -1 || randomVector == resolution.x + 1) {
		candy.mesh.position.z = index % resolution.x;
		candy.mesh.position.y = -Math.floor(index / resolution.x);
		candy.mesh.position.x = randomVector.x;
	}
	if(randomVector.z == -1 || randomVector == resolution.z + 1) {
		candy.mesh.position.x = index % resolution.z;
		candy.mesh.position.y = -Math.floor(index / resolution.z);
		candy.mesh.position.z = randomVector.z;
	}
	if(randomVector.y == 0 || randomVector == -resolution.y - 1) {
		candy.mesh.position.z = index % resolution.z;
		candy.mesh.position.x = Math.floor(index / resolution.y);
		candy.mesh.position.y = randomVector.y;
	}
	
	// candy.mesh.position.x = index % resolution.x;
	// candy.mesh.position.z = Math.floor(index / resolution.x);
	// candy.mesh.position.y = -Math.floor(index / resolution.x);
	candies.push(candy);
	
	// console.log(index, candy.getIndexByCoord());
	candy.in()

	scene.add(candy.mesh);
	console.log("Candy", candy.mesh.position)
}

addCandy();

function getFreeIndex() {
	let index
	let candyIndexes = candies.map((candy) => candy.getIndexByCoord())
	let entityIndexes = entities.map((entity) => entity.getIndexByCoord())

	do {
		index = Math.floor(Math.random() * resolution.x * resolution.y)
	} while (
		snake.indexes.includes(index) ||
		candyIndexes.includes(index) ||
		entityIndexes.includes(index)
	)

	return index
}


function addEntityY() {
	const entity =
	Math.random() > 0.5
		? new Rock(resolution, selectedPalette.rockColor)
		: new Tree(resolution, selectedPalette.treeColor)

	let index = getFreeIndex()

	entity.mesh.position.x = index % resolution.x
	entity.mesh.position.z = Math.floor(index / resolution.x)
	entity.mesh.position.y = Math.random() < 0.5 ? 0 : -resolution.y-1;


	entities.push(entity)

	// console.log(index, entity.getIndexByCoord())

	scene.add(entity.mesh)
}

function addEntityX() {
	const entity =
	Math.random() > 0.5
		? new Rock(resolution, selectedPalette.rockColor)
		: new Tree(resolution, selectedPalette.treeColor)

	let index = getFreeIndex()

	let temp = Math.random() < 0.5 ? -1 : resolution.x
	entity.mesh.position.x = Math.random() < 0.5 ? -1 : resolution.x
	entity.mesh.position.z = Math.floor(index / resolution.x)
	entity.mesh.position.y = - index % resolution.x -1
	if(temp == -1) {
		entity.mesh.rotation.z = Math.PI / 2
	} else if (temp == resolution.x) {
		entity.mesh.rotation.z = -Math.PI / 2
	}
	entities.push(entity)
	scene.add(entity.mesh)
}

function addEntityZ() {
	const entity =
	Math.random() > 0.5
		? new Rock(resolution, selectedPalette.rockColor)
		: new Tree(resolution, selectedPalette.treeColor)

	let index = getFreeIndex()

	let temp = Math.random() < 0.5 ? -1 : resolution.x
	entity.mesh.position.x = Math.floor(index / resolution.x) 
	entity.mesh.position.z = Math.random() < 0.5 ? -1 : resolution.z
	entity.mesh.position.y = -index % resolution.x -1
	if(temp == -1) {
		entity.mesh.rotation.x = -Math.PI / 2
	} else if (temp == resolution.x) {
		entity.mesh.rotation.x = Math.PI / 2
	}
	entities.push(entity)
	scene.add(entity.mesh)
}

function generateEntities() {
	for (let i = 0; i < 30; i++) {
		addEntityX()
		addEntityY()
		addEntityZ()
	}

	entities.sort((a, b) => {
		const c = new THREE.Vector3(
			resolution.x / 2 - 0.5,
			0,
			resolution.y / 2 - 0.5
		)

		const distanceA = a.position.clone().sub(c).length()
		const distanceB = b.position.clone().sub(c).length()

		return distanceA - distanceB
	})

	gsap.from(
		entities.map((entity) => entity.mesh.scale),
		{
			x: 0,
			y: 0,
			z: 0,
			duration: 1,
			ease: 'elastic.out(1.5, 0.5)',
			stagger: {
				grid: [20, 20],
				amount: 0.7,
			},
		}
	)
}

generateEntities()

scene.add(dirLight)
scene.add(ambLight)

// snake.addTailNode()

const audio = document.getElementById('audio')
const btnVolume = document.getElementById('btn-volume')
const btnPlay = document.getElementById('btn-play')
const btnPlayImg = document.getElementById('btn-play-img')

gsap.fromTo(
	btnPlay,
	{ autoAlpha: 0, scale: 0, yPercent: -50, xPercent: -50 },
	{
		duration: 0.8,
		autoAlpha: 1,
		scale: 1,
		yPercent: -50,
		xPercent: -50,
		delay: 0.3,
		ease: `elastic.out(1.2, 0.7)`,
	}
)

btnPlay.addEventListener('click', function () {
	audio.play()

	gsap.to(camera.position, {
        ...finalPosition,
        duration: 2,
        onUpdate: () => {
            // Camera luôn nhìn vào điểm cụ thể
			// camera.rotation.y += Math.PI / 2;
			
            camera.lookAt(resolution.x / 2, 0, resolution.y / 2);
        },
    });
	
	
	gsap.to(scene.fog, { duration: 2, near: isMobile ? 30 : 20, far: 70 })

	gsap.to(this, {
		duration: 1,
		scale: 0,
		ease: `elastic.in(1.2, 0.7)`,
		onComplete: () => {
			this.style.visibility = 'hidden'
		},
	})

	registerEventListener()
})

const userVolume = localStorage.getItem('volume')
// console.log('user volume', userVolume)
if (userVolume === 'off') {
	muteVolume()
}

const initialVolume = audio.volume

btnVolume.addEventListener('click', function () {
	if (audio.volume === 0) {
		unmuteVolume()
	} else {
		muteVolume()
	}
})

function muteVolume() {
	localStorage.setItem('volume', 'off')
	gsap.to(audio, { volume: 0, duration: 1 })
	btnVolume.classList.remove('after:hidden')
	btnVolume.querySelector(':first-child').classList.remove('animate-ping')
	btnVolume.classList.add('after:block')
}

function unmuteVolume() {
	localStorage.setItem('volume', 'on')
	btnVolume.classList.add('after:hidden')
	btnVolume.querySelector(':first-child').classList.add('animate-ping')
	btnVolume.classList.remove('after:block')
	gsap.to(audio, { volume: initialVolume, duration: 1 })
}

const topBar = document.querySelector('.top-bar')
const topBarItems = document.querySelectorAll('.top-bar__item')

gsap.set(topBarItems, { y: -200, autoAlpha: 0 })

gsap.to(topBar, {
	opacity: 1,
	delay: 0.3,
	onComplete: () => {
		gsap.to(topBarItems, {
			duration: 1,
			y: 0,
			autoAlpha: 1,
			ease: `elastic.out(1.2, 0.9)`,
			stagger: {
				amount: 0.3,
			},
		})
	},
})

const paletteSelectors = document.querySelectorAll('[data-color]')
gsap.to(topBar, {
	opacity: 1,
	delay: 0.5,
	onComplete: () => {
		gsap.to(paletteSelectors, {
			duration: 1,
			x: 0,
			autoAlpha: 1,
			ease: `elastic.out(1.2, 0.9)`,
			stagger: {
				amount: 0.2,
			},
		})
	},
})

paletteSelectors.forEach((selector) =>
	selector.addEventListener('click', function () {
		const paletteName = this.dataset.color
		applyPalette(paletteName)
	})
)

const manager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(manager)


manager.onLoad = () => {
	// console.log('texture caricate')
}

applyPalette(paletteName)


/**
 * frame loop
 */
function tic() {
	/**
	 * tempo trascorso dal frame precedente
	 */
	// const deltaTime = clock.getDelta()
	/**
	 * tempo totale trascorso dall'inizio
	 */
	// const time = clock.getElapsedTime()

	// controls.update()

	renderer.render(scene, camera)

	requestAnimationFrame(tic)
}

requestAnimationFrame(tic);

window.addEventListener('resize', handleResize);

function handleResize() {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	renderer.setSize(sizes.width, sizes.height);

	const pixelRatio = Math.min(window.devicePixelRatio, 2);
	renderer.setPixelRatio(pixelRatio);
}

