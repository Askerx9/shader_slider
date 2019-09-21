precision mediump float;

varying vec2 vUvs;

uniform sampler2D currentImage;
uniform sampler2D nextImage;
uniform sampler2D disp;

uniform float dispFactor;
uniform float effectFactor;

void main() {
    vec2 aUvs = vUvs;

    vec4 disp = texture2D(disp, aUvs);

    vec2 distortedPosition = vec2(aUvs.x + dispFactor * (disp.r*effectFactor), aUvs.y);
    vec2 distortedPosition2 = vec2(aUvs.x - (1.0 - dispFactor) * (disp.r*effectFactor), aUvs.y);

    vec4 _currentImage = texture2D(currentImage, distortedPosition);
    vec4 _nextImage = texture2D(nextImage, distortedPosition2);

    vec4 finalTexture = mix(_currentImage, _nextImage, dispFactor);

    gl_FragColor = finalTexture;
}