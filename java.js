
var vertices = [
    -1,1,0.0,
    -1,-1,0.0,
    1,-1,0.0,
    1,1,0.0 
];

indices = [3,2,1,3,1,0]; 


var vertCode =
'precision mediump float;' + 
'attribute vec3 coordinates;' +
'void main() {' +
    ' gl_Position = vec4(coordinates, 1.0);' +
'}';

var fragCode = 
'precision highp float;' + 
'uniform vec4 mousexy;' +
'uniform vec2 idfk;' +
'uniform float time;' +
'void main() {' + 
    'float x = mousexy.z*((gl_FragCoord.x)*0.01/2.0 - 3.0) + mousexy.x;' + 
    'float y = mousexy.z*((gl_FragCoord.y)*0.01/2.0 - 2.5) + mousexy.y;' +
    'float complex = y+mousexy.x;' +
    'float real = x+idfk.y*mousexy.y;' +
    'float itter = 10.0;' + 
    'float temp;' +
    'float dist = (distance(vec2(0,0),vec2(x,y)));' +
    'vec3 rgb = vec3(sin(dist)*sin(dist),sin(dist+3.14159265/4.0)*sin(dist+3.14159265/4.0),sin(dist+3.14159265/2.0)*sin(dist+3.14159265/2.0));' +

    'for (int i = 0; i<1000; i++){' +
        'temp = complex;' + 
        'complex += 2.0*real*temp + y - time;' +
        'real += real*real - temp*temp + x;' +
        'if (10.0<abs(complex*real)){break;}' +
        'if (int(mousexy.w)<i){break;}' +
        'itter += 1.0;' +
    '}' +

    'vec3 a;' + 
    'if (mousexy.w<=itter){gl_FragColor = vec4(0.0,0.0,0.0,1.0);}' +
    'gl_FragColor = vec4(0.3*rgb*itter*0.1,1.0);' +
'}' 
;
var mousex = 0;
var mousey = 0;

const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");
var shaderProgram

function main() {
    if (gl == null){alert("Unable to initialize WebGL :("); return;}
    
    gl.clearColor(0.0,0.0,0.0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var Index_Buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer); 

    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);
    console.log(gl.getShaderInfoLog(fragShader));

    var loc1 = gl.getUniformLocation(shaderProgram,"mousexy");
    gl.uniform4f(loc1,mousex,mousey,1,100);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT,0);
}

var lastx = 0;
var lasty = 0;
var x = 0;
var y = 0;


var mousedown = false;
var zoom = 1;
var itter = 100;

var enabled = false;

canvas.addEventListener('mousedown', e=>{
    mousedown = true;
    lastx = event.clientX;
    lasty = event.clientY;
})
canvas.addEventListener('mouseup', e=>{
    mousedown = false;
    x += mousex;
    y += mousey;
})

canvas.addEventListener('mousemove', e=>{
    if (mousedown){
        
        mousex = lastx-event.clientX;
        mousey = lasty-event.clientY;
        x += mousex*zoom;
        y += -mousey*zoom;

        var loc1 = gl.getUniformLocation(shaderProgram,"mousexy");
        var loc2 = gl.getUniformLocation(shaderProgram,"idfk");
        gl.uniform4f(loc1,x*0.0001,y*0.0001,zoom,itter);
        gl.uniform2f(loc2,x*0.0001,y*0.0001);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT,0);
    }
})

canvas.addEventListener('wheel', e=>{

    event.preventDefault();

    if (event.shiftKey == true){console.log("Yawn"); itter += 10*event.deltaY;}
    else{
        zoom *= Math.pow(2,(-0.001*event.deltaY));
        console.log(zoom)
    }

    var loc1 = gl.getUniformLocation(shaderProgram,"mousexy");

    gl.uniform4f(loc1,x*0.0001,y*0.0001,zoom,itter);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT,0);
})



window.onload = main;


