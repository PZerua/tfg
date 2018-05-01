var gl;

function Renderer(canvas) {

	canvas.width = window.innerWidth
		|| document.documentElement.clientWidth
		|| document.body.clientWidth;

	canvas.height = window.innerHeight
		|| document.documentElement.clientHeight
		|| document.body.clientHeight;

    gl = canvas.getContext("webgl2");

	if (!gl) {
        console.error("There is no support for WebGL2");
        return;
    }
	else console.log("WebGL2 context loaded");

	this.axes = new OriginAxes();

	// Size more than 256 exceeds the max index value: 2^16
    this.terrain = new Terrain(128, 1);

    gl.clearColor(0.109, 0.129, 0.188, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);

	gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	var self = this;
	var wireframeButton = document.getElementById("wireframeButton")
	wireframeButton.onclick = function() {
		if (self.terrain.showWireframe) {
			self.terrain.showWireframe = 0;
			wireframeButton.textContent  = "Wireframe: OFF";
		} else {
			self.terrain.showWireframe  = 1;
			wireframeButton.textContent  = "Wireframe: ON";
		}
	};
}

Renderer.prototype.render = function(camera) {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	this.axes.render(camera);
	this.terrain.render(camera);
}
