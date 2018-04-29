function Terrain(size, scale) {

    this.shader;
    this.vertices = [];
    this.uvs = [];
    this.barycentricBuffer = [];
    this.indices = [];
    this.normals = [];
    this.heightmap = [];
    this.heightmapWidth;
    this.heightmapHeight;
    this.heightmapTexture = undefined;
    this.size = size;
    this.scale = scale;

    this.vao;
    this.vbo;
    this.vboUvs;
    this.vboBarycentric;
    this.vboNormals;
    this.vboHeightmap;
    this.ebo;
    this.showWireframe = 0;

    this.isReady = false;

    var self = this;

    this.createGrid = function() {
        var minX = Infinity;
        var minY = Infinity;
        var minZ = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        var maxZ = -Infinity;

        // Get heightmap from output node TODO: This is probably not the best way to do it
        self.heightmap = Editor.outputNode.getOutputData(0);
        self.heightmapWidth = Editor.widthNode.getOutputData(0);
        self.heightmapHeight = Editor.heightNode.getOutputData(0);

        self.heightmapTexture = new Texture(self.heightmapWidth, self.heightmapHeight, this.heightmap);

        // -- Create the grid --
        // Store vertices
        for (var height = -self.size/2; height < self.size/2; height++) {
            for (var width = -self.size/2; width < self.size/2; width++) {
                // Add vertex
                self.vertices.push(width * self.scale);    // x
                self.vertices.push(0);                     // y
                self.vertices.push(height * self.scale);   // z

                self.uvs.push((width + self.size / 2) / self.size);
                self.uvs.push((height + self.size / 2) / self.size);
            }
        }

        // Face camera to mesh
        // TODO: Review this
        self.center = new vec3(self.size / 2.0, 0, self.size / 2.0);
        self.radious = Math.sqrt((self.center.x) * (self.center.x) + (self.center.z) * (self.center.z));

        Editor.camera.eye = new vec3(0, self.radious * 4.5, self.radious * 2.5);

        var dir = vec3.vec3Sub(new vec3(0,0,0), Editor.camera.eye).normalize();

        var pitch = Math.asin(dir.y);
        var yaw = Math.acos(dir.x/Math.cos(pitch));

        Editor.camera.setYawPitch(-Math.toDegrees(yaw), Math.toDegrees(pitch));

        // -- Barypoints --
        var currentBaryPoint = new vec3(1, 0, 0);
        var lastBaryPoint = new vec3(0, 0, 0);

        // Helper function
        function nextBaryPoint(baryPoint) {
            if (baryPoint.x)
                baryPoint.set(0, 1, 0);
            else if (baryPoint.y)
                baryPoint.set(0, 0, 1);
            else if (baryPoint.z)
                baryPoint.set(1, 0, 0);
        }

        // Store barycentric points used for wireframe
        for (var i = 0; i < self.size; i++) {
            for (var j = 0; j < self.size; j++) {
                lastBaryPoint = currentBaryPoint.clone();
                self.barycentricBuffer.push(currentBaryPoint.x);
                self.barycentricBuffer.push(currentBaryPoint.y);
                self.barycentricBuffer.push(currentBaryPoint.z);
                nextBaryPoint(currentBaryPoint);
            }
            if ((self.size + 1) % 3 == 1)
            {
                currentBaryPoint = lastBaryPoint;
            }
            else if ((self.size + 1) % 3 == 2)
            {
                nextBaryPoint(currentBaryPoint);
            }
        }

        // They should have the same length
        var delta = self.barycentricBuffer.length - self.vertices.length;
        while (delta-- > 0) { self.barycentricBuffer.pop(); }

        // -- Normals --
        for (var y = 0; y < self.size; y++) {
            for (var x = 0; x < self.size; x++) {

                var hL, hR, hD, hU;

                var xPos = x;
                var yPos = y;

                if (x == 0)
                    xPos = 1;
                if (y == 0)
                    yPos = 1;
                if (x == self.size - 1)
                    xPos = self.size - 2;
                if (y == self.size - 1)
                    yPos = self.size - 2;

                // Obtain correct index from heightmap when sizes mismatch (TODO: causes artifacts)
                var xIdx = Math.round(xPos * self.heightmapWidth / self.size)
                var yIdx = Math.round(yPos * self.heightmapHeight / self.size)

                var vertexNumber = (xIdx + yIdx * self.heightmapWidth);

                hL = self.heightmap[vertexNumber - 1] * 80;
                hR = self.heightmap[vertexNumber + 1] * 80;
                hU = self.heightmap[vertexNumber - self.heightmapWidth + 1] * 80;
                hD = self.heightmap[vertexNumber + self.heightmapWidth + 1] * 80;

                // deduce terrain normal
                var normal = new vec3(hL - hR, 2.0, hD - hU).normalize();

                self.normals.push(normal.x);
                self.normals.push(normal.y);
                self.normals.push(normal.z);
            }
        }

    	// Store indices
    	var row, col;
    	for (row = 0; row < self.size - 1; row++) {

            if (row != 0 && row != self.size -1)
                self.indices.push(row * self.size);
        	// Generate indices for Triangle Strip rendering
        	for (col = 0; col < self.size; col++) {
                self.indices.push(col + row * self.size);
                self.indices.push(col + (row + 1) * self.size);
        	}
        	// Generate degenerated triangles to change row
        	if (col == self.size && row < self.size - 1) {
                self.indices.push((col - 1) + (row + 1) * self.size);
        	}
    	}
    }

    this.setupTerrain = function() {

        self.createGrid();

        // -- Setup buffers --
        self.vao = new VertexArray();

        // VertexBuffer to store vertex positions
        self.vbo = new VertexBuffer(new Float32Array(self.vertices), gl.STATIC_DRAW);

        // The attribute position in the shader
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        // VertexBuffer to store uvs
        self.vboUvs = new VertexBuffer(new Float32Array(self.uvs), gl.STATIC_DRAW);

        // The attribute position in the shader
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

        // VertexBuffer to store barycentric positions (for wireframe rendering)
        self.vboBarycentric = new VertexBuffer(new Float32Array(self.barycentricBuffer), gl.STATIC_DRAW);

        // The attribute position in the shader
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

        // VertexBuffer to store normals
        self.vboNormals = new VertexBuffer(new Float32Array(self.normals), gl.STATIC_DRAW);

        // The attribute position in the shader
        gl.enableVertexAttribArray(3);
        gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 0, 0);

        // IndexBuffer to store vertex indices
        self.ebo = new IndexBuffer(new Uint16Array(self.indices), gl.STATIC_DRAW);

        self.vao.unbind();

        self.isReady = true;
    }

    this.shader = new Shader("terrain", this.setupTerrain);

    this.render = function(camera) {
        if (this.isReady) {
            this.vao.bind();
            gl.useProgram(this.shader.programId);
            this.shader.setVec3("u_eye", camera.eye);
            this.shader.setMatrix4("u_mvp", camera.vp);
            this.shader.setMatrix4("u_view", camera.view);
            this.shader.setInt("u_heightmap", 0);
            this.shader.setInt("u_showWireframe", this.showWireframe)
            gl.drawElements(gl.TRIANGLE_STRIP, this.indices.length, gl.UNSIGNED_SHORT, 0);
            this.vao.unbind();
        }
    }
}
