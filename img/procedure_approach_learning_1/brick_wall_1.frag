// Author: wwh
// Title: brick_wall_1

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float plot(vec2 st, float pct){
  return  smoothstep( pct-0.01, pct, st.y) -
          smoothstep( pct, pct+0.01, st.y);
}

#define BRICKWIDTH 0.25
#define BRICKHEIGHT 0.08
#define MORTARTHICKNESS 0.01
#define BMWIDTH (BRICKWIDTH+MORTARTHICKNESS)
#define BMHEIGHT (BRICKHEIGHT+MORTARTHICKNESS)
#define MWF (MORTARTHICKNESS*0.5/BMWIDTH)
#define MHF (MORTARTHICKNESS*0.5/BMHEIGHT)

void main() {
    vec2 st = 1. * gl_FragCoord.xy/u_resolution.x;
    vec3 Cbrick = vec3 (0.5, 0.15, 0.14);
    vec3 Cmortar = vec3 (0.5, 0.5, 0.5);
    float ss = st.x / BMWIDTH;
    float tt = st.y / BMHEIGHT;
    float sbrick = floor(ss); 
    float tbrick = floor(tt); 
    ss += 0.5 * step(mod(tt,2.),1.0);
    float sbrick_f = fract(ss);
    float tbrick_f = fract(tt);
    float w = step(MWF,sbrick_f) - step(1.- MWF,sbrick_f);
    float h = step(MHF,tbrick_f) - step(1.- MHF,tbrick_f);
    vec3 Ct = mix(Cmortar, Cbrick, w * h);
    gl_FragColor = vec4(Ct,1.0);
}
