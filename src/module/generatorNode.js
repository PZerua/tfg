//node constructor class
function MyAddNode() {

    this.addInput("A", "number");
    this.addInput("B", "number");
    this.addOutput("A+B", "number");
}

//name to show
MyAddNode.title = "Sum";
MyAddNode.position = [10, 50];
MyAddNode.size = [300, 50];

//function to call when the node is executed
MyAddNode.prototype.onExecute = function() {
    var A = this.getInputData(0);
    if (A === undefined)
        A = 0;
    var B = this.getInputData(1);
    if (B === undefined)
        B = 0;
    this.setOutputData(0, A + B);
}

//register in the system
LiteGraph.registerNodeType("basic/sum", MyAddNode);
