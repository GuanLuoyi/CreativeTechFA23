import { Renderer, Program, Texture, Mesh, Vec2, Flowmap, Triangle } from './node_modules/ogl/src/index.js';
import data from './api_key.json' assert { type: "json" };
const API_KEY = data.APIKey
const submitIcon = document.querySelector("#submit-icon")
const inputElement = document.querySelector("input")
const imageSection = document.querySelector('.images-section')


const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
}
`;

const fragment = /* glsl */ `
precision highp float;

uniform sampler2D tWater;
uniform sampler2D tFlow;
uniform float uTime;

varying vec2 vUv;

void main() {
    
    // R and G values are velocity in the x and y direction
    // B value is the velocity length
    vec3 flow = texture2D(tFlow, vUv).rgb;

    // Use flow to adjust the uv lookup of a texture
    vec2 uv = gl_FragCoord.xy / 2000.0;
    uv += flow.xy * 0.05;
    vec3 tex = texture2D(tWater, uv).rgb;

    // Oscillate between raw values and the affected texture above
    //tex = mix(tex, flow * 0.5 + 0.5, smoothstep( -0.3, 0.7, sin(uTime)));

    gl_FragColor.rgb = tex;
    gl_FragColor.a = 1.0;
}
`;
{
    const renderer = new Renderer({ dpr: 2 });
    const gl = renderer.gl;
    document.body.appendChild(gl.canvas);
    
    // Variable inputs to control flowmap
    let aspect = 1;
    const mouse = new Vec2(-1);
    const velocity = new Vec2();
    
    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        aspect = window.innerWidth / window.innerHeight;
    }
    window.addEventListener('resize', resize, false);
    resize();
    
    const flowmap = new Flowmap(gl);
    
    // Triangle that includes -1 to 1 range for 'position', and 0 to 1 range for 'uv'.
    const geometry = new Triangle(gl);
    
    const texture = new Texture(gl, { wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });
    const img = new Image();
    img.onload = () => (texture.image = img);
    img.src = 'images/bg.jpeg';
    
    const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
            uTime: { value: 0 },
            tWater: { value: texture },
    
            // Note that the uniform is applied without using an object and value property
            // This is because the class alternates this texture between two render targets
            // and updates the value property after each render.
            tFlow: flowmap.uniform,
        },
    });
    
    const mesh = new Mesh(gl, { geometry, program });
    
    // Create handlers to get mouse position and velocity
    const isTouchCapable = 'ontouchstart' in window;
    if (isTouchCapable) {
        window.addEventListener('touchstart', updateMouse, false);
        window.addEventListener('touchmove', updateMouse, false);
    } else {
        window.addEventListener('mousemove', updateMouse, false);
    }
    
    let lastTime;
    const lastMouse = new Vec2();
    function updateMouse(e) {
        if (e.changedTouches && e.changedTouches.length) {
            e.x = e.changedTouches[0].pageX;
            e.y = e.changedTouches[0].pageY;
        }
        if (e.x === undefined) {
            e.x = e.pageX;
            e.y = e.pageY;
        }
    
        // Get mouse value in 0 to 1 range, with y flipped
        mouse.set(e.x / gl.renderer.width, 1.0 - e.y / gl.renderer.height);
    
        // Calculate velocity
        if (!lastTime) {
            // First frame
            lastTime = performance.now();
            lastMouse.set(e.x, e.y);
        }
    
        const deltaX = e.x - lastMouse.x;
        const deltaY = e.y - lastMouse.y;
    
        lastMouse.set(e.x, e.y);
    
        let time = performance.now();
    
        // Avoid dividing by 0
        let delta = Math.max(14, time - lastTime);
        lastTime = time;
    
        velocity.x = deltaX / delta;
        velocity.y = deltaY / delta;
    
        // Flag update to prevent hanging velocity values when not moving
        velocity.needsUpdate = true;
    }
    
    requestAnimationFrame(update);
    function update(t) {
        requestAnimationFrame(update);
    
        // Reset velocity when mouse not moving
        if (!velocity.needsUpdate) {
            mouse.set(-1);
            velocity.set(0);
        }
        velocity.needsUpdate = false;
    
        // Update flowmap inputs
        flowmap.aspect = aspect;
        flowmap.mouse.copy(mouse);
    
        // Ease velocity input, slower when fading out
        flowmap.velocity.lerp(velocity, velocity.len() ? 0.5 : 0.1);
    
        flowmap.update();
    
        program.uniforms.uTime.value = t * 0.001;
    
        renderer.render({ scene: mesh });
    }
    }

const getImages = async () => {
    const options = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            prompt: inputElement.value,
            n: 4,
            size: "1024x1024"
        })
    }
    try{
        const response = await fetch('https://api.openai.com/v1/images/generations',options)
        const data = await response.json()
        // console.log(data)
        data?.data.forEach(imageObject => {
            const imageContainer = document.createElement('div')
            imageContainer.classList.add('image-container')
            const imageElement = document.createElement('img')
            imageElement.setAttribute('src', imageObject.url)
            imageContainer.append(imageElement)
            imageSection.append(imageContainer)
        })
    } catch (error) {
        console.error(error)
    }
}


submitIcon.addEventListener('click', getImages)