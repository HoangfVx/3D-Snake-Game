import gsap from 'gsap'

export default class Entity {
    constructor(mesh, resolution, option = { size: 1.5, number: 0.5 }) {
        this.mesh = mesh;

        mesh.castShadow = true
		mesh.receiveShadow = true

        this.resolution = resolution;
        this.option = option
        this.usedIndexes = new Set();
    }
    get position() {
        return this.mesh.position;
    }

    getIndexByCoord() {
        const { x, y, z } = this.resolution; // Lấy kích thước không gian 3D
        let index = (this.mesh.position.z * x * y * z) + (this.mesh.position.y * x * y) + this.mesh.position.x ; // Tính toán index dựa trên vị trí x, y, z


        return index;
    }     

    in() {
		gsap.from(this.mesh.scale, {
			duration: 1,
			x: 0,
			y: 0,
			z: 0,
			ease: `elastic.out(${this.option.size}, ${this.option.number})`,
		})
	}

	out() {}
}