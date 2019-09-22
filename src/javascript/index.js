import * as PIXI from 'pixi.js'
import { TweenMax } from 'gsap'
import vertex from "./shaders/vertex.glsl";
import fragment from "./shaders/fragment.glsl";

import displacementMap from "../images/04.png";
const imgs = Array.from(document.querySelectorAll('.slider__img'));


PIXI.useDeprecated();

document.addEventListener('DOMContentLoaded', () => {
  const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    resizeTo: window,
    antialias: false,
    resolution: window.devicePixelRatio || 1,
    transparent: true,
    autoResize: true
  });
  const container = new PIXI.Container();
  let lastIndex = 0;

  // Init

  document.body.append(app.view)
  app.stage.addChild(container)

  // Load Image

  const loader = new PIXI.Loader();

  imgs.forEach((img, index) => {
    console.log(img)
    loader.add(
      `img${index}`,
      img.src
    )
  })

  loader.add(
    'disp',
    displacementMap
  )

  loader.load((loader, resources) => {
    const { img0, img1, img2, disp } = resources
    const images = Object.values(resources)
    const uniforms = {
      u_time: 0,
      u_resolution: [window.innerWidth, window.innerHeight],
      u_mouse: [0 , 0],
      u_text0: img0.texture,
      u_text1: img1.texture,
      disp: disp.texture,
      effectFactor: .1,
      dispFactor: 0,
      u_progress: 0
    }
    const filter = new PIXI.Filter(null, fragment, uniforms)
    const text = new PIXI.Sprite(img0.texture)
    text.filters = [filter]

    // Resize
    const imageRatio = text.width / text.width
    const canvasRatio = window.innerWidth / window.innerHeight

    uniforms.aspectRatio =
    [1,imageRatio / canvasRatio]
    // canvasRatio > imageRatio
    // ? [1, imageRatio / canvasRatio]
    // : [imageRatio / canvasRatio, 1]

    app.stage.scale.set(1)

    container.addChild(text)

    document.body.addEventListener('mouseenter', function() {
      TweenMax.to(filter.uniformGroup.uniforms, 1.2, {
        dispFactor: 1,
        ease: Expo.easeOut
      });
    });
    document.body.addEventListener('mouseleave', function() {
      TweenMax.to(filter.uniformGroup.uniforms, 0.5, {
        dispFactor: 0,
        ease: Expo.easeOut
      });
    });
  })
})