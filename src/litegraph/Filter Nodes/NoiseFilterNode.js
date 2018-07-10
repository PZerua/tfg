//node constructor class
function NoiseFilterNode() {

    this.addInput("Heightmap");
    this.addInput("Frequency");
    this.addInput("Amplitude");
    this.addOutput("Heightmap");

    this.properties = {freq:0.3,amp:1.0};

    this.size[1] += 128.0;
}

//name to show
NoiseFilterNode.title = "Noise Filter";

NoiseFilterNode.prototype.evaluateHash = function() {
    var inputsValues = [];
    for (var i = 0; i < this.inputs.length; i++) {
        var input = this.getInputData(i);

        if (input === undefined) {
            inputsValues[i] = 0;
        } else
        if (typeof input !== "number") {
            inputsValues[i] = input.heightmapTexture.hash + (input.colorTexture ? input.colorTexture.hash : "");
        } else {
            inputsValues[i] = input;
        }
    }

    // Detect terrain size changes
    inputsValues.push(Editor.terrainSize);

    var hash = Math.createHash(inputsValues);

    if (this.hash && this.hash == hash) {
        return false;
    } else {
        this.hash = hash;
        return true;
    }
}

NoiseFilterNode.prototype.onConnectionsChange = function() {
    if (this.heightmapOBJ) {
        this.setOutputData(0, this.heightmapOBJ);
    }
}

NoiseFilterNode.prototype.checkProperties = function() {
    // Receive heightmap Obj and copy its contents (I don't want to modify it being a reference, bad things can happen)
    var heightmapOBJ = this.getInputData(0);
    if (heightmapOBJ === undefined) {
        return false;
    } else {
        this.heightmapOBJ = Object.assign({}, heightmapOBJ);
    }

    // Receive size
    this.heightmapOBJ.size = Editor.terrainSize;

    var idx = 1;

    this.properties.freq = this.getInputData(idx) !== undefined ? this.getInputData(idx) : this.properties.freq;
    idx++;

    this.properties.amp = this.getInputData(idx) !== undefined ? this.getInputData(idx) : this.properties.amp;
    idx++;

    return true;
}

//function to call when the node is executed
NoiseFilterNode.prototype.onExecute = function() {

    if(!this.checkProperties()) {
        this.setOutputData(0, this.lastOBJ);
        return;
    }
    var hashChanged = this.evaluateHash()

    if (hashChanged) {
        Editor.setCalculateColor("#a0711a");
    }

    if (!Editor.calculatingImages && !hashChanged) {
        this.setOutputData(0, this.lastOBJ);
        return;
    }

    var self = this;
    var setFilterUniformsCallback = function() {
        self.fboFilter.shader.setInt("u_heightmapTexture", 0);
        gl.activeTexture(gl.TEXTURE0);
        self.heightmapOBJ.heightmapTexture.bind();

        self.fboFilter.shader.setFloat("u_frequency", self.properties.freq);
        self.fboFilter.shader.setFloat("u_amplitude", self.properties.amp);
    }

    if (!this.filterTexture) {
        // Create texture to be filled by the framebuffer
        this.filterTexture = new Texture(this.heightmapOBJ.size, this.heightmapOBJ.size, gl.RGBA32F, gl.RGBA, gl.FLOAT, null, this.hash);
        // Create framebuffer providing the texture and a custom shader
        this.fboFilter = new FrameBuffer(this.heightmapOBJ.size, this.heightmapOBJ.size, this.filterTexture, "noiseFilter", setFilterUniformsCallback);
    } else {
        this.filterTexture.setHash(this.hash);
    }

    this.fboFilter.setUniformsCallback(setFilterUniformsCallback)
    this.fboFilter.render();

    //this.heighmapOBJ.heightmapTexture.delete();
    this.heightmapOBJ.heightmapTexture = this.filterTexture;

    // Only generate preview when fast edit is disabled
    if (Editor.calculatingImages) {
        // To display heightmap texture in node
        this.img = this.fboFilter.toImage();
    }

    this.lastOBJ = Object.assign({}, this.heightmapOBJ);
    this.setOutputData(0, this.heightmapOBJ);
}

NoiseFilterNode.prototype.onDrawBackground = function(ctx)
{
    var height = this.inputs.length * 15 + 5
    ctx.fillStyle = "rgb(30,30,30)";
    ctx.fillRect(0, height, this.size[0] + 1, this.size[1] - height);

    if(this.img && !Editor.fastEditMode) {
        ctx.drawImage(this.img, (this.size[0] - 128) / 2.0, height, 128, this.size[1] - height);
    }
}

//register in the system
LiteGraph.registerNodeType("heightmap/noiseFilter", NoiseFilterNode);
