#version 300 es

precision highp float;

in vec2 oUvs;

layout(location = 0) out vec4 fragColor;

uniform int u_octaves;
uniform float u_amplitude;
uniform float u_frequency;

vec2 hash(vec2 x)
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}

float noise( in vec2 p )
{
    // Position in grid
    vec2 i = floor( p );
    // Offset in position
    vec2 f = fract( p );

    // Quintic interpolation
	vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    //vec2 u = f*f*(3.0-2.0*f);

    // Interpolate in x axis
    float a = mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)), dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x);
    float b = mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x);

    // Interpolate in y axis
    return mix(a, b, u.y);
}

void main (void)
{
    vec2 uv = oUvs;

    float f = 0.0;

    float amplitude = u_amplitude;

    uv *= u_frequency;
    mat2 m = mat2( 1.6,  1.2,
                  -1.2,  1.6 );

    for (int i = 0; i < u_octaves; i++) {
        f  += amplitude * noise( uv ); uv = m*uv;
        amplitude /= 2.0;
    }

    f = 0.5 + 0.5*f;

    fragColor = vec4(f, f, f, 1.0);

    //fragColor = vec4(f);
}
