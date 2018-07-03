function Cubemap(name) {

    this.name = name;
    this.shader;
    this.vertices = [];
    this.texture = new CubemapTexture(512, 512, name);

    this.vao;
    this.vbo;

    this.isReady = false;

    var self = this;

    this.createCube = function() {

        var addVertex = function(vector, x, y, z) {
            vector.push(x);
            vector.push(y);
            vector.push(z);
        }

        // RIGHT
        addVertex(self.vertices,  1.0, -1.0, -1.0);
        addVertex(self.vertices,  1.0, -1.0,  1.0);
        addVertex(self.vertices,  1.0,  1.0,  1.0);
        addVertex(self.vertices,  1.0,  1.0,  1.0);
        addVertex(self.vertices,  1.0,  1.0, -1.0);
        addVertex(self.vertices,  1.0, -1.0, -1.0);
        // LEFT
        addVertex(self.vertices, -1.0, -1.0,  1.0);
        addVertex(self.vertices, -1.0, -1.0, -1.0);
        addVertex(self.vertices, -1.0,  1.0, -1.0);
        addVertex(self.vertices, -1.0,  1.0, -1.0);
        addVertex(self.vertices, -1.0,  1.0,  1.0);
        addVertex(self.vertices, -1.0, -1.0,  1.0);
        // TOP
        addVertex(self.vertices, -1.0,  1.0, -1.0);
        addVertex(self.vertices,  1.0,  1.0, -1.0);
        addVertex(self.vertices,  1.0,  1.0,  1.0);
        addVertex(self.vertices,  1.0,  1.0,  1.0);
        addVertex(self.vertices, -1.0,  1.0,  1.0);
        addVertex(self.vertices, -1.0,  1.0, -1.0);
        // BOTTOM
        addVertex(self.vertices, -1.0, -1.0, -1.0);
        addVertex(self.vertices, -1.0, -1.0,  1.0);
        addVertex(self.vertices,  1.0, -1.0, -1.0);
        addVertex(self.vertices,  1.0, -1.0, -1.0);
        addVertex(self.vertices, -1.0, -1.0,  1.0);
        addVertex(self.vertices,  1.0, -1.0,  1.0);
        // FRONT
        addVertex(self.vertices, -1.0,  1.0, -1.0);
        addVertex(self.vertices, -1.0, -1.0, -1.0);
        addVertex(self.vertices,  1.0, -1.0, -1.0);
        addVertex(self.vertices,  1.0, -1.0, -1.0);
        addVertex(self.vertices,  1.0,  1.0, -1.0);
        addVertex(self.vertices, -1.0,  1.0, -1.0);
        // BACK
        addVertex(self.vertices, -1.0, -1.0,  1.0);
        addVertex(self.vertices, -1.0,  1.0,  1.0);
        addVertex(self.vertices,  1.0,  1.0,  1.0);
        addVertex(self.vertices,  1.0,  1.0,  1.0);
        addVertex(self.vertices,  1.0, -1.0,  1.0);
        addVertex(self.vertices, -1.0, -1.0,  1.0);
    }

    this.setupCubemap = function() {

        self.createCube();

        // -- Setup buffers --
        self.vao = new VertexArray();

        // VertexBuffer to store vertex positions
        self.vbo = new VertexBuffer(new Float32Array(self.vertices), gl.STATIC_DRAW);

        // The attribute position in the shader
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        // IndexBuffer to store vertex indices
        //self.ebo = new IndexBuffer(new Uint16Array(self.indices), gl.STATIC_DRAW);

        self.vao.unbind();

        self.isReady = true;
    }

    this.shader = Shader.getShader("skybox");
    this.setupCubemap();

    this.render = function(camera) {
        if (this.isReady && this.texture.isReady) {
            this.vao.bind();
            this.shader.enable();

            this.shader.setMatrix4("u_view", camera.view.clearTranslation());
            this.shader.setMatrix4("u_projection", camera.projection);

            this.shader.setInt("u_skybox", 0)
            gl.activeTexture(gl.TEXTURE0);
            this.texture.bind();

            gl.drawArrays(gl.TRIANGLES, 0, 36);
            this.shader.disable();
            this.vao.unbind();
        }
    }
}
