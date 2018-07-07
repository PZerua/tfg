//node constructor class
function OutputNode() {

    this.addInput("Heightmap");
}

//name to show
OutputNode.title = "Output";
OutputNode.position = [10, 50];
OutputNode.size = [300, 50];

//function to call when the node is executed
OutputNode.prototype.onExecute = function() {

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

    var hash = Math.createHash(inputsValues);

    if (this.hash && this.hash == hash) {
        this.setOutputData(0, this.heighmapOBJ);
        return;
    } else {
        this.hash = hash;
    }

    // Receive heightmap Obj and copy its contents (I don't want to modify it being a reference, bad things can happen)
    var heightmapOBJ = this.getInputData(0);
    if (heightmapOBJ === undefined) {
        return
    } else {
        this.heighmapOBJ = Object.assign({}, this.getInputData(0));
    }
    var self = this;

    var setNormalsUniformsCallback = function() {
        self.fboNormals.shader.setInt("u_heightmapTexture", 0);
        gl.activeTexture(gl.TEXTURE0);
        self.heighmapOBJ.heightmapTexture.bind();

        self.fboNormals.shader.setFloat("u_size", self.heighmapOBJ.size);
        self.fboNormals.shader.setFloat("u_heightScale", self.heighmapOBJ.heightScale);
    }

    var setColorUniformsCallback = function() {
        self.fboColor.shader.setInt("u_heightmapTexture", 0);
        gl.activeTexture(gl.TEXTURE0);
        self.heighmapOBJ.heightmapTexture.bind();

        self.fboColor.shader.setFloat("u_size", self.heighmapOBJ.size);
        self.fboColor.shader.setFloat("u_heightScale", self.heighmapOBJ.heightScale);
    }

    // --- Create normal map and save it in the provided texture ---
    // Create texture to be filled by the framebuffer
    this.heighmapOBJ.normalsTexture = new Texture(this.heighmapOBJ.size, this.heighmapOBJ.size, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, null, this.hash);
    // Create framebuffer providing the texture and a custom shader
    this.fboNormals = new FrameBuffer(this.heighmapOBJ.size, this.heighmapOBJ.size, this.heighmapOBJ.normalsTexture, "calcNormals", setNormalsUniformsCallback);

    this.fboNormals.render();

    // Only calculate default color if no color is defined
    if (this.heighmapOBJ.colorTexture === undefined) {
        // Create texture to be filled by the framebuffer
        this.heighmapOBJ.colorTexture = new Texture(this.heighmapOBJ.size, this.heighmapOBJ.size, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, null, this.hash);
        // Create framebuffer providing the texture and a custom shader
        this.fboColor = new FrameBuffer(this.heighmapOBJ.size, this.heighmapOBJ.size, this.heighmapOBJ.colorTexture, "calcColor", setColorUniformsCallback);

        this.fboColor.render();
    }
    else {
        this.fboColor = new FrameBuffer(this.heighmapOBJ.size, this.heighmapOBJ.size, this.heighmapOBJ.colorTexture);
    }

    // Create framebuffer providing the texture and a custom shader
    this.fboHeightmap = new FrameBuffer(this.heighmapOBJ.size, this.heighmapOBJ.size, this.heighmapOBJ.heightmapTexture);

    if (!Editor.fastEditMode) {
        // Display heightmap texture in editor
        var img = this.fboHeightmap.toImage();
        var htmlImg = document.getElementById("heightmapTex");
        htmlImg.src = img.src;

        // Display normal texture in editor
        img = this.fboNormals.toImage();
        htmlImg = document.getElementById("normalsTex");
        htmlImg.src = img.src;

        // Display color texture in editor
        img = this.fboColor.toImage();
        htmlImg = document.getElementById("colorTex");
        htmlImg.src = img.src;
    }
}

//register in the system
LiteGraph.registerNodeType("heightmap/heightmapOutput", OutputNode);
