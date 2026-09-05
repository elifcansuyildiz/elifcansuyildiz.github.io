(()=>{var t=null,a=0,v=null;function e(){clearTimeout(0);let s=document.getElementById("bh-canvas");if(s){let o=s.getContext("webgl",{alpha:!1,antialias:!1,preserveDrawingBuffer:!0}),l=0,n=0,e=()=>{l=s.clientWidth||innerWidth,n=s.clientHeight||innerHeight;let e=1.6*Math.min(devicePixelRatio||1,2);var t=l*n*e*e;11e6<t&&(e*=Math.sqrt(11e6/t)),e=Math.max(e,1),s.width=Math.round(l*e),s.height=Math.round(n*e),o&&o.viewport(0,0,s.width,s.height)},r=(t=()=>{s.clientWidth===l&&s.clientHeight===n||(e(),clearTimeout(a),a=setTimeout(()=>v&&v(),120))},e(),window.addEventListener("resize",t),null);if(o){var c,i,d=o.createProgram();for([c,i]of[[o.VERTEX_SHADER,"attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}"],[o.FRAGMENT_SHADER,`precision highp float;uniform vec2 uRes;uniform float uTime;
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
    vec3 layer(vec3 d,float g,float thr,float rad,float amp,float t){
    vec3 q=d*g;vec3 ci=floor(q);vec3 cf=fract(q)-.5;
    float s1=shash(ci),s2=shash(ci+19.19);
    float st=step(thr,s1)*smoothstep(rad,0.,dot(cf,cf))*(.45+.55*s2)*amp;
    vec3 c=mix(vec3(.85,.9,1.),vec3(1.,.9,.72),step(.55,s2));
    return st*c;}
    vec3 nebula(vec3 d){ // soft lensable gas clouds, warm accent + cool blue
    vec2 q=d.xy/(abs(d.z)+.55)*1.5;
    float a=fbm(q*1.6+vec2(2.1,5.4));
    float b=fbm(q*2.7+vec2(-4.,1.3)+a*.8);
    float cloud=smoothstep(.52,.95,a*.65+b*.55);
    float wisp=smoothstep(.62,1.,b)*.6;
    vec3 warm=vec3(.98,.82,.55),cool=vec3(.42,.55,1.);
    vec3 c=mix(cool,warm,smoothstep(.3,.8,a));
    return (cloud*.16+wisp*.08+a*.02)*c;}
    vec3 stars(vec3 d,float t){
    return layer(d,520.,.977,.20,1.5,t)+layer(d,230.,.9915,.13,2.6,t)+layer(d,90.,.9975,.085,4.2,t);}
    void main(){
    vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
    vec3 cam=vec3(0.,0.,-14.);vec3 fwd=vec3(0.,0.,1.),rgt=vec3(1.,0.,0.),up=vec3(0.,1.,0.);
    vec2 suv=uv+vec2(0.,-.06);vec3 v=normalize(fwd+2.4*(suv.x*rgt+suv.y*up));vec3 p=cam;
    vec3 hv=cross(p,v);float h2=dot(hv,hv);float b=sqrt(h2);
    bool captured=false;
    if(b<16.){
      for(int i=0;i<700;i++){
        float r=length(p);
        if(r<1.0){captured=true;break;}
        if(r>34.&&dot(p,v)>0.)break;
        float dt=clamp(r*.03,.008,.35);
        vec3 acc=-1.5*h2*p/pow(r,5.);
        v+=acc*dt;p+=v*dt;
      }
    }
    vec3 col=vec3(0.);
    if(!captured){
      vec3 d=normalize(v);
      float near=smoothstep(10.,2.62,b);
      // tangential smear: the sky stretches into arcs around the shadow
      float sm=near*near*.11+near*.01;
      vec3 acc=vec3(0.);
      for(int k=-5;k<=5;k++){
        float an=float(k)*sm*.6;float ca=cos(an),sa=sin(an);
        vec3 dd=d*ca+cross(fwd,d)*sa+fwd*dot(fwd,d)*(1.-ca);
        acc+=stars(dd,uTime)+nebula(dd);
      }
      col=acc/11.;
      // faint milky band + dust
      float band=exp(-pow((d.y*.9+d.x*.35)*3.2,2.))*(.35+.65*fbm(d.xz*7.+d.y*4.))*.075;
      col+=band*vec3(.95,.85,.75);
      // lensing magnification brightens the sky toward the ring
      col*=1.+2.2*pow(near,2.5);
      col+=vec3(1.,.9,.8)*exp(-pow((b-2.64)*7.,2.))*.5;
    }
    if(!captured) col+=vec3(.039,.051,.094);
    col=1.-exp(-col*1.15);
    gl_FragColor=vec4(col,1.);
    }`]]){var f=o.createShader(c);o.shaderSource(f,i),o.compileShader(f),o.getShaderParameter(f,o.COMPILE_STATUS)||console.warn(o.getShaderInfoLog(f)),o.attachShader(d,f)}o.linkProgram(d),o.useProgram(d);var h=o.createBuffer(),h=(o.bindBuffer(o.ARRAY_BUFFER,h),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),o.STATIC_DRAW),o.getAttribLocation(d,"p"));o.enableVertexAttribArray(h),o.vertexAttribPointer(h,2,o.FLOAT,!1,0,0);let t=o.getUniformLocation(d,"uRes"),a=o.getUniformLocation(d,"uTime");r=e=>{o.uniform2f(t,s.width,s.height),o.uniform1f(a,e),o.drawArrays(o.TRIANGLE_STRIP,0,4)}}else{let i=s.getContext("2d");r=()=>{var t=s.width,a=s.height,o=(i.fillStyle="#0a0d18",i.fillRect(0,0,t,a),t/(l||t)),r=Math.round(l*n/1600);let e=7;var c=()=>(e=16807*e%2147483647)/2147483647;for(let e=0;e<r;e++)i.fillStyle="rgba(230,232,245,"+(.3+.7*c())+")",i.fillRect(c()*t,c()*a,o,o);i.fillStyle="#04050a",i.beginPath(),i.arc(t/2,.44*a,.08*a,0,2*Math.PI),i.fill()}}(v=r?()=>{e(),r(0)}:null)&&(v(),[80,400,1200].forEach(e=>setTimeout(()=>{v&&document.body.contains(s)&&v()},e)))}}"loading"===document.readyState?document.addEventListener("DOMContentLoaded",e):e()})();