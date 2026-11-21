(()=>{let g=87,y=40,I=.5;function D(e){var t,a,r,o,i=g*Math.PI/180,s=Math.sin(i),i=Math.cos(i),n=[0,-y*s,y*i],l=[0,s,-i],i=[0,i,s],s=[1,0,0];r=(t=n[0])*t+(m=n[1])*m+(a=n[2])*a-(e=e)*e,o=(r=Math.sqrt(.5*(r+Math.sqrt(r*r+4*e*e*a*a))))*r+e*e;let[h,c]=[2*I*r*r*r/(r*r*r*r+e*e*a*a),[1,(r*t+e*m)/o,(r*m-e*t)/o,a/r]],u=(e,t)=>(e===t?e?1:-1:0)+h*c[e]*c[t];var d,f=(a,r)=>{let o=0;for(let t=0;t<4;t++)for(let e=0;e<4;e++)o+=u(t,e)*a[t]*r[e];return o},m=t=>t.map((e,r)=>t.reduce((e,t,a)=>e+u(r,a)*t,0));let v=[1/Math.sqrt(-u(0,0)),0,0,0],p=[];for(d of[l,i,s]){let e=[0,...d],r=f(e,v);e=e.map((e,t)=>e+r*v[t]);for(let a of p)r=f(e,a),e=e.map((e,t)=>e-r*a[t]);r=Math.sqrt(f(e,e)),p.push(e.map(e=>e/r))}return{X:n,ut:v[0],sky:[...s,...i,...l],u:m(v),e:p.map(m)}}function e(){let l=document.getElementById("bh-canvas");if(!l)return;let o=null;try{o=l.getContext("webgl",{alpha:!1,antialias:!1,depth:!1,stencil:!1,preserveDrawingBuffer:!0})}catch(e){console.warn("404 WebGL context unavailable:",e)}let h=0,c=0,r=0,e=0,i=null,s=null,u=[],n=o?o.getParameter(o.MAX_VIEWPORT_DIMS):[16384,16384],d=o?o.getParameter(o.MAX_RENDERBUFFER_SIZE):16384,f=()=>l.clientWidth||innerWidth,m=()=>l.clientHeight||innerHeight,v=()=>Math.min(window.devicePixelRatio||1,2),t=()=>{h=f(),c=m();let e=r=v();var t=h*c*e*e,t=(11e6<t&&(e*=Math.sqrt(11e6/t)),e=Math.min(e,n[0]/h,n[1]/c,d/Math.max(h,c)),Math.max(1,Math.floor(h*e))),a=Math.max(1,Math.floor(c*e));l.width!==t&&(l.width=t),l.height!==a&&(l.height=a),o&&o.viewport(0,0,l.width,l.height)},a=()=>{t(),i&&i(0),s&&s()},p=()=>{clearTimeout(e),f()===h&&m()===c&&v()===r||(e=setTimeout(a,120))},g=(t(),window.addEventListener("resize",p),null),y=()=>{g&&g.removeEventListener("change",w),(g=window.matchMedia("(resolution: "+(window.devicePixelRatio||1)+"dppx)")).addEventListener("change",w)},w=()=>{y(),p()};if(y(),o)try{var b,x,k,R=(o.getExtension("OES_standard_derivatives")?"#extension GL_OES_standard_derivatives : enable\n#define SKY_DERIVATIVES\n":"")+`precision highp float;uniform vec2 uRes;uniform float uTime;
    uniform vec3 uX0;uniform vec4 uU,uEf,uEu,uEr;uniform mat3 uSky;uniform float uA,uRp,uAim,uFov,uZ,uNarrow;uniform vec2 uRoll;
    uniform vec3 uWhite;uniform float uRin,uRout,uTd,uTs,uExp,uCamT,uBeam;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    // Stars need their OWN hash. layer() feeds the sin one above arguments of
    // ~3e6, where one ULP of a 32-bit float is a whole radian -- the angle is
    // quantised to 57 degrees of phase, so the result is entirely down to how
    // the GPU range-reduces sin. Desktop drivers happen to scatter it into
    // something uniform; mobile ones reduce cheaply and collapse it, every cell
    // landed under the 0.977 threshold, and the sky came up empty -- the star
    // field missing on a phone while perfect on a desktop. This is the standard
    // multiply-and-fract hash instead: no sin, and every intermediate stays
    // small enough to keep its bits. Measured over the cell indices layer()
    // actually produces it is flat to +/-0.3% per decile.
    float shash(vec3 p){
    p=fract(p*vec3(.1031,.1030,.0973));
    p+=dot(p,p.zyx+31.32);
    return fract((p.x+p.y)*p.z);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.1+vec2(7.3,3.1);a*=.5;}return v;}
    // Gaussian RBF: rad is the old squared radius, so gamma=1.25/rad
    // keeps a similar core width and lets the light fall off into soft tails.
    // A Gaussian never reaches zero. Taper it smoothly between cell radii
    // .4 and .5, before floor(q) switches stars, or the tails expose the grid.
    // This changes shading only; it needs no additional rays or cell lookups.
    float starRbf(float d2,float rad){
    return exp(-1.25*d2/rad)*(1.-smoothstep(.16,.25,d2));}
    vec3 layer(vec3 d,float g,float thr,float rad,float amp,float t){
    vec3 q=d*g;vec3 ci=floor(q);vec3 cf=fract(q)-.5;
    float s1=shash(ci),s2=shash(ci+19.19);
    float st=step(thr,s1)*starRbf(dot(cf,cf),rad)*(.45+.55*s2)*amp;
    vec3 c=mix(vec3(.85,.9,1.),vec3(1.,.9,.72),step(.55,s2));
    return st*c;}
    // uZ scales the whole sky with the camera's zoom, so stars and gas look
    // the same on screen whatever the FOV.
    vec3 nebula(vec3 d){ // soft lensable gas clouds, warm accent + cool blue
    vec2 q=d.xy/(abs(d.z)+.55)*1.5*uZ;
    float a=fbm(q*1.6+vec2(2.1,5.4));
    float b=fbm(q*2.7+vec2(-4.,1.3)+a*.8);
    float cloud=smoothstep(.52,.95,a*.65+b*.55);
    float wisp=smoothstep(.62,1.,b)*.6;
    vec3 warm=vec3(.98,.82,.55),cool=vec3(.42,.55,1.);
    vec3 c=mix(cool,warm,smoothstep(.3,.8,a));
    return (cloud*.096+wisp*.048+a*.012)*c;}
    vec3 stars(vec3 d,float t){
    // Approximate old/new kernel-volume ratios in each 3D cell compensate
    // for the wider tails, keeping the field's average light level similar.
    return layer(d,520.*uZ,.977,.20,1.5*.75,t)+layer(d,230.*uZ,.9915,.13,2.6*.55,t)+layer(d,90.*uZ,.9975,.085,4.2*.45,t);}
    // Everything at infinity in direction d: stars, gas, a faint milky band and
    // a uniform navy glow. Lensing preserves surface brightness, so the uniform
    // glow stays uniform everywhere -- only the shadow cuts into it.
    vec3 sky(vec3 d){
    float band=exp(-pow((d.y*.9+d.x*.35)*3.2*uZ,2.))*(.35+.65*fbm((d.xz*7.+d.y*4.)*uZ))*.045;
    return stars(d,uTime)+nebula(d)+band*vec3(.95,.85,.75)+vec3(.023,.031,.056);}
    // Light in the Kerr metric, Kerr-Schild coordinates. With p_t=-1 the
    // Hamiltonian is H=(P.P-1-f(1+l.P)^2)/2, and kerr() returns dX=dH/dP and
    // dP=-dH/dX in closed form. Rays run from the camera outward -- backwards
    // in time, which is the same as forwards around a hole spinning the other
    // way, so uA is minus the spin.
    const float M=.5;
    float kr(vec3 X){float a2=uA*uA,w=dot(X,X)-a2;return sqrt(.5*(w+sqrt(w*w+4.*a2*X.z*X.z)));}
    void kerr(vec3 X,vec3 P,out vec3 dX,out vec3 dP){
    float a=uA,r=kr(X),r2=r*r,S=r2+a*a,Q=r2*r2+a*a*X.z*X.z;
    vec3 l=vec3((r*X.x+a*X.y)/S,(r*X.y-a*X.x)/S,X.z/r);
    float f=2.*M*r2*r/Q,L=1.+dot(l,P);
    dX=P-f*L*l;
    vec3 dr=vec3(X.xy*r2*r,X.z*r*S)/Q;                  // grad r
    float B=dot(X.xy,P.xy),A=r*B+a*(X.y*P.x-X.x*P.y);   // l.P = A/S + z*Pz/r
    vec3 gL=((dr*B+vec3(r*P.x-a*P.y,r*P.y+a*P.x,0.))*S-2.*A*r*dr)/(S*S)+P.z*(vec3(0.,0.,r)-X.z*dr)/r2;
    vec3 gf=2.*M*r2/(Q*Q)*((3.*a*a*X.z*X.z-r2*r2)*dr-vec3(0.,0.,2.*a*a*X.z*r));
    dP=.5*L*L*gf+f*L*gL;}
    // The disc. planck() samples the blackbody spectrum at the three
    // primaries (micrometres), scaled so 6500 K is white. The gas is streaked
    // along its orbits the way sheared gas is -- noise in radius drifting
    // slowly with azimuth, sampled on a circle so it wraps round -- and thins
    // out toward the outer edge. Like any slab of glowing gas it is opaque
    // where dense and see-through where thin: opacity 1-exp(-tau).
    vec3 planck(float T){vec3 l=vec3(.61,.55,.465);return uWhite/(l*l*l*l*l*(exp(14388./(l*max(T,400.)))-1.));}
    // Light and opacity of the disc where a ray crossed it. The gas is on a
    // prograde circular orbit; g=E_camera/E_gas is the Doppler and
    // gravitational shift of its light (Omega<0 for the reversed spin traced
    // here, and x*Py-y*Px is the photon's conserved angular momentum about the
    // axis). A blackbody seen shifted by g looks like one at g*T; uBeam scales
    // that in.
    vec4 disc(vec3 X,vec3 P){
    float r=kr(X),a=-uA,sM=sqrt(M),s=sqrt(r),q=r*s+a*sM;
    float ut=q/(sqrt(r*s)*sqrt(r*s-3.*M*s+2.*a*sM)),om=-sM/q;
    float g=uCamT/(ut*(1.-om*(X.x*P.y-X.y*P.x)));
    vec2 c=X.xy/length(X.xy);
    float n=.6*fbm(vec2(r*4.,0.)+c*1.5)+.4*noise(vec2(r*19.,0.)+c*2.5);
    float thick=smoothstep(uRin,uRin*1.06,r)*(1.-smoothstep(uRout*.4,uRout,r));
    float op=1.-exp(-3.*thick*(.25+1.2*n));
    // Hotter toward the hole, so white there and orange further out. Only the
    // hue follows the temperature -- the colour is normalised, and brightness
    // falls off gently instead -- unless beaming is on, whose shift does
    // change it.
    float T=uTd*pow(r/uRin,-uTs);vec3 b=planck(T);
    return vec4(uExp*op*(.3+1.2*n*n)*sqrt(uRin/r)*planck(T*pow(g,uBeam))/max(b.r,max(b.g,b.b)),op);}
    vec3 view(vec2 s){return normalize(vec3(uFov*s,1.));}
    // RK4, each step moving 0.1r. What the ray from screen point s meets:
    // 0 the horizon, 1 the sky (d is the direction there), 2 disc gas it could
    // not see past. e is the disc light picked up on the way and w how much of
    // what lies beyond still shows through. near<1 flags a ray that passed
    // close to the hole or the disc, whose neighbours may see something else.
    float trace(vec2 s,out vec3 d,out vec3 e,out float w,out float near){
    vec3 n=view(s);vec4 p=uU+n.z*uEf+n.y*uEu+n.x*uEr;
    vec3 X=uX0,P=p.yzw/(-p.x),a1,b1,a2,b2,a3,b3,a4,b4;
    d=vec3(0.);e=d;w=1.;near=1e9;
    for(int i=0;i<300;i++){
      float r=kr(X);near=min(near,r*.2);
      if(r<uRp*1.01)return 0.;
      kerr(X,P,a1,b1);
      if(r>200.){d=normalize(a1)*uSky;return 1.;}
      float h=.1*r/length(a1);
      kerr(X+.5*h*a1,P+.5*h*b1,a2,b2);
      kerr(X+.5*h*a2,P+.5*h*b2,a3,b3);
      kerr(X+h*a3,P+h*b3,a4,b4);
      vec3 Xn=X+h/6.*(a1+2.*a2+2.*a3+a4),Pn=P+h/6.*(b1+2.*b2+2.*b3+b4);
      if(X.z*Xn.z<0.){ // crossed the equatorial plane
        float t=X.z/(X.z-Xn.z),rc=kr(mix(X,Xn,t));
        near=min(near,rc/(1.3*uRout));
        if(rc>uRin&&rc<uRout){
          vec4 c=disc(mix(X,Xn,t),mix(P,Pn,t));
          e+=w*c.rgb;w*=1.-c.a;
          if(w<.01)return 2.;
        }
      }
      X=Xn;P=Pn;
    }
    return 0.;}
    vec3 shade(float k,vec3 d,vec3 e,float w){return k>.5&&k<1.5?e+w*sky(d):e;}
    void main(){
    // Screen to camera plane, in units of S -- the height, or NARROW times the
    // width on a tall phone: lift the hole 0.06 above centre, roll, then
    // shift by AIM so the shadow rather than the hole is centred.
    float S=min(uRes.y,uNarrow*uRes.x);
    vec2 q=(gl_FragCoord.xy-.5*uRes)/S-vec2(0.,.06);
    vec2 suv=vec2(uRoll.x*q.x-uRoll.y*q.y,uRoll.y*q.x+uRoll.x*q.y)+vec2(uAim,0.);
    vec3 d,e;float w,nr;float k=trace(suv,d,e,w,nr);
    #ifdef SKY_DERIVATIVES
    // Neighbouring centre rays already contain the lens's stretch and roll.
    // Derivatives must be evaluated before the per-pixel far/near branch.
    vec3 skyDx=dFdx(d),skyDy=dFdy(d);
    #endif
    // 3x3 samples per pixel. A ray that passed near the hole or the disc has
    // neighbours that may see something else entirely, so every sample is
    // traced; elsewhere lensing is gentle and each sample just offsets the
    // centre ray's sky direction.
    bool far=k>.5&&k<1.5&&nr>1.;
    vec3 col=vec3(0.);
    for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
      vec2 pixel=vec2(float(i),float(j))/3.;
      vec2 o=vec2(uRoll.x*pixel.x-uRoll.y*pixel.y,uRoll.y*pixel.x+uRoll.x*pixel.y)/S;
      if(far){
        #ifdef SKY_DERIVATIVES
        col+=sky(normalize(d+skyDx*pixel.x+skyDy*pixel.y));
        #else
        col+=sky(normalize(d+view(suv+o)-view(suv)));
        #endif
      }
      else if(i==0&&j==0)col+=shade(k,d,e,w);
      else{vec3 ds,es;float ws,ns;float ks=trace(suv+o,ds,es,ws,ns);col+=shade(ks,ds,es,ws);}
    }
    col=1.-exp(-col/9.*1.3); // tone map; 1.3 is the exposure
    gl_FragColor=vec4(col,1.);
    }`;let t=o.createProgram();for([b,x]of[[o.VERTEX_SHADER,"attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}"],[o.FRAGMENT_SHADER,R]]){var P,X=o.createShader(b);if(o.shaderSource(X,x),o.compileShader(X),!o.getShaderParameter(X,o.COMPILE_STATUS))throw P=o.getShaderInfoLog(X),o.deleteShader(X),o.deleteProgram(t),new Error(P||"404 shader compilation failed");o.attachShader(t,X),o.deleteShader(X)}if(o.linkProgram(t),!o.getProgramParameter(t,o.LINK_STATUS))throw k=o.getProgramInfoLog(t),o.deleteProgram(t),new Error(k||"404 shader linking failed");o.useProgram(t);var M=o.createBuffer(),E=(o.bindBuffer(o.ARRAY_BUFFER,M),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),o.STATIC_DRAW),o.getAttribLocation(t,"p"));o.enableVertexAttribArray(E),o.vertexAttribPointer(E,2,o.FLOAT,!1,0,0);let a=o.getUniformLocation(t,"uRes"),r=o.getUniformLocation(t,"uTime");var S=-.9*I,A=D(S),T=e=>o.getUniformLocation(t,e),q=(o.uniform3fv(T("uX0"),A.X),o.uniform4fv(T("uU"),A.u),o.uniform4fv(T("uEf"),A.e[0]),o.uniform4fv(T("uEu"),A.e[1]),o.uniform4fv(T("uEr"),A.e[2]),o.uniformMatrix3fv(T("uSky"),!1,A.sky),o.uniform1f(T("uA"),S),o.uniform1f(T("uRp"),I+Math.sqrt(I*I-S*S)),o.uniform1f(T("uAim"),.0312),o.uniform1f(T("uFov"),.7916),o.uniform1f(T("uZ"),2.4/.7916),o.uniform1f(T("uNarrow"),1.3),-10*Math.PI/180);o.uniform2f(T("uRoll"),Math.cos(q),Math.sin(q)),o.uniform1f(T("uRin"),(z=.9,L=1+Math.cbrt(1-z*z)*(Math.cbrt(1+z)+Math.cbrt(1-z)),(3+(z=Math.sqrt(3*z*z+L*L))-Math.sqrt((3-L)*(3+L+2*z)))*I)),o.uniform1f(T("uRout"),16),o.uniform1f(T("uCamT"),A.ut),o.uniform1f(T("uTd"),6800),o.uniform1f(T("uTs"),.4),o.uniform1f(T("uExp"),2.4),o.uniform1f(T("uBeam"),0),o.uniform3fv(T("uWhite"),[.61,.55,.465].map(e=>Math.pow(e,5)*(Math.exp(14388/(6500*e))-1))),i=e=>{o.uniform2f(a,l.width,l.height),o.uniform1f(r,e),o.drawArrays(o.TRIANGLE_STRIP,0,4)},u=[["1.2vh",.85],["7vh",.6]].map(([e,t])=>{var a=document.createElement("canvas");return a.className=l.className,a.setAttribute("aria-hidden","true"),Object.assign(a.style,{background:"transparent",filter:"blur("+e+")",mixBlendMode:"screen",opacity:t}),l.after(a),a}),s=()=>{let a=Math.ceil(l.width/4),r=Math.ceil(l.height/4);u.forEach((e,t)=>{e.width=a,e.height=r;e=e.getContext("2d");e&&(e.drawImage(t?u[0]:l,0,0,a,r),t||(e.globalCompositeOperation="multiply",e.drawImage(l,0,0,a,r)))})}}catch(e){console.warn("404 shader unavailable; using the star-field fallback:",e),o=null}var z,L;let _=()=>{var e=l.cloneNode(!1);l.replaceWith(e),l=e,o=null,s=null,u.forEach(e=>e.remove()),u=[];let n=l.getContext("2d");i=n?()=>{var t=l.width,a=l.height,r=(n.fillStyle="#080a12",n.fillRect(0,0,t,a),t/(h||t)),o=Math.round(h*c/1600);let e=7;var i=()=>(e=16807*e%2147483647)/2147483647;for(let e=0;e<o;e++)n.fillStyle="rgba(230,232,245,"+(.3+.7*i())+")",n.fillRect(i()*t,i()*a,r,r);var s=Math.min(a,1.3*t);n.fillStyle="#04050a",n.beginPath(),n.arc(t/2,a/2-.06*s,.0755*s,0,2*Math.PI),n.fill()}:null};o?l.addEventListener("webglcontextlost",()=>{clearTimeout(e),_(),a()},{once:!0}):_(),a()}"loading"===document.readyState?document.addEventListener("DOMContentLoaded",e):e()})();