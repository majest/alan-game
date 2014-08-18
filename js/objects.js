cube = function() {

    var map = THREE.ImageUtils.loadTexture('textures/steel.jpg');
    map.wrapS = map.wrapT = THREE.MirroredRepeatWrapping;
    map.anisotropy = 16;
    map.repeat.set(2, 2);
    map.shininess = 100;
    map.mapping = THREE.CubeReflectionMapping;
    map.color - 0xffffff;
    map.specular = 0xffffff;

    materials = [
        new THREE.MeshLambertMaterial({
            ambient: 0xffffff,
            map: map
        }),
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        })
    ];

    var x = 1;

    // var points = [
    //     new THREE.Vector3(x, x, x),
    //     new THREE.Vector3(x, x, -x),
    //     new THREE.Vector3(-x, x, -x),
    //     new THREE.Vector3(-x, x, x),
    //     new THREE.Vector3(x, -x, x),
    //     new THREE.Vector3(x, -x, -x),
    //     new THREE.Vector3(-x, -x, -x),
    //     new THREE.Vector3(-x, -x, x),
    // ];

    var points = [
        new THREE.Vector3(-x / 2, 0, 0),
        new THREE.Vector3(0, x, 0),
        new THREE.Vector3(x / 2, 0, 0),
    ];

    object = THREE.SceneUtils.createMultiMaterialObject(new THREE.ConvexGeometry(points), materials);
    object.position.set(0, 0, -10);
    return object;
}

cubegen = function(size, x, y) {
    cubeGeo = new THREE.BoxGeometry(size, size, size);

    cubeMaterial = new THREE.MeshLambertMaterial({
        color: 0x4444ff,
        ambient: 0x676767,
        shading: THREE.FlatShading,
        map: THREE.ImageUtils.loadTexture("textures/steel.jpg")
    });
    cubeMaterial.ambient = cubeMaterial.color;

    var obj = new THREE.Mesh(cubeGeo, cubeMaterial);
    obj.position.set(x * size, y * size, 0);
    return obj;
}

plane = function() {

    var map = THREE.ImageUtils.loadTexture('textures/UV_Grid_Sm.jpg');
    map.wrapS = map.wrapT = THREE.MirroredRepeatWrapping;
    map.anisotropy = 16;
    map.repeat.set(2, 2);
    map.shininess = 100;
    map.mapping = THREE.CubeReflectionMapping;
    map.color - 0xffffff;
    map.specular = 0xffffff;

    var material = new THREE.MeshLambertMaterial({
        ambient: 0xffffff,
        map: map,
        side: THREE.DoubleSide
    });

    object = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 4, 4), material);
    return object;
}


trianglegen = function() {
    var geometry = new THREE.Geometry();
    var v1 = new THREE.Vector3(0, 0, 0); // Vector3 used to specify position
    var v2 = new THREE.Vector3(30, 0, 0);
    var v3 = new THREE.Vector3(0, 30, 0); // 2d = all vertices in the same plane.. z = 0

    // add new geometry based on the specified positions
    geometry.vertices.push(v1);
    geometry.vertices.push(v2);
    geometry.vertices.push(v3);
    geometry.faces.push(new THREE.Face3(0, 2, 1));
    var redMat = new THREE.MeshBasicMaterial({
        color: 0xff0000
    });
    var triangle = new THREE.Mesh(geometry, redMat);
    return triangle;
}

stars = function(scene) {

    var particles, geometry, materials = [],
        parameters, i, h, color;
    geometry = new THREE.Geometry();

    for (i = 0; i < 20000; i++) {

        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * 2000 - 1000;
        vertex.y = Math.random() * 2000 - 1000;
        vertex.z = Math.random() * 2000 - 1000;

        geometry.vertices.push(vertex);

    }

    parameters = [
        [
            [1, 0.01, 0.5], 5
        ],
        [
            [0.25, 0.01, 0.1], 4
        ],
        [
            [0.90, 0.01, 0.5], 3
        ],
        [
            [0.85, 0.01, 0.5], 2
        ],
        [
            [0.80, 0.01, 0.5], 1
        ]
    ];

    for (i = 0; i < parameters.length; i++) {

        color = parameters[i][0];
        size = parameters[i][1];

        materials[i] = new THREE.PointCloudMaterial({
            size: size
        });

        particles = new THREE.PointCloud(geometry, materials[i]);

        particles.rotation.x = Math.random() * 6;
        particles.rotation.y = Math.random() * 6;
        particles.rotation.z = Math.random() * 6;

        scene.add(particles);
    }
}


stars2 = function() {

    var particleSystem, uniforms, geometry;

    var particles = 100000;


    var attributes = {

        size: {
            type: 'f',
            value: null
        },
        customColor: {
            type: 'c',
            value: null
        }

    };

    uniforms = {

        color: {
            type: "c",
            value: new THREE.Color(0xffffff)
        },

        texture: {
            type: "t",
            value: THREE.ImageUtils.loadTexture("textures/spark1.png")
        }

    };

    var shaderMaterial = new THREE.ShaderMaterial({

        uniforms: uniforms,
        attributes: attributes,
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent,

        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true

    });


    var radius = 2000;

    geometry = new THREE.BufferGeometry();

    var positions = new Float32Array(particles * 3);
    var values_color = new Float32Array(particles * 3);
    var values_size = new Float32Array(particles);

    var color = new THREE.Color();

    for (var v = 0; v < particles; v++) {

        values_size[v] = 20;

        positions[v * 3 + 0] = (Math.random() * 2 - 1) * radius;
        positions[v * 3 + 1] = (Math.random() * 2 - 1) * radius;
        positions[v * 3 + 2] = (Math.random() * 2 - 1) * radius;

        color.setHSL(v / particles, 1.0, 0.5);

        values_color[v * 3 + 0] = color.r;
        values_color[v * 3 + 1] = color.g;
        values_color[v * 3 + 2] = color.b;

    }

    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('customColor', new THREE.BufferAttribute(values_color, 3));
    geometry.addAttribute('size', new THREE.BufferAttribute(values_size, 1));

    return new THREE.PointCloud(geometry, shaderMaterial);
}


helpers = function(scene) {


    var axes = new THREE.AxisHelper(50);
    axes.position.set(40, 40, 40);
    scene.add(axes);

    var gridXZ = new THREE.GridHelper(100, 10);
    gridXZ.setColors(new THREE.Color(0x006600), new THREE.Color(0x006600));
    gridXZ.position.set(100, 0, 100);
    scene.add(gridXZ);

    var gridXY = new THREE.GridHelper(100, 10);
    gridXY.position.set(100, 100, 0);
    gridXY.rotation.x = Math.PI / 2;
    gridXY.setColors(new THREE.Color(0x000066), new THREE.Color(0x000066));
    scene.add(gridXY);

    var gridYZ = new THREE.GridHelper(100, 10);
    gridYZ.position.set(0, 100, 100);
    gridYZ.rotation.z = Math.PI / 2;
    gridYZ.setColors(new THREE.Color(0x660000), new THREE.Color(0x660000));
    scene.add(gridYZ);

    // direction (normalized), origin, length, color(hex)
    var origin = new THREE.Vector3(50, 100, 50);
    var terminus = new THREE.Vector3(75, 75, 75);
    var direction = new THREE.Vector3().subVectors(terminus, origin).normalize();
    var arrow = new THREE.ArrowHelper(direction, origin, 50, 0x884400);
    scene.add(arrow);
}