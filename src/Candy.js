import {
	Mesh,
	MeshNormalMaterial,
	MeshStandardMaterial,
	SphereGeometry,
	IcosahedronGeometry
} from 'three'
import Entity from "./Entity";

const GEOMETRY = new IcosahedronGeometry(0.5, 2);
const MATERIAL = new MeshStandardMaterial({
	color: 0x614bdd,
})
export default class Candy extends Entity{
    constructor(resolution, color) {
        const mesh = new Mesh(GEOMETRY, MATERIAL);
        super(mesh, resolution);

		if (color) {
			MATERIAL.color.set(color)
		}

        this.points = Math.floor(Math.random() * 3) + 1
		this.mesh.scale.setScalar(0.5 + (this.points * 0.5) / 3)
    }
}