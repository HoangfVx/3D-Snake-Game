import { Mesh, MeshNormalMaterial, Vector2, Vector3 } from "three";
import LinkedKList from "./LinkedList";
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import ListNode from "./ListNode";

const NODE_GEOMETRY = new RoundedBoxGeometry(0.9, 0.9, 0.9, 5, 0.1);
const NODE_MATERIAL = new MeshNormalMaterial();

const UP = new Vector3(0, 0, -1);
const DOWN = new Vector3(0, 0, 1);
const LEFT = new Vector3(-1, 0, 0);
const RIGHT = new Vector3(1, 0, 0);

export default class Snake {
    
    direction = UP;

    constructor({scene, resolution = new Vector2(10, 10)}) {
        this.scene = scene;
        const head = new ListNode(new SnakeNode());
        this.resolution = resolution;
        head.data.mesh.position.x = resolution.x / 2;
        head.data.mesh.position.z = resolution.y / 2;
        this.body = new LinkedKList(head);
        scene.add(head.data.mesh);
        for (let i = 0; i < 3; i++){
            this.addTailNode();
        }
    }

    get head() {
        return this.body.head;
    }

    get end(){
        return this.body.end;
    }

    addTailNode(){
        const node = new ListNode(new SnakeNode());
        const position = this.end.data.mesh.position.clone();
        position.sub(this.direction);
        node.data.mesh.position.copy(position);
        this.body.addNode(node);
        this.scene.add(node.data.mesh);
    }
}

class SnakeNode {
    constructor(){
        this.mesh = new Mesh(NODE_GEOMETRY, NODE_MATERIAL);
    }
}