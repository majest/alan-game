// MAIN

// standard global variables

// custom global variables



alan = function() {

    var container, scene, camera, renderer, controls, stats;
    var keyboard = new THREEx.KeyboardState();
    var clock = new THREE.Clock();
    var ship;

    // FUNCTIONS        
    init = function() {

        // SCENE
        scene = new THREE.Scene();

        // CAMERA
        var SCREEN_WIDTH = window.innerWidth,
            SCREEN_HEIGHT = window.innerHeight;
        var VIEW_ANGLE = 45,
            ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
            NEAR = 0.1,
            FAR = 20000;
        camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        scene.add(camera);
        camera.position.set(0, 100, 0);
        camera.lookAt(scene.position);

        // RENDERER
        if (Detector.webgl)
            renderer = new THREE.WebGLRenderer({
                antialias: true
            });
        else
            renderer = new THREE.CanvasRenderer();
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        container = document.body;
        container.appendChild(renderer.domElement);

        // EVENTS
        THREEx.WindowResize(renderer, camera);
        THREEx.FullScreen.bindKey({
            charCode: 'm'.charCodeAt(0)
        });

        // CONTROLS
        controls = new THREE.OrbitControls(camera, renderer.domElement);

        // STATS
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.bottom = '0px';
        stats.domElement.style.zIndex = 100;
        container.appendChild(stats.domElement);

        ;
        (function() {
            // add a ambient light
            var light = new THREE.AmbientLight(0xffffff)
            scene.add(light)
            // add a light in front
            var light = new THREE.DirectionalLight('white', 10)
            light.position.set(0.5, 0.5, 2)
            scene.add(light)
            // add a light behind
            var light = new THREE.DirectionalLight('white', 10)
            light.position.set(-0.5, -0.5, -2)
            scene.add(light)
        })()

        addShip();
    }


    addShip = function() {

        THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());

        var loader = new THREE.OBJMTLLoader();
        loader.load('models/SpaceFighter03/SpaceFighter03.obj', 'models/SpaceFighter03/SpaceFighter03.mtl', function(object) {
            object.position.y = 0;
            ship = object;
            scene.add(ship);
            stars(scene);
        });
    }


    animate = function() {
        requestAnimationFrame(animate);
        render();
        update();
    }

    update = function() {
        var delta = clock.getDelta(); // seconds.
        var moveDistance = 200 * delta; // 200 pixels per second
        var rotateAngle = Math.PI / 2 * delta; // pi/2 radians (90 degrees) per second

        // local transformations

        // move forwards/backwards/left/right
        if (keyboard.pressed("S"))
            ship.translateZ(-moveDistance);
        if (keyboard.pressed("W"))
            ship.translateZ(moveDistance);
        if (keyboard.pressed("Q"))
            ship.translateX(-moveDistance);
        if (keyboard.pressed("E"))
            ship.translateX(moveDistance);

        // rotate left/right/up/down
        var rotation_matrix = new THREE.Matrix4().identity();
        if (keyboard.pressed("A"))
            ship.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotateAngle);
        if (keyboard.pressed("D"))
            ship.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotateAngle);
        if (keyboard.pressed("R"))
            ship.rotateOnAxis(new THREE.Vector3(1, 0, 0), rotateAngle);
        if (keyboard.pressed("F"))
            ship.rotateOnAxis(new THREE.Vector3(1, 0, 0), -rotateAngle);

        if (keyboard.pressed("Z")) {
            ship.position.set(0, 25.1, 0);
            ship.rotation.set(0, 0, 0);
        }

        var relativeCameraOffset = new THREE.Vector3(0, 100, 0);

        if (ship) {
            var cameraOffset = relativeCameraOffset.applyMatrix4(ship.matrixWorld);

            camera.position.x = cameraOffset.x;
            camera.position.y = cameraOffset.y;
            camera.position.z = cameraOffset.z;
            //camera.lookAt(ship.position);

            camera.updateMatrix();
            camera.updateProjectionMatrix();
        }

        stats.update();
    }

    render = function() {
        renderer.render(scene, camera);
    }

    return this;

}

var a = alan();
a.init();
a.animate();