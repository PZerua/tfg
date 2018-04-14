#version 300 es

layout (location = 0) in vec3 aVertex;
layout (location = 1) in vec3 aBarycentric;
layout (location = 2) in vec3 aNormal;

out vec3 oBarycentric;
out vec3 normal;
out vec3 eye_relative_position;
out vec3 oVertex;

uniform vec3 u_eye;
uniform mat4 u_mvp;
uniform mat4 u_view;

void main(void)
{
	normal = aNormal;
	oVertex = aVertex;

	oBarycentric = aBarycentric;
	gl_Position = u_mvp * vec4( aVertex, 1.0 );
}
