//node constructor class
function NodePerlin() {

    this.addInput("Size", "number");
    this.addInput("Octaves", "number");
    this.addOutput("Heightmap", "array");
}

//name to show
NodePerlin.title = "Perlin Noise";
NodePerlin.position = [10, 50];
NodePerlin.size = [300, 50];

//function to call when the node is executed
NodePerlin.prototype.onExecute = function() {

    var size = this.getInputData(0);
    if (size === undefined)
        size = 128;

    var octaves = this.getInputData(1);
    if (octaves === undefined)
        octaves = 3;

    var heightmap = []

    // Precalculate heightmap (this will be moved to litegraph.js)
    for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
            var xCord = x / size;
            var yCord = y / size; // normalize

            var frequency = 1;
            var amplitude = 1;

            heightmap[x + y * size] = 0;

            for (var i = 0; i < octaves; i++) {
                heightmap[x + y * size] += (PerlinNoise.noise(xCord * frequency, yCord * frequency, 2 * frequency)) * amplitude;
                frequency *= 2;
                amplitude *= 0.5;
            }

        }
    }

    this.setOutputData(0, heightmap);
}

//register in the system
LiteGraph.registerNodeType("heightmap/perlin", NodePerlin);
