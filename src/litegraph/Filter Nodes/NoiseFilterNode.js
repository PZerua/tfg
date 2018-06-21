//node constructor class
function NoiseFilterNode() {

    this.addInput("Heightmap");
    this.addInput("Frequency");
    this.addInput("Amplitude");
    this.addOutput("Heightmap");

    this.size[1] += 128.0;
}

//name to show
NoiseFilterNode.title = "Noise Filter";

//function to call when the node is executed
NoiseFilterNode.prototype.onExecute = function() {

    // Receive heightmap Obj and copy its contents (I don't want to modify it being a reference, bad things can happen)
    var heightmapOBJ = this.getInputData(0);
    if (heightmapOBJ === undefined) {
        return
    } else {
        this.heighmapOBJ = Object.assign({}, heightmapOBJ);
    }

    var frequency = this.getInputData(1);
    if (frequency === undefined)
        frequency = 0.3;

    amplitude = this.getInputData(2);
    if (amplitude === undefined)
        amplitude = 1.0;

    var self = this;
    var setFilterUniformsCallback = function() {
        self.fboFilter.shader.setInt("u_heightmapTexture", 0);
        gl.activeTexture(gl.TEXTURE0);
        self.heighmapOBJ.heightmapTexture.bind();

        self.fboFilter.shader.setFloat("u_frequency", frequency);
        self.fboFilter.shader.setFloat("u_amplitude", amplitude);
    }

    // --- Create normal map and save it in the provided texture ---
    // Create texture to be filled by the framebuffer
    var filterTexture = new Texture(this.heighmapOBJ.size, this.heighmapOBJ.size, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // Create framebuffer providing the texture and a custom shader
    this.fboFilter = new FrameBuffer(this.heighmapOBJ.size, this.heighmapOBJ.size, filterTexture, "noiseFilter", setFilterUniformsCallback);

    this.fboFilter.render();

    this.heighmapOBJ.heightmapTexture = filterTexture;

    // To display heightmap texture in node
    this.img = this.fboFilter.toImage();

    this.setOutputData(0, this.heighmapOBJ);
}


NoiseFilterNode.prototype.onDrawBackground = function(ctx)
{
    if(this.img) {
        ctx.drawImage(this.img, 0, this.inputs.length * 16.0, this.size[0], this.size[1] - this.inputs.length * 16.0);
    }
}

//register in the system
LiteGraph.registerNodeType("heightmap/noiseFilter", NoiseFilterNode);
