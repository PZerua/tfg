//node constructor class
function MinFilterNode() {

    this.addInput("Heightmap0");
    this.addInput("Heightmap1");
    this.addOutput("Heightmap");

}

//name to show
MinFilterNode.title = "Min Filter";
MinFilterNode.position = [10, 50];
MinFilterNode.size = [300, 50];

//function to call when the node is executed
MinFilterNode.prototype.onExecute = function() {

    // Receive heightmap Obj and copy its contents (I don't want to modify it being a reference, bad things can happen)
    var heightmapOBJ_0 = this.getInputData(0);
    if (heightmapOBJ_0 === undefined) {
        return
    } else {
        this.heightmapOBJ_0 = Object.assign({}, heightmapOBJ_0);
    }

    // Receive heightmap Obj and copy its contents (I don't want to modify it being a reference, bad things can happen)
    var heightmapOBJ_1 = this.getInputData(1);
    if (heightmapOBJ_1 === undefined) {
        return
    } else {
        this.heightmapOBJ_1 = Object.assign({}, heightmapOBJ_1);
    }

    if (this.heightmapOBJ_0.size !== this.heightmapOBJ_1.size) {
        console.error("Size missmatch between heightmaps");
        return;
    }

    var self = this;
    var setFilterUniformsCallback = function() {
        self.fboFilter.shader.setInt("u_heightmapTexture0", 0);
        gl.activeTexture(gl.TEXTURE0);
        self.heightmapOBJ_0.heightmapTexture.bind();

        self.fboFilter.shader.setInt("u_heightmapTexture1", 1);
        gl.activeTexture(gl.TEXTURE1);
        self.heightmapOBJ_1.heightmapTexture.bind();
    }

    // --- Create normal map and save it in the provided texture ---
    // Create texture to be filled by the framebuffer
    var filterTexture = new Texture(this.heightmapOBJ_0.size, this.heightmapOBJ_0.size, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // Create framebuffer providing the texture and a custom shader
    this.fboFilter = new FrameBuffer(this.heightmapOBJ_0.size, this.heightmapOBJ_0.size, filterTexture, "minFilter", setFilterUniformsCallback);

    this.fboFilter.render();

    this.heightmapOBJ_0.heightmapTexture = filterTexture;

    this.setOutputData(0, this.heightmapOBJ_0);
}

//register in the system
LiteGraph.registerNodeType("heightmap/minFilter", MinFilterNode);