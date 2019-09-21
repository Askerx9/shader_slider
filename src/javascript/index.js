import * as PIXI from 'pixi.js'
import { TweenMax } from 'gsap'
import vertex from "./shaders/vertex.glsl";
import fragment from "./shaders/fragment.glsl";

import displacementMap from "../images/LkpXNHm.jpg";
const imgs = Array.from(document.querySelectorAll('.slider__img'));

PIXI.useDeprecated();

const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    resizeTo: window,
    antialias: false,
    resolution: window.devicePixelRatio || 1,
    transparent: true,
    autoResize: true
});
app.renderer.autoDensity = true;

document.body.appendChild(app.view);

const geometry = new PIXI.Geometry()
    .addAttribute('aVertexPosition',
      [
      -350, 350,
      0, 350,
      350, 0,
      -350, -350,
      0, 350,
      -350, 0
      ], 3)
    .addAttribute('aUvs',
        [
    0, 1,
    1, 1,
    0, 0,
    1, 0
        ], 2)
    .addIndex([0, 2, 1, 2, 3, 1])
let uniforms = {
  effectFactor: 0.6,
  currentImage : PIXI.Texture.from(imgs[1].src),
  nextImage : PIXI.Texture.from(imgs[2].src),
  displacement: PIXI.Texture.from(displacementMap),
  dispFactor : 0.0,
}
const shader = PIXI.Shader.from(vertex, fragment, uniforms);
const quad = new PIXI.Mesh(geometry, shader);

quad.position.set(window.innerWidth / 2, window.innerHeight / 2);

app.stage.addChild(quad);

requestAnimationFrame(animate);

function animate(){
  requestAnimationFrame(animate);
  app.render(app.stage);
}

document.body.addEventListener('mouseenter', function() {
	TweenMax.to(shader.uniformGroup.uniforms, 1, {
		dispFactor: 1,
		ease: Expo.easeOut
	});
});
document.body.addEventListener('mouseleave', function() {
	TweenMax.to(shader.uniformGroup.uniforms, 0.5, {
		dispFactor: 0,
		ease: Expo.easeOut
	});
});