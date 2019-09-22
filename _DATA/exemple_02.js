PIXI.utils.skipHello();

  const wrapper = document.createElement('div');
	wrapper.style.width = '700px';
	wrapper.style.height = '700px';
	document.body.appendChild(wrapper);

	const intensity = 0.6;

	const app = new PIXI.Application({
		width: wrapper.offsetWidth,
		height: wrapper.offsetHeight,
		antialias: false,
		resolution: window.devicePixelRatio || 1,
		autoResize: true,
		transparent: true
	});

	wrapper.appendChild(app.view);

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

	const vertexSrc = `
		precision mediump float;

		attribute vec2 aVertexPosition;
		attribute vec2 aUvs;

		uniform mat3 translationMatrix;
		uniform mat3 projectionMatrix;

		varying vec2 vUvs;

		void main() {
			vUvs = aUvs;
			gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
		}
	`;
	const fragmentSrc = `
			precision mediump float;

			varying vec2 vUvs;

			uniform sampler2D texture;
			uniform sampler2D texture2;
			uniform sampler2D disp;

			uniform float dispFactor;
			uniform float effectFactor;

			void main() {
				vec2 aUvs = vUvs;

				vec4 disp = texture2D(disp, aUvs);

				vec2 distortedPosition = vec2(aUvs.x + dispFactor * (disp.r*effectFactor), aUvs.y);
				vec2 distortedPosition2 = vec2(aUvs.x - (1.0 - dispFactor) * (disp.r*effectFactor), aUvs.y);

				vec4 _texture = texture2D(texture, distortedPosition);
				vec4 _texture2 = texture2D(texture2, distortedPosition2);

				vec4 finalTexture = mix(_texture, _texture2, dispFactor);

				gl_FragColor = finalTexture;
			}
	`;

	const uniforms = {
		effectFactor: intensity,
		dispFactor: 0,
		texture: PIXI.Texture.from('https://i.imgur.com/ohDLDdF.jpg'),
		texture2: PIXI.Texture.from('https://i.imgur.com/HshWZbq.jpg'),
		disp: PIXI.Texture.from('https://i.imgur.com/LkpXNHm.jpg'),
	};

	const shader = PIXI.Shader.from(vertexSrc, fragmentSrc, uniforms);
	const quad = new PIXI.Mesh(geometry, shader);

	quad.position.set(350, 350);

	app.stage.addChild(quad);

requestAnimationFrame(animate);
function animate(){
	requestAnimationFrame(animate);
	app.render(app.stage);
}

wrapper.addEventListener('mouseenter', function() {
	TweenMax.to(shader.uniformGroup.uniforms, 1.2, {
		dispFactor: 1,
		ease: Expo.easeOut
	});
});
wrapper.addEventListener('mouseleave', function() {
	TweenMax.to(shader.uniformGroup.uniforms, 0.5, {
		dispFactor: 0,
		ease: Expo.easeOut
	});
});