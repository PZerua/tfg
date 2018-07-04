#version 300 es

precision highp float;

layout (location = 0) in vec3 aVertex;

uniform mat4 u_view;
uniform mat4 u_projection;

out vec3 oUvs;

void main(void)
{
    oUvs = aVertex;
    gl_Position = u_projection * u_view * vec4( aVertex, 1.0 );
}
