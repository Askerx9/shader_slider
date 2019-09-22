const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.append(stats.dom);
stats.dom.id = "gui-fps";

const tl = new TimelineLite();

const shaders = {
  fs: `
    precision mediump float;

    #define PI 3.14159265359
    #define PI2 6.28318530718
    #define S(a,b,n) smoothstep(a,b,n)

    varying vec2 vTextureCoord;

    uniform float u_time;
    uniform float u_progress;

    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform vec2 aspectRatio;

    uniform sampler2D u_text0;
    uniform sampler2D u_text1;

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

       float fprogress = fract(u_progress);

       float a = atan(uv.x, uv.y);

       vec2 uvDisplaced = uv + rotate(fuv, a) * fuv * fprogress * .1;
       vec2 uvDisplaced1 = uv + rotate(fuv, a) * fuv * (1. - fprogress) * .1;

       vec4 img0 = texture2D(u_text0, uvDisplaced);
       vec4 img1 = texture2D(u_text1, uvDisplaced1);

       gl_FragColor = mix(img0, img1, fprogress);
    }
  `
};

class PIXIApp {
  constructor() {
    this.app = new PIXI.Application({ width: innerWidth, height: innerHeight });
    this.container = new PIXI.Container();

    this.mouse = {
      x: 0,
      y: 0
    };

    this.lastIndex = 0;

    this.onResize = this.onResize.bind(this);
    this.mouseMove = this.mouseMove.bind(this);

    this.init();
  }

  init() {
    const content = document.querySelector("#content-canvas");

    content.append(this.app.view);
    this.app.stage.addChild(this.container);
    this.loadImages();

    window.addEventListener("resize", this.onResize);
    content.addEventListener("mousemove", e => this.mouseMove(e));
  }

  loadImages() {
    const loader = new PIXI.Loader();
    loader.add(
      "img0",
      "https://i.ibb.co/bQyQMK5/jason-cooper-482297-unsplash.jpg"
    );
    loader.add(
      "img1",
      "https://i.ibb.co/QcbZGMj/nikolay-vorobyev-470715-unsplash.jpg"
    );
    loader.add(
      "img2",
      "https://i.ibb.co/R3QJ609/tom-morel-1279604-unsplash.jpg"
    );

    loader.load((loader, resources) => {
      const { img0, img1, img2 } = resources;
      this.images = Object.values(resources);

      this.uniforms = {
        u_time: 0,
        u_resolution: [innerWidth, innerHeight],
        u_mouse: [this.mouse.x, this.mouse.y],
        u_text0: img0.texture,
        u_text1: img1.texture,
        u_progress: 0
      };

      const { vs, fs } = shaders;
      const filter = new PIXI.Filter(null, fs, this.uniforms);

      this.text = new PIXI.Sprite(img0.texture);

      this.text.filters = [filter];

      this.onResize();
      this.render(this.text);
      this.update();
    });
  }

  mouseMove(e) {
    this.mouse = this.app.renderer.plugins.interaction.mouse.global;

    this.uniforms.u_mouse = [this.mouse.x, innerHeight - this.mouse.y];

    const to = Math.floor(this.mouse.x / (innerWidth / this.images.length));

    TweenLite.to(this.uniforms, .5, {
      u_progress: to,
      ease: Sine.easeOut,
      onUpdate: () => {
        const i = Math.floor(this.uniforms.u_progress);
        this.uniforms.u_text0 = this.images[i].texture;
        if (i < this.images.length - 1) {
          this.uniforms.u_text1 = this.images[i + 1].texture;
        }
      }
    });


  }

  onResize() {
    this.app.renderer.resize(innerWidth, innerHeight);

    const imageRatio = this.text.width / this.text.height;
    const canvasRatio = innerWidth / innerHeight;

    this.uniforms.aspectRatio =
      canvasRatio > imageRatio
        ? [1, imageRatio / canvasRatio]
        : [canvasRatio / imageRatio, 1];

    this.app.stage.scale.set(1);
  }

  update() {
    this.app.ticker.add(e => {
      stats.begin();
      this.uniforms.u_time += 0.05;
      stats.end();
    });
  }

  render(text) {
    this.container.addChild(text);
  }
}

new PIXIApp();
