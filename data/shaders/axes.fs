#version 300 es

precision highp float;

flat in vec3 oVertex;
out vec4 color;

void main (void)
{
    color = vec4(oVertex, 1.0);
}
