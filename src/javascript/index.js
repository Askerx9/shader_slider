import * as PIXI from 'pixi.js'
import { TweenMax, TimelineMax } from 'gsap'
import vertex from "./shaders/vertex.glsl";
import fragment from "./shaders/fragment.glsl";
import displacementMap from "../images/04.png";
// import displacementMap from "../images/0.jpg";

const imgs = Array.from(document.querySelectorAll('.slider__img'));
const width = window.innerWidth
const height = window.innerHeight


document.addEventListener('DOMContentLoaded', () => {
  const app = new PIXI.Application({
    width: width,
    height: height,
    resizeTo: window,
    antialias: false,
    resolution: window.devicePixelRatio || 1,
    transparent: true,
    // autoResize: true
  });
  const container = new PIXI.Container();
  let lastIndex = 'img0';
  var isAnimating = false;

  // Init

  document.body.append(app.view)
  app.stage.addChild(container)

  // Load Image

  const loader = new PIXI.Loader();

  imgs.forEach((img, index) => {
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
    let uniforms = {
      u_time: 0,
      u_resolution: [width, height],
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

    app.renderer.resize(width, height);

    const imageRatio = text.width / text.height
    const canvasRatio = width / height

    console.log(canvasRatio > imageRatio)

    uniforms.aspectRatio =
    canvasRatio > imageRatio
    ? [1, imageRatio / canvasRatio]
    : [canvasRatio / imageRatio , 1]

    container.addChild(text)

    const sliderEl = Array.from(document.querySelectorAll('.slider__el'))

    sliderEl.forEach((el, index) => {

      el.addEventListener('click', function() {
        const img = el.getAttribute('data-index');
        if(!isAnimating && lastIndex != img){
          isAnimating = true;

          const tl = new TimelineMax({onComplete: function(){
            lastIndex = img;
            uniforms.u_text0 = resources[img].texture;
            uniforms.dispFactor = 0;
            isAnimating = false;
          }});

          uniforms.u_text0 = resources[lastIndex].texture;
          uniforms.u_text1 = resources[img].texture;

          tl.to(filter.uniformGroup.uniforms, 1.2, {
            dispFactor: 1,
            ease: Expo.easeOut
          })
        }
      })
    })

  })
})