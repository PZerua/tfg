#version 300 es

layout (location = 0) in vec3 aVertex;

flat out vec3 oVertex;

uniform mat4 u_mvp;

void main(void)
{
	oVertex = aVertex;

	gl_Position = u_mvp * vec4(20.0f * aVertex, 1.0);
}
