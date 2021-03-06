class Texture {

    constructor(width, height, internalFormat, format, type, data, hash) {

        this.width = width;
        this.height = height;
        this.internalFormat = internalFormat;
        this.format = format;
        this.type = type;
        this.hash = hash ? hash : "";

        this.textureId = gl.createTexture();
        this.bind();
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type,  data ? data : null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        this.unbind();
    }

    updateTexture(data, hash) {
        this.hash = hash ? hash : "";
        gl.bindTexture(gl.TEXTURE_2D, this.textureId);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.width, this.height, this.format, this.type, data);
    }

    setHash(hash) {
        this.hash = hash ? hash : "";
    }

    delete() {
        gl.deleteTexture(this.textureId);
    }

    bind() {
        gl.bindTexture(gl.TEXTURE_2D, this.textureId);
    }

    unbind() {
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}
