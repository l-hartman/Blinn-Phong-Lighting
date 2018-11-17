/**
 *  @author Luke Hartman <lhartman3@zagmail.gonzaga.edu>
 *  @requires WebGL: Common
 *  @description This program demonstrates two different Blinn-Phonglighting effects on a bunny.
 */

"use strict";

let canvas;

/** @type {WebGLRenderingContext} */
let gl;

let points = [];
let normals = [];

let program;

let rot1;
let rot2;
let rot3;
let scale1;
let t1;
let t2;

let angle = 0;

let lx = 0;
let ly = 0;

let status;

// Utility function to make it easier to set a uniform vec3.
function setUniform3f(prog, name, x, y, z) {
    let location = gl.getUniformLocation(prog, name);
    gl.uniform3f(location, x, y, z);
}

window.onload = function init()
{
    status = document.getElementById("status");
    rot1 = document.getElementById("rot1");
    rot2 = document.getElementById("rot2");
    rot3 = document.getElementById("rot3");
    scale1 = document.getElementById("scale1");
    t1 = document.getElementById("t1");
    t2 = document.getElementById("t2");
    [rot1, rot2, rot3, scale1, t1, t2].forEach(function(elem) {
        elem.initValue = elem.value;
        elem.addEventListener("dblclick", function() {
            elem.value = elem.initValue;
        });
    });
    canvas = document.getElementById( "gl-canvas" );
    canvas.addEventListener("mousemove", function(event) {
        // get mouse position relative to the canvas
        lx = 2 * event.clientX / canvas.width - 1;
        ly = 2 * (canvas.height - event.clientY) / canvas.height - 1;
    });

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    // Set points and normals to be what is stored in "bunny.js"
    points = bunny_pos;
    normals = bunny_norm;

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    let nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );

    let vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    let vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    let vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    window.requestAnimationFrame(render);
};

function render()
{
    angle += 0.1;
    status.innerHTML = "Angles: " + (+rot1.value).toFixed()
        + ", " + (+rot2.value).toFixed()
        + ", " + (+rot3.value).toFixed()
        + ". Scale: " + (+scale1.value).toFixed(2)
        + ". Translation: " + (+t1.value).toFixed(2)
        + ", " + (+t2.value).toFixed(2);
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    let r1 = rotateX(rot1.value);
    let r2 = rotateY(rot2.value);
    let r3 = rotateZ(rot3.value);
    let s1 = scalem(scale1.value, scale1.value, scale1.value);
    let trans = translate(t1.value, t2.value, 0);

    let mat = mult(trans, mult(s1, mult(r3, mult(r2, r1))));

    let location = gl.getUniformLocation(program, "mat");
    gl.uniformMatrix4fv(location, false, flatten(mat));

    let rotationSpeedMultiplier = 10;
    // x = cos(angle in radians)
    let x = Math.cos(( Math.PI * angle * rotationSpeedMultiplier ) / 180.0);
    // y = sin(angle in radians)
    let y = Math.sin(( Math.PI * angle * rotationSpeedMultiplier ) / 180.0);

    // Set uniforms as appropriate
    setUniform3f(program, "lightDir", x, y, 0.0);
    setUniform3f(program, "lightDirM", lx, ly, 3.0);    
    setUniform3f(program, "lightColor", 0.831, 0.686, 0.216);
    setUniform3f(program, "lightColorM", 0.753, 0.753, 0.753);
    setUniform3f(program, "ambientColor", 0.1, 0.1, 0.3); 
    setUniform3f(program, "surfaceDiffuse", 0.3, 0.2, 0.3);
    setUniform3f(program, "surfaceSpec", 0.8, 0.8, 0.8);
    setUniform3f(program, "surfaceSpecM", 0.8, 0.8, 0.8);

    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    window.requestAnimationFrame(render);
}
