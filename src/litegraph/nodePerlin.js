//node constructor class
function NodePerlin() {

    this.addInput("Width", "number");
    this.addInput("Height", "number");
    this.addOutput("Heightmap", "array");
}

//name to show
NodePerlin.title = "Perlin Noise";
NodePerlin.position = [10, 50];
NodePerlin.size = [300, 50];

//function to call when the node is executed
NodePerlin.prototype.onExecute = function() {

    var width = this.getInputData(0);
    if (width === undefined)
        width = 128;
    var height = this.getInputData(1);
    if (height === undefined)
        height = 0;

    var heightmap = []

    // Precalculate heightmap (this will be moved to litegraph.js)
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var xCord = x / width;
            var yCord = y / height; // normalize

            var size = 2;  // pick a scaling value

            heightmap[x + y * width] = (PerlinNoise.noise(size * xCord, size * yCord, 2 ));
        }
    }

    this.setOutputData(0, heightmap);
}

//register in the system
LiteGraph.registerNodeType("heightmap/perlin", NodePerlin);
