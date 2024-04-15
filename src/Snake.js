import { Mesh, MeshNormalMaterial } from "three";
import LinkedKList from "./LinkedList";
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import ListNode from "./ListNode";

const NODE_GEOMETRY = new RoundedBoxGeometry(0.9, 0.9, 0.9, 5, 0.1);
const NODE_MATERIAL = new MeshNormalMaterial();

export default class Snake {
    
    constructor({scene}) {
        this.scene = scene;
        const head = new ListNode(new SnakeNode());
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
        this.end.linkTo(node);
    }
}

class SnakeNode {
    constructor(){
        this.mesh = new Mesh(NODE_GEOMETRY, NODE_MATERIAL);
    }
}