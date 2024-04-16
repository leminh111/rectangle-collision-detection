// ===================================================
//  Collision detection (using Separate Axis Theorum)
// ===================================================

// rectA: { rect: Rect, rotation: number }
function isCollided(rectA, rectB) {
    // The 4 axis that have the same angle as the rectangles' side
    const axisAngles = [rectA.rotation, rectB.rotation, rectA.rotation + 90, rectB.rotation + 90].filter((angle, index, array) => array.indexOf(angle) === index);
    const everOverlap = axisAngles.map(angle => [hasOverlap(rectA.rect, rectB.rect, angle), angle]);
    // 2 rectangles have no collision when there is no gap from any axis angle (all axis angles have overlapping)
    return everOverlap.every(([overlap]) => !!overlap);
}

// Check if 2 rectangles have any overlap on a particular axis
function hasOverlap(rectA, rectB, rotation) {
    const aMagnitudes = rectProjections(rectA, rotation);
    const bMagnitudes = rectProjections(rectB, rotation);
    return Math.min(...aMagnitudes) < Math.max(...bMagnitudes) && Math.max(...aMagnitudes) > Math.min(...bMagnitudes);
}

// params
// vertices: 4 vertices of a rectangle
// rotation of the axis to get the magnitude
// returns the magnitude of 4 vertices on the axis
function rectProjections(vertices, rotation) {
    return vertices.map(vector => vectorProjection(vector, rotation));
}

// scalarProjectMagnitude returns a scalar magnitude of 2 vectors
// param: vector. Vector: [x, y]
//        rotation. Rotation: number in degree
// return: magnitude of the original vector on the axis
function vectorProjection(vector, rotation) {
    const unitVectorAxis = [Math.cos(toRadian(rotation)), Math.sin(toRadian(rotation))];
    const product = dotProduct(vector, unitVectorAxis);
    return product;
    // Round to 2 decimal places
    // return Math.round(product * 100) / 100;
}

// dotProduct of 2 vectors.
// param: 2 vectors. Vector: [x, y]
// return: magnitude of the first vector on the second vector
function dotProduct([ax, ay], [bx, by]) {
    return ax * bx + ay * by;
}

function toRadian(degree) {
    return degree * Math.PI / 180;
}


// ===================================================
//         UI playground - Rectangle dragging
// ===================================================
(function setUp() {
    const static = document.getElementById('second');
    const rectA = {
        rect: rectVertices(static, 0),
        rotation: 0,
    };
    const rect = document.getElementById('first');
    let rotation = 0;
    document.addEventListener('mousemove', e => {
        rect.style.top = `${e.y}px`;
        rect.style.left = `${e.x}px`;
        const rectB = {
            rect: rectVertices(rect, rotation),
            rotation,
        };
        console.log('=============================');
        console.log(isCollided(rectA, rectB));
        // TODO show when it's collided, which axis are considered and has no gap
    });
    document.addEventListener('click', () => {
        rotation += 15;
        rect.style.transform = `rotate(${rotation}deg)`
    });
})();

// When a DOM element is rotated via the CSS transform property, the top, left, bottom, right property of that element
// is actually its bounding box. To get the rotated rectangle's vertices, we need the bounding box's vertices and its rotate angle.
// Return 4 vertices of the rotated angle.
function rectVertices(dom, rotation) {
    const { top, left, bottom, right } = dom.getBoundingClientRect();
    // Hacky
    // the angle that's 0 <= theta <= 90
    const theta = 90 - Math.abs(90 - (rotation % 180));

    // Fixed values
    const height = 100;
    const width = 150;
    let small = Math.sin(toRadian(theta)) * height;
    let large = Math.sin(toRadian(theta)) * width;

    // Super hacky
    if (rotation % 180 > 90) {
        small = Math.sin(toRadian(90 - theta)) * width;
        large = Math.sin(toRadian(90 - theta)) * height;
    }

    const newTopLeft = [small + left, top];
    const newTopRight = [right, large + top];
    const newBottomLeft = [left, bottom - large];
    const newBottomRight = [right - small, bottom];
    return [ newTopLeft, newTopRight, newBottomRight, newBottomLeft ];
}
