import * as THREE from 'three';

function getGeometryArea(geometry) {
    let areaTotal = 0;

    const numberTriangles = geometry.index.count/3;

    const tri = new THREE.Triangle(); // for reuse 
    const indices = new THREE.Vector3();  // for reuse 
    for(let f = 0; f < numberTriangles; f++){
        indices.fromArray(geometry.index.array, f * 3)
        tri.setFromAttributeAndIndices(geometry.attributes.position, indices.x, indices.y, indices.z)
        areaTotal += tri.getArea();
    }
    return areaTotal;
}

function getTrianglePoints(triangle, numberPoints) {

    const p = new THREE.Vector3(); // for reuse in function
    function getRandomTrianglePoint(triangle) {
        const r1 = Math.random();
        const r2 = Math.random();
        const sqrtR1 = Math.sqrt(r1);
        p.x = (1 - sqrtR1) * triangle.a.x + (sqrtR1 * (1 - r2)) * triangle.b.x + (sqrtR1 * r2) * triangle.c.x;
        p.y = (1 - sqrtR1) * triangle.a.y + (sqrtR1 * (1 - r2)) * triangle.b.y + (sqrtR1 * r2) * triangle.c.y;
        p.z = (1 - sqrtR1) * triangle.a.z + (sqrtR1 * (1 - r2)) * triangle.b.z + (sqrtR1 * r2) * triangle.c.z;
        return p.toArray();
    }

    let points = [];

    for(let i = 0; i < numberPoints; i++) {
        points.push(getRandomTrianglePoint(triangle));
    }
    return points;
}

export default function getPoints(geometry, particleCount) {

    if(!geometry.isBufferGeometry) {
        console.log('wrong input')
        return;
    }

    const areaTotal = getGeometryArea(geometry);
    const areaPerParticle = areaTotal/particleCount;
    const numberTriangles = geometry.index.count/3;
    let remainingParticles = particleCount;
    let points = [];

    const tri = new THREE.Triangle(); // for reuse 
    const indices = new THREE.Vector3();  // for reuse 
    for(let f = 0; f < numberTriangles; f++){
        indices.fromArray(geometry.index.array, f * 3)
        tri.setFromAttributeAndIndices(geometry.attributes.position, indices.x, indices.y, indices.z)
        
        let numberPointsToDistribute = Math.round(tri.getArea() / areaPerParticle);
        
        if(numberPointsToDistribute > remainingParticles || f==numberTriangles-1) {
            numberPointsToDistribute = remainingParticles;
        }

        remainingParticles -= numberPointsToDistribute;
        if(numberPointsToDistribute > 0) {
            const pts = getTrianglePoints(tri, numberPointsToDistribute);
            points.push(...pts);
        }
    }
    return points;
}