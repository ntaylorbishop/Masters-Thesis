#version 430 core

//Implementation based on:
//http://stackoverflow.com/questions/12105330/how-does-this-simple-fxaa-work


layout (binding = 0) uniform sampler2D	gTexDiffuse;
uniform vec2		gFrameBufSize;
uniform bool		gUsingFXAA;


in vec2 passUV0;

out vec4 outColor;

void main( void ) {

	if(gUsingFXAA == false) {
		outColor = vec4(texture2D(gTexDiffuse, passUV0).xyz, 1.f);
		return;
	}

	float FXAA_SPAN_MAX		= 8.f;
	float FXAA_REDUCE_MUL	= 1.f / 8.f;
	float FXAA_REDUCE_MIN	= 1.f / 128.f;

	vec3 rgbNW	= texture2D(gTexDiffuse, passUV0 + (vec2(-1.f,-1.f) / gFrameBufSize)).xyz;
	vec3 rgbNE	= texture2D(gTexDiffuse, passUV0 + (vec2( 1.f,-1.f) / gFrameBufSize)).xyz;
	vec3 rgbSW	= texture2D(gTexDiffuse, passUV0 + (vec2(-1.f, 1.f) / gFrameBufSize)).xyz;
	vec3 rgbSE	= texture2D(gTexDiffuse, passUV0 + (vec2( 1.f, 1.f) / gFrameBufSize)).xyz;
	vec3 rgbM	= texture2D(gTexDiffuse, passUV0).xyz;

	vec3 luma		= vec3(0.299, 0.587, 0.114);
	float lumaNW	= dot(rgbNW, luma);
	float lumaNE	= dot(rgbNE, luma);
	float lumaSW	= dot(rgbSW, luma);
	float lumaSE	= dot(rgbSE, luma);
	float lumaM		= dot(rgbM,  luma);

	float lumaMin	= min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
	float lumaMax	= max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

	vec2 dir;
	dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
	dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));

	float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);

	float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);

	dir = min(vec2( FXAA_SPAN_MAX, FXAA_SPAN_MAX), max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX), dir * rcpDirMin)) / gFrameBufSize;

	vec3 rgbA = (1.0/2.0) * (
		texture2D(gTexDiffuse, passUV0.xy + dir * (1.0/3.0 - 0.5)).xyz +
		texture2D(gTexDiffuse, passUV0.xy + dir * (2.0/3.0 - 0.5)).xyz);
	vec3 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (
		texture2D(gTexDiffuse, passUV0.xy + dir * (0.0/3.0 - 0.5)).xyz +
		texture2D(gTexDiffuse, passUV0.xy + dir * (3.0/3.0 - 0.5)).xyz);

	float lumaB = dot(rgbB, luma);

	if((lumaB < lumaMin) || (lumaB > lumaMax)) {
		outColor = vec4(rgbA, 1.f);
	} 
	else {
		outColor = vec4(rgbB, 1.f);
	}
}