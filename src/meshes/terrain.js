function Terrain(size, scale) {

    this.shader;
    this.vertices = [];
    this.barycentricBuffer = [];
    this.indices = [];
    this.normals = [];
    this.size = size;
    this.scale = scale;

    this.vao;
    this.vbo;
    this.vboBarycentric;
    this.vboNormals;
    this.ebo;

    this.isReady = false;

    var self = this;

    this.createGrid = function() {
        var minX = Infinity;
        var minY = Infinity;
        var minZ = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        var maxZ = -Infinity;
        // -- Create the grid --
        // Store vertices
        for (var height = 0; height < self.size; height++) {
            for (var width = 0; width < self.size; width++) {

                var xCord = width / self.size;
                var yCord = height / self.size; // normalize
                var size = 2;  // pick a scaling value
                var n = TFG.PerlinNoise.noise(size * xCord, size * yCord, 2 );

                if (minX > width * self.scale)
                    minX = width * self.scale;

                if (maxX < width * self.scale)
                    maxX = width * self.scale;

                if (minY > n * 80)
                    minY = n * 80;

                if (maxY < n * 80)
                    maxY = n * 80;

                if (minZ > height * self.scale)
                    minZ = height * self.scale;

                if (maxZ < height * self.scale)
                    maxZ = height * self.scale;

                // Add vertex
                self.vertices.push(width * self.scale);    // x
                self.vertices.push(n * 80);                // y
                self.vertices.push(height * self.scale);   // z
            }
        }

        self.center = new vec3((minX + maxX) / 2.0, (minY + maxY) / 2.0, (minZ + maxZ) / 2.0);

        self.radious = Math.sqrt((maxX - self.center.x)*(maxX - self.center.x) +
                                (maxY - self.center.y)*(maxY - self.center.y) +
                                (maxZ - self.center.z)*(maxZ - self.center.z));

        Editor.camera.eye = new vec3(self.radious * 0.5,  self.radious * 1.5, self.radious * 2.0);

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

        var delta = self.barycentricBuffer.length - self.vertices.length;

        while (delta-- > 0) { self.barycentricBuffer.pop(); }

        // Calculate normals
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

                var vertexNumber = (xPos + yPos * self.size) * 3;

                hL = self.vertices[vertexNumber - 2]; // Read left vertex height
                hR = self.vertices[vertexNumber + 6 - 2]; // Read right vertex height
                hU = self.vertices[vertexNumber - 3 * self.size + 3 - 2]; // Read above vertex height
                hD = self.vertices[vertexNumber + 3 * self.size + 3 - 2]; // Read below vertex height

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

        // VertexBuffer to store barycentric positions (for wireframe rendering)
        self.vboBarycentric = new VertexBuffer(new Float32Array(self.barycentricBuffer), gl.STATIC_DRAW);

        // The attribute position in the shader
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

        // VertexBuffer to store normals
        self.vboNormals = new VertexBuffer(new Float32Array(self.normals), gl.STATIC_DRAW);

        // The attribute position in the shader
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

        // IndexBuffer to store vertex indices
        self.ebo = new IndexBuffer(new Uint16Array(self.indices), gl.STATIC_DRAW);

        self.vao.unbind();

        self.isReady = true;
    }

    this.shader = new Shader("basic", this.setupTerrain);

    this.render = function(camera) {
        if (this.isReady) {
            this.vao.bind();
            gl.useProgram(this.shader.programId);
            this.shader.setVec3("u_eye", camera.eye);
            this.shader.setMatrix4("u_mvp", camera.vp);
            this.shader.setMatrix4("u_view", camera.view);
            gl.drawElements(gl.TRIANGLE_STRIP, this.indices.length, gl.UNSIGNED_SHORT, 0);
            this.vao.unbind();
        }
    }
}
