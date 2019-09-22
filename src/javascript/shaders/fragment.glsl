precision mediump float;

varying vec2 vTextureCoord;

uniform float u_progress;

uniform vec2 u_resolution;
uniform vec2 aspectRatio;

uniform sampler2D u_text0;
uniform sampler2D u_text1;
uniform sampler2D disp;

uniform float dispFactor;
uniform float effectFactor;

vec2 rotate(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, -s, s, c);
    return m * v;
}

vec2 centeredAspectRatio(vec2 uv, vec2 factor){
    return ( uv - .5 ) * factor + .5;
}

void main(void){
    vec2 map = vTextureCoord;
    vec2 uv = centeredAspectRatio(vTextureCoord, aspectRatio);

    vec2 fuv = fract(uv * vec2(20., 20.));


    vec4 disp = texture2D(disp, fuv);

    vec2 uvDisplaced = vec2(uv.x + dispFactor * (disp.r*effectFactor), uv.y);
    vec2 uvDisplaced1 = vec2(uv.x - (1.0 - dispFactor) * (disp.r*effectFactor), uv.y);

    vec4 img0 = texture2D(u_text0, uvDisplaced);
    vec4 img1 = texture2D(u_text1, uvDisplaced1);

    gl_FragColor = mix(img0, img1, dispFactor);
}