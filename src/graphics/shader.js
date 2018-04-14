function Shader(shaderName, shaderCallback) {

    this.programId;
    this.isLoaded = false;

    var self = this;

    function compileShaders(shaderTexts)
    {
        var vertex = gl.createShader(gl.VERTEX_SHADER);
        var fragment = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(vertex, shaderTexts[0]);
        gl.compileShader(vertex);

        gl.shaderSource(fragment, shaderTexts[1]);
        gl.compileShader(fragment);

        // Print compile errors if any
        if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS))
        {
            var log = gl.getShaderInfoLog(vertex);
            console.error("Error in vertex shader compilation\n" + log);
        }

        if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS))
        {
            var log = gl.getShaderInfoLog(fragment);
            console.error("Error in fragment shader compilation\n" + log);
        }

        // Shader Program
        self.programId = gl.createProgram();
        gl.attachShader(self.programId, vertex);
        gl.attachShader(self.programId, fragment);
        gl.linkProgram(self.programId);

        // Print errors if any
        if (!gl.getProgramParameter(self.programId, gl.LINK_STATUS))
        {
            var log = gl.getProgramInfoLog(self.programId);
            console.error("Error in program compilation\n" + log);
            return;
        }
        else self.isLoaded = true;

        // Delete unnecessary shaders (we have program)
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);

        shaderCallback();
    }

    function loadShaders(callback) {

        var numCompleted = 0;
        var result = [];

        function loadedCallback(text, index) {
            result[index] = text;
            numCompleted++;

            if (numCompleted == 2)
                callback(result);
        }

        loadFile("data/shaders/" + shaderName + ".vs", loadedCallback, 0);
        loadFile("data/shaders/" + shaderName + ".fs", loadedCallback, 1);
    }

    loadShaders(compileShaders);

    this.setMatrix4 = function(name, matrix) {
        gl.uniformMatrix4fv(gl.getUniformLocation(this.programId, name), false, matrix.m);
    }

    this.setVec3 = function(name, vector) {
        gl.uniform3f(gl.getUniformLocation(this.programId, name), vector.x, vector.y, vector.z);
    }
}
