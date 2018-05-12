//node constructor class
function NodePerlin() {

    this.addInput("Size", "number");
    this.addInput("Octaves", "number");
    this.addInput("Height Scale", "number");
    this.addOutput("Heightmap", "array");

    this.heighmapOBJ = {
        heightmap: [],
        size: 0,
        heightScale: 0
    }
}

//name to show
NodePerlin.title = "Perlin Noise";
NodePerlin.position = [10, 50];
NodePerlin.size = [300, 50];

//function to call when the node is executed
NodePerlin.prototype.onExecute = function() {

    this.heighmapOBJ.size = this.getInputData(0);
    if (this.heighmapOBJ.size === undefined)
        this.heighmapOBJ.size = 128;

    var octaves = this.getInputData(1);
    if (octaves === undefined)
        octaves = 4;

    this.heighmapOBJ.heightScale = this.getInputData(2);
    if (this.heighmapOBJ.heightScale === undefined)
        this.heighmapOBJ.heightScale = 40;

    this.heighmapOBJ.heightmap = []

    var size = this.heighmapOBJ.size;

    for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
            var xCord = x / size;
            var yCord = y / size; // normalize

            var frequency = 1;
            var amplitude = 1;

            this.heighmapOBJ.heightmap[x + y * size] = 0;

            for (var i = 0; i < octaves; i++) {
                this.heighmapOBJ.heightmap[x + y * size] += (PerlinNoise.noise(xCord * frequency, yCord * frequency, 2 * frequency)) * amplitude;
                frequency *= 2;
                amplitude *= 0.5;
            }

        }
    }

    this.setOutputData(0, this.heighmapOBJ);
}

//register in the system
LiteGraph.registerNodeType("heightmap/perlin", NodePerlin);
