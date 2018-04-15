var Editor = {
	glCanvas : document.getElementById("glCanvas"),
    camera : new Camera(),
	renderer : undefined,
	prevMousePos: new vec2(0, 0),
	mousePos : new vec2(0, 0),
	mouseDelta: new vec2(0, 0),
	isLeftClicking : false,
	currentKeys: {},
	stats: new Stats(),
	graph : new LGraph(),
	outputNode : undefined,
	init : function() {

		this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
		document.body.appendChild( this.stats.dom );

		this.graphCanvas = new LGraphCanvas("#graphCanvas", this.graph);
		this.graphCanvas.resize();

		window.addEventListener("resize", function() { Editor.graphCanvas.resize(); } );

		// Setup litegraph defualt nodes
		var node_const = LiteGraph.createNode("basic/const");
		node_const.title = "Width";
		node_const.pos = [200,200];
		this.graph.add(node_const);
		node_const.setValue(128);

		var node_const2 = LiteGraph.createNode("basic/const");
		node_const2.title = "Height";
		node_const2.pos = [200,300];
		this.graph.add(node_const2);
		node_const2.setValue(128);

		this.outputNode = LiteGraph.createNode("heightmap/perlin");
		this.outputNode.pos = [700,200];
		this.graph.add(this.outputNode);

		node_const.connect(0, this.outputNode, 0 );
		node_const2.connect(0, this.outputNode, 1 );

		this.graph.start()

		// Setup renderer and camera
		this.renderer = new Renderer(this.glCanvas);
		this.camera.setPerspective(45.0, this.glCanvas.width / this.glCanvas.height, 0.1, 1000.0);
	    this.camera.setViewport(0, 0, this.glCanvas.width, this.glCanvas.height);

		mainLoop();
	},
};

function mainLoop() {

	Editor.stats.begin();

	Editor.mouseDelta.x = Editor.prevMousePos.x - Editor.mousePos.x;
	Editor.mouseDelta.y = Editor.prevMousePos.y - Editor.mousePos.y;

	Editor.prevMousePos.x = Editor.mousePos.x;
	Editor.prevMousePos.y = Editor.mousePos.y;

	if (Editor.currentKeys["w"] === true)
		Editor.camera.eye.add(vec3.vec3Normalize(Editor.camera.front));
	if (Editor.currentKeys["s"] === true)
		Editor.camera.eye.sub(vec3.vec3Normalize(Editor.camera.front));
	if (Editor.currentKeys["a"] === true)
		Editor.camera.eye.sub(vec3.vec3Normalize(Editor.camera.front.cross(Editor.camera.up)));
	if (Editor.currentKeys["d"] === true)
		Editor.camera.eye.add(vec3.vec3Normalize(Editor.camera.front.cross(Editor.camera.up)));

	if (Editor.isLeftClicking)
		Editor.camera.addYawPitch(-Editor.mouseDelta.x * 0.2, Editor.mouseDelta.y * 0.2);

	Editor.camera.update();

	Editor.renderer.render(Editor.camera);

	Editor.stats.end();

	requestAnimationFrame(mainLoop);
}

window.addEventListener("resize", function(event) {

	Editor.glCanvas.width = window.innerWidth
	Editor.glCanvas.height = window.innerHeight

	Editor.camera.setPerspective(45.0, Editor.glCanvas.width / Editor.glCanvas.height, 0.1, 1000.0);
	Editor.camera.setViewport(0, 0, Editor.glCanvas.width, Editor.glCanvas.height);

});

Editor.glCanvas.addEventListener("mousemove", function(event) {


	Editor.mousePos.x = event.clientX;
	Editor.mousePos.y = event.clientY;

});

Editor.glCanvas.addEventListener("mousedown", function(event) {
    if (event.which === 1) {
		Editor.isLeftClicking = true;
    }
});

Editor.glCanvas.addEventListener("mouseup", function(event) {
    if (event.which === 1) {
		Editor.isLeftClicking = false;
    }
});

document.addEventListener("keydown", function (event) {

	Editor.currentKeys[event.key] = true;

}, true);

document.addEventListener("keyup", function (event) {

	Editor.currentKeys[event.key] = false;

}, true);
