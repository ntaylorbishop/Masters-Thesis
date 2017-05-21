#version 430

#define FALSE	0
#define TRUE	1

uniform vec4 gDiffuseColor;

in vec2 passUV0;
in vec3 passPosition;
in vec4 passColor;
in vec3 passNormal;
in vec3 passTangent;
in vec3 passBitangent;

layout (location = 0) out vec4	outColor;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//MAIN
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//---------------------------------------------------------------------------------------------------------------------------
void main() {
	
	outColor = gDiffuseColor;
}