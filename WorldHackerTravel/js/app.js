var scene, camera, renderer, controls, orbit,  WIDTH, HEIGHT;
var mouse = new THREE.Vector2(), INTERSECTED, raycaster;
var hover_scale = 1.05;
var normal_scale = 1.0;
var root_solid = 0, root_border = 0;

function add_shape(shape_points) {
    var shape = new THREE.Shape(shape_points);
    var shape_geom;
    var inner_radius = 30;
    var outer_radius = 35;

    shape_geom = shape.extrude({
        amount: outer_radius - inner_radius,
        bevelEnabled: false
    });

    var color = new THREE.Color(0xC0C0C0);
    color.setHSL(Math.random(),0.8,0.8 );

    var shape_material = new THREE.MeshPhongMaterial({
        color: color,
        side: THREE.DoubleSide
    });
    var shape_mesh = new THREE.Mesh(shape_geom, shape_material);

    // wireframe
    var geo = new THREE.EdgesGeometry( shape_mesh.geometry ); // or WireframeGeometry
    var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 1 } );
    var wireframe = new THREE.LineSegments( geo, mat );
    root_border.add( wireframe );

    shape_mesh.centroid = new THREE.Vector3();
    for (var i = 0, l = shape_geom.vertices.length; i < l; i++) {
        shape_mesh.centroid.add(shape_geom.vertices[i].clone());
    }
    shape_mesh.centroid.divideScalar(shape_geom.vertices.length);
    var offset = shape_mesh.centroid.clone();

    shape_mesh.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offset.x, -offset.y, -offset.z));

    shape_mesh.position.copy(shape_mesh.centroid);

    root_solid.add(shape_mesh);
}

function create_countries() {

    if ( root_solid ) {
        scene.remove(root_solid);
    }

    root_solid = new THREE.Object3D();
    scene.add(root_solid);

    if ( root_border ) {
        scene.remove(root_border);
    }

    root_border = new THREE.Object3D();
    scene.add(root_border);

    countries.features.forEach(function (country) {
        if (country.geometry.coordinates.length === 1) {
            var shape_points = [];
            country.geometry.coordinates[0].forEach(function (points) {
                shape_points.push(new THREE.Vector2(points[0], points[1]));
            });
            add_shape(shape_points);
        } else {
            country.geometry.coordinates.forEach(function (coord_set) {
                if (coord_set.length == 1) {
                    var shape_points = [];
                    coord_set[0].forEach(function (points) {
                        shape_points.push(new THREE.Vector2(points[0], points[1]));
                    });
                    add_shape(shape_points);
                } else {
                    var shape_points = [];
                    coord_set.forEach(function (points) {
                        shape_points.push(new THREE.Vector2(points[0], points[1]));
                    });
                    add_shape(shape_points);
                }
            });
        }
    });

    root_solid.scale.z = 0.01;
    root_border.scale.z = 0.01;
}

function create_continents(){
    if ( root_solid ) {
        scene.remove(root_solid);
    }

    root_solid = new THREE.Object3D();
    scene.add(root_solid);

    if ( root_border ) {
        scene.remove(root_border);
    }

    root_border = new THREE.Object3D();
    scene.add(root_border);

    lands.features.forEach(function (land) {
        land.geometry.coordinates.forEach(function (coord_set) {
            if (coord_set.length == 1) {
                var shape_points = [];
                coord_set[0].forEach(function (points) {
                    shape_points.push(new THREE.Vector2(points[0], points[1]));
                });
                add_shape(shape_points);
            } else {
                var shape_points = [];
                coord_set.forEach(function (points) {
                    shape_points.push(new THREE.Vector2(points[0], points[1]));
                });
                add_shape(shape_points);
            }
        });
    });
}

function createLights() {
    //light = new THREE.HemisphereLight(0xffffff, 0xffffff, .5)

    shadowLight = new THREE.DirectionalLight(0xffffff, .8);
    shadowLight.position.set(200, 200, 200);
    shadowLight.castShadow = true;
    shadowLight.shadowDarkness = .2;

    backLight = new THREE.DirectionalLight(0xffffff, .4);
    backLight.position.set(-100, 200, 50);
    backLight.shadowDarkness = .1;
    backLight.castShadow = true;

    scene.add(backLight);
    //scene.add(light);
    scene.add(shadowLight);
}

function createMapPointer(x, y){

    var geometry = new THREE.CircleGeometry( 1.3, 32 );
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var circle = new THREE.Mesh( geometry, material );
    circle.position.x = x;
    circle.position.y = y;
    circle.position.z = 0.1;
    scene.add( circle );

    geometry = new THREE.CircleGeometry( 1, 32 );

    var loader = new THREE.TextureLoader();
    var texture = THREE.ImageUtils.loadTexture('img/avatar.png');
    material = new THREE.MeshBasicMaterial( { map: texture } );
    var circleAvatar = new THREE.Mesh( geometry, material );
    circleAvatar.position.x = x;
    circleAvatar.position.y = y;
    circleAvatar.position.z = 0.1;
    scene.add( circleAvatar );
}

function render(){
    raycaster.setFromCamera( mouse, camera );
    renderer.render(scene, camera);
}

function onDocumentMouseMove( event ) {
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onDocumentMouseUp(event) {
    event.preventDefault();
    var intersects = raycaster.intersectObjects( root_solid.children );

    var rightclick;
    if (event.which) 
        rightclick = (event.which == 3);
    else if (event.button) 
        rightclick = (event.button == 2);
    
    if ( intersects.length > 0 ) {
        var intersected = intersects[0].object;
        intersected.geometry.computeBoundingBox();
        var values = intersected.geometry.boundingBox.clone();
        
        if(rightclick){
            createMapPointer(intersects[0].point.x, intersects[0].point.y);
        }else{
            if(camera.position.x == intersected.position.x &&
            camera.position.y == intersected.position.y &&
            camera.position.z == Math.max( Math.abs(values.min.x - values.max.x), Math.abs(values.min.y - values.max.y) ) * 1.5){
                controls.reset();
            }else if(intersected.position.x != 0 || intersected.position.y != 0){
                camera.position.x = intersected.position.x;
                camera.position.y = intersected.position.y;
                camera.position.z = Math.max( Math.abs(values.min.x - values.max.x), Math.abs(values.min.y - values.max.y) ) * 1.5;            
            } 
        }
    }else{
        if(!rightclick) controls.reset();
    }
}

function animate() {
    requestAnimationFrame( animate );
    render();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function init(type){
    //criando a cena
    scene = new THREE.Scene();
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    
    camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1000);
    camera.position.z = 210;
    controls = new THREE.TrackballControls( camera );
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( WIDTH, HEIGHT );
    document.getElementsByTagName('body')[0].appendChild( renderer.domElement  );


    createLights();
    switch(type){
        case "country":
            create_countries();
        break;
        case "continent":
            create_continents();
        break;
        default:
        break;                    
    }
    renderer.render(scene, camera);

    raycaster = new THREE.Raycaster();
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    window.addEventListener('resize', onWindowResize, false);
    animate();
}