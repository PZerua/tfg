//node constructor class
function CustomHeightmapNode() {

    this.addInput("Image", "image");
    this.addInput("Size", "number");
    this.addInput("Height Scale", "number");
    this.addOutput("Heightmap");

    // The object to be exported
    this.heightmapOBJ = {
        heightmapTexture: undefined,
        normalsTexture: undefined,
        colorTexture: undefined,
        size: 0,
        heightScale: 0
    }

    this.size[1] += 128.0;
}

//name to show
CustomHeightmapNode.title = "Custom Heightmap";
CustomHeightmapNode.position = [10, 50];
CustomHeightmapNode.size = [300, 50];

//function to call when the node is executed
CustomHeightmapNode.prototype.onExecute = function() {

    var image = this.getInputData(0);
    if (image === undefined) {
        return;
    }

    // Receive size
    this.heightmapOBJ.size = this.getInputData(1);
    if (this.heightmapOBJ.size === undefined) {
        this.heightmapOBJ.size = image.width;
    } else {
        image.width = this.heightmapOBJ.size;
        image.height = this.heightmapOBJ.size;
        // Resize
    }

    // Receive mesh height scale
    this.heightmapOBJ.heightScale = this.getInputData(2);
    if (this.heightmapOBJ.heightScale === undefined)
        this.heightmapOBJ.heightScale = 200;

    var hash = Math.createHash([this.heightmapOBJ.size, this.heightmapOBJ.heightScale, Editor.fastEditMode ? 1 : 0]);
    hash += image.src;

    if (this.hash && this.hash == hash) {
        this.setOutputData(0, this.heightmapOBJ);
        return;
    } else {
        this.hash = hash;
    }

    if (!this.heightmapOBJ.heightmapTexture) {
        // --- Create heightmap and save it in the provided texture ---
        // Create texture to be filled by the framebuffer
        this.heightmapOBJ.heightmapTexture = new Texture(this.heightmapOBJ.size, this.heightmapOBJ.size, gl.RGBA32F, gl.RGBA, gl.FLOAT, image, this.hash);
        // Create framebuffer providing the texture and a custom shader
        this.fboHeightmap = new FrameBuffer(this.heightmapOBJ.size, this.heightmapOBJ.size, this.heightmapOBJ.heightmapTexture);
    } else {
        this.heightmapOBJ.heightmapTexture.setHash(this.hash);
    }

    // Only generate preview when fast edit is disabled
    if (!Editor.fastEditMode) {
        // To display heightmap texture in node
        this.img = this.fboHeightmap.toImage();
    }

    this.setOutputData(0, this.heighmapOBJ);
}

CustomHeightmapNode.prototype.onDrawBackground = function(ctx)
{
    var height = this.inputs.length * 15 + 5
    ctx.fillStyle = "rgb(30,30,30)";
    ctx.fillRect(0, height, this.size[0] + 1, this.size[1] - height);

    if(this.img && !Editor.fastEditMode) {
        ctx.drawImage(this.img, (this.size[0] - 128) / 2.0, height, 128, this.size[1] - height);
    }
}

//register in the system
LiteGraph.registerNodeType("heightmap/customHeightmap", CustomHeightmapNode);
