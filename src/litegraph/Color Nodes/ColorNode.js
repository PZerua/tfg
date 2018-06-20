//node constructor class
function ColorNode() {

    this.addInput("Red", "number");
    this.addInput("Green", "number");
    this.addInput("Blue", "number");
    this.addOutput("Color");

}

//name to show
ColorNode.title = "Color";
ColorNode.position = [10, 50];
ColorNode.size = [300, 50];

//function to call when the node is executed
ColorNode.prototype.onExecute = function() {

    var red = this.getInputData(0);
    if (red === undefined) {
        red = 0.5;
    }

    var green = this.getInputData(1);
    if (green === undefined) {
        green = 0.5;
    }

    var blue = this.getInputData(2);
    if (blue === undefined) {
        blue = 0.5;
    }

    var color = [red, green, blue];

    this.setOutputData(0, color);
}

//register in the system
LiteGraph.registerNodeType("heightmap/color", ColorNode);
