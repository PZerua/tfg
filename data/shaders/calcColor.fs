#version 300 es

precision highp float;

layout(location = 0) out vec4 fragColor;

in vec2 oUvs;

uniform sampler2D u_heightmapTexture;
uniform float u_size;
uniform float u_heightScale;

float map(float value, float inMin, float inMax, float outMin, float outMax) {
    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

void main (void)
{
	vec3 seaColor = vec3(0.227, 0.525, 0.756);
	vec3 shoreColor = vec3(0.925, 0.839, 0.603);
	vec3 fieldColor = vec3(0.403, 0.615, 0.392);
	vec3 snowColor = vec3(0.909, 0.964, 0.956);

	float f = texture(u_heightmapTexture, oUvs).r;

	vec3 color;

    if (f < 0.20) {
        color = mix(vec3(0.0, 0.0, 0.0), seaColor, map(f, 0.0, 0.20, 0.0, 1.0));
    }
    else if (f >= 0.20 && f < 0.21) {
        color = mix(seaColor, shoreColor, map(f, 0.20, 0.21, 0.0, 1.0));
    }
	else if (f >= 0.21 && f < 0.30) {
		color = mix(shoreColor, fieldColor, map(f, 0.21, 0.30, 0.0, 1.0));
	}
    else if (f >= 0.30  && f <= 0.5) {
        color = fieldColor;
    }
	else if (f >= 0.50 && f <= 0.7) {
		color = mix(fieldColor, snowColor, map(f, 0.50, 0.7, 0.0, 1.0));
	}
    else if (f >= 0.70) {
        color = snowColor;
    }

	fragColor = vec4(color, 1.0);
}
