import {
	EventDispatcher,
	Mesh,
	MeshNormalMaterial,
	MeshStandardMaterial,
	SphereGeometry,
	Vector2,
	Vector3,
	TextureLoader
} from 'three'
import * as THREE from 'three'
import LinkedKList from "./LinkedList";
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import ListNode from "./ListNode";
import Entity from "./Entity";

const texture = new TextureLoader().load('../assets/crepper.png' ); 
const NODE_GEOMETRY = new RoundedBoxGeometry(0.9, 0.9, 0.9, 5, 0.1);
const NODE_MATERIAL = new MeshStandardMaterial({
	map: texture,
	side: THREE.DoubleSide
})

const UP = new Vector3(0, 0, -1);
const DOWN = new Vector3(0, 0, 1);
const LEFT = new Vector3(-1, 0, 0);
const RIGHT = new Vector3(1, 0, 0);
const HIGH = new Vector3(0, 1, 0);
const LOW = new Vector3(0, -1, 0);

export default class Snake extends EventDispatcher {
    
    direction = RIGHT;
    indexes = [];
	speedInterval = 240
    constructor({scene, resolution = new Vector3(10, 10, 10), color, mouthColor }) {
        
        super()
        
        this.scene = scene
        this.resolution = resolution
		this.mouthColor = mouthColor

		if (color) {
			NODE_MATERIAL.map.set(color)
		}

        this.init()
    }

    get head() {
        return this.body.head;
    }

    get end(){
        return this.body.end;
    }

	get headPosition() {
        return this.head.data.mesh.position.clone();
    }

	get Direction() {
        return this.head.data.mesh.direction;
    }

    createHeadMesh() {
		const headMesh = this.body.head.data.mesh

		const leftEye = new Mesh(
			new SphereGeometry(0.2, 10, 10),
			new MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide })
		)
		leftEye.scale.x = 0.1
		leftEye.position.x = 0.5
		leftEye.position.y = 0.12
		leftEye.position.z = -0.1

		let leftEyeHole = new Mesh(
			new SphereGeometry(0.22, 10, 10),
			new MeshStandardMaterial({ color: 0x333333, side: THREE.DoubleSide })
		)
		leftEyeHole.scale.set(1, 0.6, 0.6)
		leftEyeHole.position.x += 0.05
		leftEye.add(leftEyeHole)

		const rightEye = leftEye.clone()

		rightEye.position.x = -0.5
		rightEye.rotation.y = Math.PI

		const mouthMesh = new Mesh(
			new RoundedBoxGeometry(1.05, 0.1, 0.6, 5, 0.1),
			new MeshStandardMaterial({
				color: this.mouthColor, //0x614bdd,
				side: THREE.DoubleSide
			})
		)

		mouthMesh.rotation.x = -Math.PI * 0.07
		mouthMesh.position.z = 0.23
		mouthMesh.position.y = -0.19

		this.mouth = mouthMesh

		headMesh.add(rightEye, leftEye, mouthMesh)

		headMesh.lookAt(headMesh.position.clone().add(this.direction))
	}

	init() {
		this.direction = RIGHT
		this.iMoving = null

		const head = new ListNode(new SnakeNode(this.resolution))

		head.data.mesh.position.x = this.resolution.x / 2
		head.data.mesh.position.y = 0
		head.data.mesh.position.z = this.resolution.z / 2
		this.body = new LinkedKList(head)

		this.createHeadMesh()

		this.indexes.push(this.head.data.getIndexByCoord())
		for (let i = 0; i < 3; i++) {
			const position = this.end.data.mesh.position.clone()
			position.sub(this.direction)
			this.addTailNode()
			this.end.data.mesh.position.copy(position)

			this.indexes.push(this.end.data.getIndexByCoord())
		}

		head.data.in()
		this.scene.add(head.data.mesh)
	}
	
    setDirection(keyCode) {

        let newDirection;

        switch (keyCode) {
            case 'ArrowUp':
			case 'KeyW':
				newDirection = UP
				break
			case 'ArrowDown':
			case 'KeyS':
				newDirection = DOWN
				break
			case 'ArrowLeft':
			case 'KeyA':
				newDirection = LEFT
				break
			case 'ArrowRight':
			case 'KeyD':
				newDirection = RIGHT
				break
			case 'KeyQ':
				newDirection = HIGH
				break
			case 'KeyE':
				newDirection = LOW
				break
			default:
				return
        }
        
        const dot = this.direction.dot(newDirection)
        if(dot === 0) {
            this.newDirection = newDirection
            }
    }

    update() {
		// Kiểm tra và cập nhật hướng di chuyển nếu cần
		if (this.newDirection) {
			this.direction = this.newDirection;
			this.newDirection = null;
		}
		let currentNode = this.end;
	
		// Kiểm tra nếu có kẹo ở cuối
		if (this.end.data.candy) {
			this.end.data.candy = null;
			this.end.data.mesh.scale.setScalar(1);
	
			this.addTailNode();
		}
	
		// Di chuyển các nút của rắn
		while (currentNode.prev) {
			const candy = currentNode.prev.data.candy;
			if (candy) {
				currentNode.data.candy = candy;
				currentNode.data.mesh.scale.setScalar(1.15);
				currentNode.prev.data.candy = null;
				currentNode.prev.data.mesh.scale.setScalar(1);
			}
	
			const position = currentNode.prev.data.mesh.position;
			currentNode.data.mesh.position.copy(position);
	
			currentNode = currentNode.prev;
		}
	
		// Cập nhật vị trí đầu rắn
		const headPos = currentNode.data.mesh.position.clone();
		headPos.add(this.direction);
		//Y và Z
		console.log(this.direction, "z= ", headPos.z, " y=", headPos.y)

		if(headPos.z >= this.resolution.z && headPos.y >= 0 && this.direction == DOWN) {
			this.direction = LOW
		} else if (headPos.z >= this.resolution.z && headPos.y >= 0 && this.direction == HIGH) {
			this.direction = UP
		}

		if(headPos.z <= -1 && headPos.y >= 0 && this.direction == UP) {
			this.direction = LOW
		} else if(headPos.z <= -1 && headPos.y >= 0 && this.direction == HIGH) {
			this.direction = DOWN
		}

		if(headPos.z <= -1 && headPos.y <= -this.resolution.y - 1 && this.direction == LOW) {
			this.direction = DOWN
		} else if(headPos.z <= -1 && headPos.y <= -this.resolution.y - 1 && this.direction == UP) {
			this.direction = HIGH
		}
		
		if(headPos.z >= this.resolution.y && headPos.y <= -this.resolution.y - 1 && this.direction == LOW) {
			this.direction = UP
		} else if(headPos.z >= this.resolution.y && headPos.y <= -this.resolution.y - 1 && this.direction == DOWN) {
			this.direction = HIGH
		}
		
		//X và Y

		if(headPos.x >= this.resolution.x && headPos.y >= 0 && this.direction == RIGHT) {
			this.direction = LOW
		} else if (headPos.x >= this.resolution.x && headPos.y >= 0 && this.direction == HIGH) {
			this.direction = LEFT
		}

		if(headPos.x <= -1 && headPos.y >= 0 && this.direction == LEFT) {
			this.direction = LOW
		} else if(headPos.x <= -1 && headPos.y >= 0 && this.direction == HIGH) {
			this.direction = RIGHT
		}

		if(headPos.x <= -1 && headPos.y <= -this.resolution.y - 1 && this.direction == LOW) {
			this.direction = RIGHT
		} else if(headPos.x <= -1 && headPos.y <= -this.resolution.y - 1 && this.direction == LEFT) {
			this.direction = HIGH
		}
		
		if(headPos.x >= this.resolution.y && headPos.y <= -this.resolution.y - 1 && this.direction == LOW) {
			this.direction = LEFT
		} else if(headPos.x >= this.resolution.y && headPos.y <= -this.resolution.y - 1 && this.direction == RIGHT) {
			this.direction = HIGH
		}

		//X và z

		if(headPos.z >= this.resolution.z && headPos.x <= -1 && this.direction == LEFT) {
			this.direction = UP
		} else if (headPos.z >= this.resolution.z && headPos.x <= -1 && this.direction == DOWN) {
			this.direction = RIGHT
		}

		if(headPos.z <= -1 && headPos.x <= -1 && this.direction == LEFT) {
			this.direction = DOWN
		} else if(headPos.z <= -1 && headPos.x <= -1 && this.direction == UP) {
			this.direction = RIGHT
		}

		if(headPos.z <= -1 && headPos.x >= this.resolution.x && this.direction == UP) {
			this.direction = LEFT
		} else if(headPos.z <= -1 && headPos.x >= this.resolution.x && this.direction == RIGHT) {
			this.direction = DOWN
		}
		
		if(headPos.z >= this.resolution.z && headPos.x >= this.resolution.x && this.direction == DOWN) {
			this.direction = LEFT
		} else if(headPos.z >= this.resolution.z && headPos.x >= this.resolution.x && this.direction == RIGHT) {
			this.direction = UP
		}
				
		// Cập nhật vị trí đầu rắn
		currentNode.data.mesh.position.copy(headPos);
		const headMesh = this.body.head.data.mesh;
		headMesh.lookAt(headMesh.position.clone().add(this.direction));
	
		// Kiểm tra va chạm với chính mình
		if (this.checkSelfCollision()) {
			this.die();
			return;
		}
	
		// Cập nhật chỉ số vị trí
		this.updateIndexes();
	
		// Gọi sự kiện cập nhật
		this.dispatchEvent({ type: 'updated' });
	}
			

    die() {
		let node = this.body.head

		do {
			this.scene.remove(node.data.mesh)
			node = node.next
		} while (node)

		this.init()
		this.addEventListener({ type: 'die' })

	}

	checkSelfCollision() {
		const headIndex = this.indexes.pop()
		const collide = this.indexes.includes(headIndex)
		this.indexes.push(headIndex)
		return collide
	}

	checkEntitiesCollision(entities) {
		const headIndex = this.indexes.at(-1)

		const entity = entities.find(
			(entity) => entity.getIndexByCoord() === headIndex
		)

		return !!entity
	}

	updateIndexes() {
		this.indexes = []

		let node = this.body.end

		while (node) {
			this.indexes.push(node.data.getIndexByCoord())
			node = node.prev
		}
	}

    addTailNode(position) {
        const node = new ListNode(new SnakeNode(this.resolution))

		if (position) {
			node.data.mesh.position.copy(position)
		} else {
			node.data.mesh.position.copy(this.end.data.mesh.position)
		}

		this.body.addNode(node)
		node.data.in()
        this.scene.add(node.data.mesh);
    }
}

class SnakeNode extends Entity {
    constructor(resolution){
        const mesh = new Mesh(NODE_GEOMETRY, NODE_MATERIAL);
        super(mesh, resolution);
    }
}