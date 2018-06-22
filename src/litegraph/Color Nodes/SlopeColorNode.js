//node constructor class
function SlopeColorNode() {

    this.addInput("Heightmap");
    this.addInput("Color0","color");
    this.addInput("Color1","color");
    this.addInput("Color2","color");
    this.addInput("Color3","color");
    this.addOutput("Heightmap");

    this.size[1] += 128.0;
}

//name to show
SlopeColorNode.title = "Slope Color";

//function to call when the node is executed
SlopeColorNode.prototype.onExecute = function() {

    // Receive heightmap Obj and copy its contents (I don't want to modify it being a reference, bad things can happen)
    var heightmapOBJ = this.getInputData(0);
    if (heightmapOBJ === undefined) {
        return
    } else {
        this.heighmapOBJ = Object.assign({}, heightmapOBJ);
    }

    var color0 = this.getInputData(1);
    if (color0 === undefined)
        color0 = [1.0, 1.0, 1.0];

    var color1 = this.getInputData(2);
    if (color1 === undefined)
        color1 = [1.0, 1.0, 1.0];

    var color2 = this.getInputData(3);
    if (color2 === undefined)
        color2 = [1.0, 1.0, 1.0];

    var color3 = this.getInputData(4);
    if (color3 === undefined)
        color3 = [1.0, 1.0, 1.0];

    var self = this;
    var setFilterUniformsCallback = function() {
        self.fboColor.shader.setInt("u_heightmapTexture", 0);
        gl.activeTexture(gl.TEXTURE0);
        self.heighmapOBJ.heightmapTexture.bind();

        self.fboColor.shader.setFloat("u_size", self.heighmapOBJ.size);
        self.fboColor.shader.setFloat("u_heightScale", self.heighmapOBJ.heightScale);
        self.fboColor.shader.setFloat3("u_color0", color0);
        self.fboColor.shader.setFloat3("u_color1", color1);
        self.fboColor.shader.setFloat3("u_color2", color2);
        self.fboColor.shader.setFloat3("u_color3", color3);

    }

    // --- Create normal map and save it in the provided texture ---
    // Create texture to be filled by the framebuffer
    this.heighmapOBJ.colorTexture = new Texture(this.heighmapOBJ.size, this.heighmapOBJ.size, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // Create framebuffer providing the texture and a custom shader
    this.fboColor = new FrameBuffer(this.heighmapOBJ.size, this.heighmapOBJ.size, this.heighmapOBJ.colorTexture, "slopeColor", setFilterUniformsCallback);

    this.fboColor.render();

    // To display heightmap texture in node
    this.img = this.fboColor.toImage();

    this.setOutputData(0, this.heighmapOBJ);
}

SlopeColorNode.prototype.onDrawBackground = function(ctx)
{
    if(this.img) {
        ctx.drawImage(this.img, 0, this.inputs.length * 16.0, this.size[0], this.size[1] - this.inputs.length * 16.0);
    }
}

//register in the system
LiteGraph.registerNodeType("heightmap/slopeColor", SlopeColorNode);
