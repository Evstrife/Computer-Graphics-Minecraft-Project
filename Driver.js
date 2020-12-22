
/**
 * Created by David John on 9/24/2020
 * Modified by David John on 10/3/2020:
 *      included perspective projection, modelview matrics
 *
 * Program to illustrate the basic ideas of rendering a 3d image
 * using index vertices (element array buffer)
 */
"use strict";
/*
Team MineGraft: Frank Fang, Robin Zhang, Eva Wu
 */
var canvas;
var webgl;

// variables to enable CPU manipulation of GPU uniform "theta"
var light = 0.0;    // boolean light on/off
//var theta =0.0;
//var beta = 0.0;
//var gama = 0.0;
//var len = 0.0;
var xx = 0.0;       // x axis
var zz = 0.0;       // z axis
var alpha = 0.0;
var dir = 0.0;


//var triangleOneON = false;
//var triangleTwoON = false;
var lightON = false;
var leftB = false;
var rightB = false;
var frontB = false;
var backB = false;
var walk = 0.0;

var lightLoc;
//var betaLoc;
//var gamaLoc;
//var thetaLoc;
//var lenLoc;
//var deltatheta = 0.01;
var xxLoc;
var zzLoc;
var walkLoc;
var alphaLoc;
var dirLoc;

// frustum information
var near = 1.0;
var far = 60.0;
var  fovy = 80.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect; // Viewport aspect ratio (setup once canvas is known)

/*
function pickaxeControl(){ // button controls the pickaxe to spin
    triangleOneON = !triangleOneON;
    if (triangleOneON){
        document.getElementById("rButton").style.backgroundColor = "#00FF00";
    }
    else{
        document.getElementById("rButton").style.backgroundColor = "#005500";
    }
}

function RevolveControl(){ // button controls the pickaxe to revlove
    triangleTwoON = !triangleTwoON;
    if (triangleTwoON){
        document.getElementById("gButton").style.backgroundColor = "#00FFFF";
    }
    else{
        document.getElementById("gButton").style.backgroundColor = "#0000FF";
    }
}
*/

function LightControl(){ // button controls the pickaxe to revlove
    lightON = !lightON;
    if (lightON){
        document.getElementById("bButton").style.backgroundColor = "#F3F312";
    }
    else{
        document.getElementById("bButton").style.backgroundColor = "#B012F3";
    }
}

//*****************************************************************
/*
// Tried to enable texture
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be downloaded over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    const image = new Image();
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            srcFormat, srcType, image);

        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}
****************************************************************************************
 */

function clickl(){
    leftB = !leftB;
    walk = 1.0 - walk;
    if (leftB){
        document.getElementById("LeftButton").style.backgroundColor = "#FF6320";
    }
    else{
        document.getElementById("LeftButton").style.backgroundColor = "#FF0000";
    }
}
function clickr(){
    rightB = !rightB;
    walk = 1.0 - walk;
    if (rightB){
        document.getElementById("RightButton").style.backgroundColor = "#FF6320";
    }
    else{
        document.getElementById("RightButton").style.backgroundColor = "#FF0000";
    }
}
function clickf(){
    frontB = !frontB;
    walk = 1.0 - walk;
    if (frontB){
        document.getElementById("FrontButton").style.backgroundColor = "#FF6320";
    }
    else{
        document.getElementById("FrontButton").style.backgroundColor = "#FF0000";
    }
}
function clickb(){
    backB = !backB;
    walk = 1.0 - walk;
    if (backB){
        document.getElementById("BackButton").style.backgroundColor = "#FF6320";
    }
    else{
        document.getElementById("BackButton").style.backgroundColor = "#FF0000";
    }
}

var colorPalette = [

    vec4(204/255,102/255, 0.0, 1.0 ),  // light brown, handle middle
    vec4(153/255,76/255, 0.0, 1.0 ),  // dark brown, handle bot
    vec4(102/255,51/255, 0.0, 1.0 ),  // dark dark brown, handle top
    vec4(0,153/255, 153/255, 1.0 ),  // dark dark blue, pixaxe outer
    vec4(0,204/255, 204/255, 1.0 ),  // dark blue, pixaxe inter
    vec4(0,1, 1, 1.0 ),  // shining blue, pixaxe shine
    vec4(0.1, 0.1, 0.1, 1.0), // testing color
    vec4(184.0/255.0, 152.0/255.0, 96.0/255.0, 1.0), // wall color
    vec4(164.0/255.0, 131.0/255.0, 77.0/255.0, 1.0), // wall color
    vec4(155.0/255.0, 131.0/255.0, 79.0/255.0, 1.0),// wall color
    vec4(41.0/255.0, 29.0/255.0, 9.0/255.0, 1.0), // 10, steve hair
    vec4(170.0/255.0,125.0/255.0, 102.0/255.0, 1.0), //11, lighter skin
    vec4(149.0/255.0, 111.0/255.0, 90.0/255.0, 1.0), //12, darker skin
    vec4(105.0/255.0,65.0/255.0, 48.0/255.0, 1.0), // 13, mouth
    vec4(1.0/255.0, 175.0/255.0, 176.0/255.0, 1.0), // 14, lighter shirt
    vec4(0.0/255.0, 153.0/255.0, 153.0/255.0, 1.0), // 15, darker shirt
    vec4(255.0/255.0, 255.0/255.0, 255.0/255.0, 1.0), // 16, eye white
    vec4(70.0/255.0, 59.0/255.0, 164.0/255.0, 1.0), // 17, pant
    vec4(107.0/255.0, 107.0/255.0, 107.0/255.0, 1.0), // 18 shoes
    vec4(121.0/255.0, 64.0/255.0, 53.0/255.0, 1.0), // mouth2
    vec4(101.0/255.0, 78.0/255.0, 43.0/255.0, 1.0) ,// wall color dark
    vec4(255.0/255.0, 143.0/255.0, 0.0/255.0, 1.0), // 21 flame
    vec4(255.0/255.0, 216.0/255.0, 0.0/255.0, 1.0), //22 fire
    vec4(255.0/255.0, 255.0/255.0, 255.0/255.0, 1.0), // 23 white
    vec4(59.0/255.0, 46.0/255.0, 27.0/255.0, 1.0), // 24 handle dark
    vec4(85.0/255.0, 69.0/255.0, 46.0/255.0, 1.0), // 25 handle mid
    vec4(255.0/255.0, 255.0/255.0, 151.0/255.0, 1.0), // 26 bright yellow
];

// uniform matrices for modelview and projection
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

// eye information
var eye = vec3(0.0,3.0,6.0);  // eye position
const at = vec3(0.0, 0.0, -6.0);  //  direction of view
const up = vec3(0.0, 2.0, 0.0);  // up direction



// Four colors associated with the 4 vertices that
// build my pyramid

var vertexColors = [

];

// Four vertices that define the geometry of my pyramid
// (all in viewing volume coordinates as homogeneous coordinates)
var vertexPositions = [
];

// vertex indices for the 4 triangles that
// constitute my pyramind.  these are entered in
// right hand order (normal vectors point to the outside).
var attrIndices = [
];
var attrTypes = [

]

// **************
var positionsArray = [];
var normalsArray = [];
var typesArray = [];


// define and register callback function to start things off once the html data loads
window.onload = function init()

{
    /*document.getElementById("rButton").onclick = pickaxeControl;
    document.getElementById("deltatheta").onchange = function(event){
        deltatheta = parseFloat(event.target.value);
    };

    document.getElementById("gButton").onclick = RevolveControl;*/
    document.getElementById("bButton").onclick = LightControl;
/*document.getElementById("gama").onchange = function(event){
        gama = parseFloat(event.target.value);
    }
    document.getElementById("len").onchange = function(event){
        len = parseFloat(event.target.value);
    }
*/
    document.getElementById("LeftButton").onmousedown = clickl;
    document.getElementById("LeftButton").onmouseup = clickl;

    document.getElementById("RightButton").onmousedown = clickr;
    document.getElementById("RightButton").onmouseup = clickr;

    document.getElementById("FrontButton").onmousedown = clickf;
    document.getElementById("FrontButton").onmouseup = clickf;

    document.getElementById("BackButton").onmousedown = clickb;
    document.getElementById("BackButton").onmouseup = clickb;

    canvas = document.getElementById( "gl-canvas" );
    webgl = WebGLUtils.setupWebGL( canvas );
    if ( !webgl ) { alert( "WebGL isn't available" ); }
    // set up aspect ratio for frustum
    aspect = canvas.width / canvas.height;

    webgl.viewport( 0, 0, canvas.width, canvas.height );
    webgl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    // enable hidden surface removal (by default uses LESS)
    webgl.enable(webgl.DEPTH_TEST);

    /*
    // Load texture
    const texture1 = loadTexture(webgl, 'Left.png');
    const texture2 = loadTexture(webgl, 'right.png');
    const texture3 = loadTexture(webgl, 'front.png');
    const texture4 = loadTexture(webgl, 'fc.png');
    */

    //
    //  Load shaders and initialize attribute buffers
    //  Set webgl context to "program"
    //
    var program = initShaders( webgl, "vertex-shader", "fragment-shader" );
    webgl.useProgram( program );

    // get GPU location of uniforms in <program>
    lightLoc = webgl.getUniformLocation(program, "lighting");
    //betaLoc = webgl.getUniformLocation(program, "beta");
    //gamaLoc = webgl.getUniformLocation(program, "gama");
    //lenLoc = webgl.getUniformLocation(program, "len");
    //thetaLoc = webgl.getUniformLocation(program,"theta");
    xxLoc = webgl.getUniformLocation(program, "xx");
    zzLoc = webgl.getUniformLocation(program, "zz");
    walkLoc = webgl.getUniformLocation(program, "walk");
    dirLoc = webgl.getUniformLocation(program, "dir");
    alphaLoc = webgl.getUniformLocation(program, "alpha");
    projectionMatrixLoc = webgl.getUniformLocation(program,"projectionMatrix");
    modelViewMatrixLoc = webgl.getUniformLocation(program,"modelViewMatrix");


    // ******
    // draw the pickaxe's diamond blade
var axetype = 10.0;
    for (var j = 0; j < 4; j++){
        MyCube2(0.3/2 , -0.1 * j/2, 0, 3, axetype);
        MyCube2(0.5 /2, -0.1 * j/2, 0, 3, axetype);

        MyCube2(-0.1 * j/2 , 0.3/2 , 0, 3, axetype);
        MyCube2(-0.1 * j/2 , 0.5 /2, 0, 3, axetype);
    }
    MyCube2(0.1 /2, 0.5/2 , 0, 3, axetype);
    MyCube2(0.2 /2, 0.4 /2, 0, 3, axetype);
    MyCube2(-0.4 /2, 0.4/2 , 0, 3, axetype);
    MyCube2(0.5 /2, 0.1 /2, 0, 3, axetype);
    MyCube2(0.4/2 , -0.4 /2, 0, 3, axetype);
    MyCube2(0.4/2 , 0.2 /2, 0, 3, axetype);

    for (var t = 0; t < 3; t++){
        MyCube2(0.1/2 - 0.1*t /2, 0.4 /2, 0, 4, axetype);
        MyCube2(0.4 /2, 0.1 /2- 0.1*t /2, 0, 4, axetype);
    }
    for (var q = 0; q<2; q++){
        MyCube2(0.1 /2+ 0.1*q /2, 0.3 /2, 0, 4, axetype);
        MyCube2(0.2 /2+ 0.1*q/2 , 0.2/2 , 0, 4, axetype);
    }
    MyCube2(0.3/2 , 0.1 /2, 0, 4, axetype);

    for (var w = 0; w<2; w++){
        MyCube2(-0.2/2 - 0.1*w/2 , 0.4 /2, 0, 5, axetype);
        MyCube2(0.4/2, -0.2 /2- 0.1*w/2, 0, 5, axetype);
    }

    // draw handle
    for (var i = 0; i<12 ; i++){
        MyCube2(-0.7 /2+ 0.1*i/2,-0.7/2 + 0.1*i/2,0.0,0, axetype);
    }

    for (var k = 0; k<11 ; k++) {
        MyCube2(-0.7 /2+ 0.1/2 * k, -0.7/2 + 0.1 * k /2+ 0.1/2, 0.0, 1, axetype);
        MyCube2(-0.7/2+0.1/2+0.1*k/2, -0.7 /2+0.1*k/2, 0.0, 2, axetype);
    }

    // ********************************************************************************
    // STEVE starting here

    //left leg type = 2.0
    var llegtype = 2.0;
    for (var i = 0; i < 4; i++){ //left shoe
        for (var j = 0; j<4; j ++){
            for (var k = 0 ; k <2; k ++){
                MyCube( -0.1- 0.1*i ,0.1*k ,-0.1 *j,18, llegtype);
            }
        }
        MyCube( -0.1- 0.1*i ,0.2,-0.2,18, llegtype);
        MyCube( -0.1- 0.1*i ,0.2,-0.3,18, llegtype);
        MyCube( -0.1- 0.1*i ,0.2 ,0.0,17, llegtype);
        MyCube( -0.1- 0.1*i ,0.2 ,-0.1,17, llegtype);
    }
    for (var i = 0; i < 4; i++){ //left pant
        for (var j = 0; j<9; j ++) {
            for (var k = 0; k <4; k++) {
                MyCube( -0.1- 0.1*i ,0.3 + 0.1*j ,-0.1*k,17, llegtype);
            }
        }
    }



    //right leg type = 3.0
    var rlegtype = 3.0;
    for (var i = 0; i < 4; i++){ //left shoe
        for (var j = 0; j<4; j ++){
            for (var k = 0 ; k <2; k ++){
                MyCube( 0.1*i ,0.1*k ,-0.1 *j,18, rlegtype);
            }
        }
        MyCube( 0.1*i ,0.2,-0.2,18, rlegtype);
        MyCube( 0.1*i ,0.2,-0.3,18, rlegtype);
        MyCube( 0.1*i ,0.2 ,0.0,17, rlegtype);
        MyCube( 0.1*i ,0.2 ,-0.1,17, rlegtype);
    }
    for (var i = 0; i < 4; i++){ //left pant
        for (var j = 0; j<9; j ++) {
            for (var k = 0; k <4; k++) {
                MyCube( 0.1*i ,0.3 + 0.1*j ,-0.1*k,17, rlegtype);
            }
        }
    }


    //BODY = type 6.0
    var bodytype = 6.0;
    for (var i = 0; i < 3; i++) { //shirt color
        MyCube( -0.4 ,1.6 + 0.1*i ,0.0,15, bodytype);
        MyCube( -0.3 ,1.7 + 0.1*i ,0.0,15, bodytype);
        MyCube( 0.3 ,1.2 + 0.1*i ,0.0,15, bodytype);
        MyCube( 0.3 ,1.5 + 0.1*i ,0.0,15, bodytype);
        MyCube( 0.3 ,1.7 + 0.1*i ,0.0,15, bodytype);
        MyCube( -0.4 + 0.1*i ,1.4 ,0.0,15, bodytype);
        MyCube( -0.1  ,1.5 + 0.1*i,0.0,15, bodytype);
        MyCube( 0  ,1.8 + 0.1*i,0.0,15, bodytype);
        MyCube( -0.3  ,1.4 + 0.1*i,-0.3,15, bodytype);
        MyCube( -0.2  ,1.4 + 0.1*i,-0.3,15, bodytype);
        MyCube( -0.2  ,1.7 + 0.1*i,-0.3,15, bodytype);
        MyCube( 0.1  ,1.4 + 0.1*i,-0.3,15, bodytype);
        MyCube( 0.1  ,1.7 + 0.1*i,-0.3,15, bodytype);
        MyCube( -0.1  ,1.2 + 0.1*i,-0.3,15, bodytype);
    }

    MyCube( 0.2  ,1.3 ,0.0,14, bodytype);

    MyCube( -0.4 ,1.9 ,0.0,15, bodytype);
    MyCube( 0.2 ,1.9 ,0.0,15, bodytype);
    //shirt back
    MyCube( -0.1 ,1.3 ,-0.3,14, bodytype);
    MyCube( 0.1 ,1.3 ,-0.3,15, bodytype);
    MyCube( 0.1 ,1.4 ,-0.3,15, bodytype);
    //neck
    MyCube( -0.1 ,2.2,0.0,12, bodytype);
    MyCube( 0.0 ,2.2,0.0,12, bodytype);
    MyCube( -0.1 ,2.3,0.0,11, bodytype);
    for (var i = 0; i < 4; i++) {
        MyCube( -0.2 +0.1*i ,2.3,0.0,12, bodytype);
    }

    for (var i = 0; i < 8; i++) { // waist
        for (var j = 0; j < 2; j++) {
            for (var k = 0; k < 4; k++) {
                MyCube( -0.4 + 0.1*i ,1.2 + 0.1*j ,-0.1*k,17, bodytype);
            }
        }
    }
    for (var i = 0; i < 8; i++) { // shirt-body
        for (var j = 0; j < 10; j++) {
            for (var k = 0; k < 4; k++) {
                MyCube( -0.4 + 0.1*i ,1.4 + 0.1*j ,-0.1*k,14, bodytype);
            }
        }
    }


    //left arm type = 4.0
    var larmtype =4.0;

    for (var k = 0; k < 2; k++) {
        MyCube(-0.6 , 1.2 + 0.1 * k, 0.0, 12, larmtype);
        MyCube(-0.5 , 1.5 + 0.1 * k, 0.0, 12, larmtype);
        MyCube(-0.5 , 1.6 + 0.1 * k, 0.0, 12, larmtype);
        MyCube(-0.7 , 1.7 + 0.1 * k, 0.0, 12, larmtype);

        MyCube(-0.6 , 1.2 + 0.1 * k, -0.3, 12, larmtype);
        MyCube(-0.5 , 1.5 + 0.1 * k, -0.3, 12, larmtype);
        MyCube(-0.5 , 1.6 + 0.1 * k, -0.3, 12, larmtype);
        MyCube(-0.7 , 1.7 + 0.1 * k, -0.3, 12, larmtype);

        MyCube(-0.8 + 0.1 * k, 2.3, 0, 15, larmtype);
        MyCube(-0.5, 2.0  + 0.1 * k, 0, 15, larmtype);
    }
    MyCube(-0.8 , 1.2, 0, 12, larmtype);


    for (var i = 0; i < 4; i++) { // leftarm
        for (var j = 0; j < 4; j++) {
            for (var k = 0; k < 4; k++) {
                MyCube( -0.8 + 0.1*i ,1.2 + 0.1*j ,-0.1*k,11, larmtype);
                MyCube( -0.8 + 0.1*i ,1.6 + 0.1*j ,-0.1*k,11, larmtype);
                MyCube( -0.8 + 0.1*i ,2.0 + 0.1*j ,-0.1*k,14, larmtype);

            }
        }
    }



    //right arm type = 5.0
    var rarmtype =5.0;

    for (var k = 0; k < 2; k++) {
        MyCube(0.5 , 1.2 + 0.1 * k, 0.0, 12, rarmtype);
        MyCube(0.4 , 1.5 + 0.1 * k, 0.0, 12, rarmtype);
        MyCube(0.4 , 1.6 + 0.1 * k, 0.0, 12, rarmtype);
        MyCube(0.6 , 1.7 + 0.1 * k, 0.0, 12, rarmtype);

        MyCube(0.6 -0.1 , 1.2 + 0.1 * k, -0.3, 12, rarmtype);
        MyCube(0.5 -0.1 , 1.5 + 0.1 * k, -0.3, 12, rarmtype);
        MyCube(0.5 -0.1 , 1.6 + 0.1 * k, -0.3, 12, rarmtype);
        MyCube(0.7  -0.1, 1.7 + 0.1 * k, -0.3, 12, rarmtype);

        MyCube(0.8 -0.1 - 0.1 * k, 2.3, 0, 15, rarmtype);
        MyCube(0.5 -0.1, 2.0  + 0.1 * k, 0, 15, rarmtype);
    }
    MyCube(0.8 -0.1 , 1.2, 0, 12, rarmtype);


    for (var i = 0; i < 4; i++) { // leftarm
        for (var j = 0; j < 4; j++) {
            for (var k = 0; k < 4; k++) {
                MyCube( 0.8 -0.1 - 0.1*i ,1.2 + 0.1*j ,-0.1*k,11, rarmtype);
                MyCube( 0.8 -0.1 - 0.1*i ,1.6 + 0.1*j ,-0.1*k,11, rarmtype);
                MyCube( 0.8  -0.1 -0.1*i ,2.0 + 0.1*j ,-0.1*k,14, rarmtype);

            }
        }
    }



    // head type = 7.0
    var headtype = 7.0;
    MyCube( -0.4 ,2.9 ,0.2 ,10, headtype);
    MyCube( 0.3,2.9,0.2 ,10, headtype);

    // face type = head type
    MyCube( -0.3, 2.7,0.2 ,16, headtype);
    MyCube( 0.2, 2.7,0.2 ,16, headtype);

    MyCube( -0.2, 2.7,0.2 ,17, headtype); //16
    MyCube( 0.1, 2.7,0.2 ,17, headtype); //16

    MyCube( -0.4,2.5 ,0.2 ,12, headtype);
    MyCube( 0.3,2.5 ,0.2 ,12, headtype);

    for (var i = 0; i < 8; i++) { //ears
        for (var j = 0; j < 3; j++) {
            for (var k = 0; k < 2; k++) {
                MyCube( -0.4 + 0.1*i ,2.5 + 0.1*j ,0.1-0.1*k,11, headtype);

            }
        }
    }

    for (var k = 0; k < 4; k++) {
        MyCube( -0.2 + 0.1*k ,2.4 ,0.2 ,11, headtype);
    }

    for (var k = 0; k < 4; k++) {
        MyCube( -0.2 + 0.1 *k, 2.5,0.2 ,19, headtype);
    }
    for (var k = 0; k < 2; k++) {
        MyCube( -0.1 + 0.1 *k, 2.6,0.2 ,13, headtype);
    }

    for (var j = 0; j < 8; j++) {
        for (var k = 0; k < 8; k++) {
            MyCube( -0.4 + 0.1*j ,2.4 ,0.2 - 0.1*k ,12, headtype);

        }
    }
    for (var j = 0; j < 8; j++) {
        for (var k = 0; k < 6; k++) {
            MyCube( -0.4 + 0.1*j ,2.4 + 0.1*k ,0.2 ,11, headtype);

        }
    }

    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            for (var k = 0; k < 8; k++) {
                MyCube( -0.4 + 0.1*i ,2.4 + 0.1*j ,0.2-0.1*k,10, headtype);

            }
        }
    }



    // draw torch
    for (var i = 0; i  < 3; i++) {
        var t = -1.0;
        for (var k = 0; k < 8; k++) {
            MyCube(-0.1 +3.0*i, 0.0 + 0.1 * k, 0.1, 24, t);
            MyCube(0.0 +3.0*i, 0.0 + 0.1 * k, 0.0, 24, t);
            MyCube(-0.1 +3.0*i, 0.0 + 0.1 * k, 0.0, 25, t);
            MyCube(0.0 +3.0*i, 0.0 + 0.1 * k, 0.1, 25, t);
        }
        MyCube(-0.1 +3.0*i, 0.8, 0.1, 26, t);
        MyCube(0.0 +3.0*i, 0.8, 0.0, 23, t);
        MyCube(-0.1 +3.0*i, 0.8, 0.0, 23, t);
        MyCube(0.0 +3.0*i, 0.8, 0.1, 26, t);

        MyCube(-0.1 +3.0*i, 0.9, 0.1, 21, t);
        MyCube(0.0 +3.0*i, 0.9, 0.0, 22, t);
        MyCube(-0.1 +3.0*i, 0.9, 0.0, 21, t);
        MyCube(0.0 +3.0*i, 0.9, 0.1, 22, t);
    }

    for (var i = 0; i  < 2; i++) {
        var t = -2.0;
        for (var k = 0; k < 8; k++) {
            MyCube(-0.1 +3.0*i, 0.0 + 0.1 * k, 0.1, 24, t);
            MyCube(0.0 +3.0*i, 0.0 + 0.1 * k, 0.0, 24, t);
            MyCube(-0.1 +3.0*i, 0.0 + 0.1 * k, 0.0, 25, t);
            MyCube(0.0 +3.0*i, 0.0 + 0.1 * k, 0.1, 25, t);
        }
        MyCube(-0.1 +3.0*i, 0.8, 0.1, 26, t);
        MyCube(0.0 +3.0*i, 0.8, 0.0, 23, t);
        MyCube(-0.1 +3.0*i, 0.8, 0.0, 23, t);
        MyCube(0.0 +3.0*i, 0.8, 0.1, 26, t);

        MyCube(-0.1 +3.0*i, 0.9, 0.1, 21, t);
        MyCube(0.0 +3.0*i, 0.9, 0.0, 22, t);
        MyCube(-0.1 +3.0*i, 0.9, 0.0, 21, t);
        MyCube(0.0 +3.0*i, 0.9, 0.1, 22, t);
    }

    for (var i = 0; i  < 2; i++) {
        var t = -3.0;
        for (var k = 0; k < 8; k++) {
            MyCube(-0.1 +3.0*i, 0.0 + 0.1 * k, 0.1, 24, t);
            MyCube(0.0 +3.0*i, 0.0 + 0.1 * k, 0.0, 24, t);
            MyCube(-0.1 +3.0*i, 0.0 + 0.1 * k, 0.0, 25, t);
            MyCube(0.0 +3.0*i, 0.0 + 0.1 * k, 0.1, 25, t);
        }
        MyCube(-0.1 +3.0*i, 0.8, 0.1, 26, t);
        MyCube(0.0 +3.0*i, 0.8, 0.0, 23, t);
        MyCube(-0.1 +3.0*i, 0.8, 0.0, 23, t);
        MyCube(0.0 +3.0*i, 0.8, 0.1, 26, t);

        MyCube(-0.1 +3.0*i, 0.9, 0.1, 21, t);
        MyCube(0.0 +3.0*i, 0.9, 0.0, 22, t);
        MyCube(-0.1 +3.0*i, 0.9, 0.0, 21, t);
        MyCube(0.0 +3.0*i, 0.9, 0.1, 22, t);
    }



    for (var t = 0; t<attrIndices.length ; t+=3){
        myTriangle(attrIndices[t],attrIndices[t+1],attrIndices[t+2], attrTypes[t]);
    }

    // floor
    myWall(vec4(-6.0, 0.0, 0.0, 1.0),vec4(6.0, 0.0, 0.0, 1.0),vec4(6.0, 0.0, -1.0, 1.0),vec4(-6.0, 0.0, -1.0, 1.0),20,1, 0.0);
    myWall(vec4(-6.0, 0.0, -2.0, 1.0),vec4(6.0, 0.0, -2.0, 1.0),vec4(6.0, 0.0, -3.0, 1.0),vec4(-6.0, 0.0, -3.0, 1.0),20,1, 0.0);
    myWall(vec4(-6.0, 0.0, -4.0, 1.0),vec4(6.0, 0.0, -4.0, 1.0),vec4(6.0, 0.0, -5.0, 1.0),vec4(-6.0, 0.0, -5.0, 1.0),20,1, 0.0);
    myWall(vec4(-6.0, 0.0, -6.0, 1.0),vec4(6.0, 0.0, -6.0, 1.0),vec4(6.0, 0.0, -7.0, 1.0),vec4(-6.0, 0.0, -7.0, 1.0),20,1, 0.0);
    myWall(vec4(-6.01, -0.01, 1.0, 1.0),vec4(6.01, -0.01, 1.0, 1.0),vec4(6.01, -0.01, -8.01, 1.0),vec4(-6.01, -0.01, -8.01, 1.0),9,1, 0.0);
    //for (var i = 0; i < 4*; i++){
        //myWall(vec4(-12.0, 0.0 , 1.0, 1.0),vec4(12.0, 0.0, 1.0, 1.0),vec4(12.0, 0.0, -18.0, 1.0),vec4(-12.0, 0.0, -18.0, 1.0),20,1, 0.0);
    //}

    // front wall
    //var i = 0.0;
    //for (var i = 0; i < 4*3; i++){
    //    myWall(vec4(-6.0, 0.0+i*0.5, -18.0, 1.0),vec4(6.0, 0.0+i*0.5, -18.0, 1.0),vec4(6.0, i*0.5+ 0.5, -18.0, 1.0),vec4(-6.0, i*0.5+ 0.5, -18.0, 1.0),20,0, 0.0);
    //}
    myWall(vec4(-6.0, 0.0, -8.0, 1.0),vec4(6.0, 0.0, -8.0, 1.0),vec4(6.0, 1.0, -8.0, 1.0),vec4(-6.0, 1.0, -8.0, 1.0),20,0, 0.0);
    myWall(vec4(-6.0, 2.0, -8.0, 1.0),vec4(6.0, 2.0, -8.0, 1.0),vec4(6.0, 3.0, -8.0, 1.0),vec4(-6.0, 3.0, -8.0, 1.0),20,0, 0.0);
    myWall(vec4(-6.0, 4.0, -8.0, 1.0),vec4(6.0, 4.0, -8.0, 1.0),vec4(6.0, 5.0, -8.0, 1.0),vec4(-6.0, 5.0, -8.0, 1.0),20,0, 0.0);
    myWall(vec4(-6.01, -0.01, -8.01, 1.0),vec4(6.01, -0.01, -8.01, 1.0),vec4(6.01, 6.1, -8.01, 1.0),vec4(-6.01, 6.1, -8.01, 1.0),8,0, 0.0);

    // ceiling
    myWall(vec4(-6.0, 6.0, 0.0, 1.0),vec4(6.0, 6.0, 0.0, 1.0),vec4(6.0, 6.0, -1.0, 1.0),vec4(-6.0, 6.0, -1.0, 1.0),20,1, 0.0);
    myWall(vec4(-6.0, 6.0, -2.0, 1.0),vec4(6.0, 6.0, -2.0, 1.0),vec4(6.0, 6.0, -3.0, 1.0),vec4(-6.0, 6.0, -3.0, 1.0),20,1, 0.0);
    myWall(vec4(-6.0, 6.0, -4.0, 1.0),vec4(6.0, 6.0, -4.0, 1.0),vec4(6.0, 6.0, -5.0, 1.0),vec4(-6.0, 6.0, -5.0, 1.0),20,1, 0.0);
    myWall(vec4(-6.0, 6.0, -6.0, 1.0),vec4(6.0, 6.0, -6.0, 1.0),vec4(6.0, 6.0, -7.0, 1.0),vec4(-6.0, 6.0, -7.0, 1.0),20,1, 0.0);
    myWall(vec4(-6.01, 6.01, 1.0, 1.0),vec4(6.01, 6.01, 1.0, 1.0),vec4(6.01, 6.01, -8.1, 1.0),vec4(-6.01, 6.01, -8.1, 1.0),9,1, 0.0);

    // left wall
    //for (var i = 0; i < 4*3; i++){
    //    myWall(vec4(-6.0, 0.0+i*0.5, 1.0, 1.0),vec4(-6.0, 0.0+i*0.5, -18.0, 1.0),vec4(-6.0, i*0.5+ 0.5, -18.0, 1.0),vec4(-6.0, i*0.5+ 0.5, 1.0, 1.0),20,0, 0.0);
    //}
    myWall(vec4(-6.0, 0.0, 1.0, 1.0),vec4(-6.0, 0.0, -8.0, 1.0),vec4(-6.0, 1.0, -8.0, 1.0),vec4(-6.0, 1.0, 1.0, 1.0),20,0, 0.0);
    myWall(vec4(-6.0, 2.0, 1.0, 1.0),vec4(-6.0, 2.0, -8.0, 1.0),vec4(-6.0, 3.0, -8.0, 1.0),vec4(-6.0, 3.0, 1.0, 1.0),20,0, 0.0);
    myWall(vec4(-6.0, 4.0, 1.0, 1.0),vec4(-6.0, 4.0, -8.0, 1.0),vec4(-6.0, 5.0, -8.0, 1.0),vec4(-6.0, 5.0, 1.0, 1.0),20,0, 0.0);
    myWall(vec4(-6.01, -0.01, 1.0, 1.0),vec4(-6.01, -0.01, -8.01, 1.0),vec4(-6.01, 6.01, -8.01, 1.0),vec4(-6.01, 6.01, 1.0, 1.0),9,0, 0.0);

    // right wall
    //for (var i = 0; i < 4*3; i++){
    //    myWall(vec4(6.0, 0.0+i*0.5, 1.0, 1.0),vec4(6.0, 0.0+i*0.5, -18.0, 1.0),vec4(6.0, i*0.5+ 0.5, -18.0, 1.0),vec4(6.0, i*0.5+ 0.5, 1.0, 1.0),20,1, 0.0);
    //}
    myWall(vec4(6.0, 0.0, 1.0, 1.0), vec4(6.0, 0.0, -8.0, 1.0), vec4(6.0, 1.0, -8.0, 1.0), vec4(6.0, 1.0, 1.0, 1.0), 20, 1, 0.0);
    myWall(vec4(6.0, 2.0, 1.0, 1.0), vec4(6.0, 2.0, -8.0, 1.0), vec4(6.0, 3.0, -8.0, 1.0), vec4(6.0, 3.0, 1.0, 1.0), 20, 1, 0.0);
    myWall(vec4(6.0, 4.0, 1.0, 1.0), vec4(6.0, 4.0, -8.0, 1.0), vec4(6.0, 5.0, -8.0, 1.0), vec4(6.0, 5.0, 1.0, 1.0), 20, 1, 0.0);
    myWall(vec4(6.01, -0.01, 1.0, 1.0), vec4(6.01, -0.01, -8.01, 1.0), vec4(6.01, 6.01, -8.01, 1.0), vec4(6.01, 6.01, 1.0, 1.0), 9, 1, 0.0);



    // attribute buffers

    // element array buffer (indices for vertices and colors)
    //     each is an 8-bit unsigned integer (0, 1, ..., 255)
    //     each is an index for the attributes
    var iBuffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, iBuffer);
    webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(attrIndices), webgl.STATIC_DRAW);

    // color array attribute buffer  (indexed by iBuffer)
    //     4 floats, corresponding to rgba

    var cBuffer = webgl.createBuffer();
    webgl.bindBuffer( webgl.ARRAY_BUFFER, cBuffer );
    webgl.bufferData( webgl.ARRAY_BUFFER, flatten(vertexColors), webgl.STATIC_DRAW );

    var vColorLOC = webgl.getAttribLocation( program, "vColor" );
    webgl.vertexAttribPointer( vColorLOC, 4, webgl.FLOAT, false, 0, 0 );
    webgl.enableVertexAttribArray( vColorLOC );

    // vertex array attribute buffer (indexed by iBuffer)
    //      4 floats corresponding to homogeneous vertex coordinates

    var vBuffer = webgl.createBuffer();
    webgl.bindBuffer( webgl.ARRAY_BUFFER, vBuffer );
    webgl.bufferData( webgl.ARRAY_BUFFER, flatten(positionsArray), webgl.STATIC_DRAW );

    var vPositionLOC = webgl.getAttribLocation( program, "vPosition" );
    webgl.vertexAttribPointer( vPositionLOC, 4, webgl.FLOAT, false, 0, 0 );
    webgl.enableVertexAttribArray( vPositionLOC );

    var normalsBuffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, normalsBuffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, flatten(normalsArray), webgl.STATIC_DRAW);

    var vNormalLOC = webgl.getAttribLocation(program, "vNormal");
    webgl.vertexAttribPointer(vNormalLOC, 4, webgl.FLOAT, false, 0, 0);
    webgl.enableVertexAttribArray(vNormalLOC);

    var tBuffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, tBuffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, flatten(typesArray), webgl.STATIC_DRAW);

    // associate JavaScript vType with vertex shader attribute "vType"
    // as a one dimensional vector where each component is a float
    var vType = webgl.getAttribLocation(program, "vType");
    webgl.vertexAttribPointer(vType, 1, webgl.FLOAT, false, 0, 0);
    webgl.enableVertexAttribArray(vType);

    const textureCoordBuffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, textureCoordBuffer);

    /*
    const textureCoordinates = [
        // Front
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Back
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Top
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Bottom
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Right
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Left
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
    ];

    webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
        webgl.STATIC_DRAW);

     */

    render();
};

// **************

// recursive render function -- recursive call is synchronized
// with the screen refresh
function render()
{
    // clear the color buffer and the depth buffer
    webgl.clear( webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);

    // compute angle of rotation and pass along to vertex shader
    /*
    if (triangleOneON) {
        theta = IncrementClamp(theta, deltatheta, 2.0 * Math.PI);
    }
    if (triangleTwoON){
        beta = IncrementClamp(beta, gama, 2.0 * Math.PI);
    }

     */
    light = 0.0;
    if (lightON){
        light = 1.0;
    }
    if (rightB && xx < 4.0) {
        xx += 0.1;
        dir = 0.5*Math.PI;
    }
    if (leftB && xx > -4.0) {
        xx -= 0.1;
        dir = 1.5*Math.PI;
    }
    if (frontB && zz < 3.0) {
        zz += 0.1;
        dir = 0.0*Math.PI;
    }
    if (backB && zz > -6.0) {
        zz -= 0.1;
        dir = 1.0*Math.PI;
    }
    if (rightB||leftB||frontB||backB){
        alpha = IncrementClamp(alpha, 0.1, 2.0*Math.PI);
    }
    else alpha = 0.0;


    webgl.uniform1f(lightLoc,light);
    //webgl.uniform1f(thetaLoc,theta);
    //webgl.uniform1f(betaLoc, beta);
    //webgl.uniform1f(gamaLoc, gama);
    //webgl.uniform1f(lenLoc, len);
    webgl.uniform1f(xxLoc, xx);
    webgl.uniform1f(zzLoc, zz);
    webgl.uniform1f(walkLoc, walk);
    webgl.uniform1f(alphaLoc, alpha);
    webgl.uniform1f(dirLoc, dir);
    // compute modelView and projection matrices
    // and them pass along to vertex shader
    modelViewMatrix =  lookAt(eye,at,up);
    projectionMatrix = perspective(fovy, aspect, near, far);
    webgl.uniformMatrix4fv( modelViewMatrixLoc, false,
        flatten(modelViewMatrix) );
    webgl.uniformMatrix4fv( projectionMatrixLoc, false,
        flatten(projectionMatrix) );


    // drawElements draws the "elements" (based on indices)
    webgl.drawArrays( webgl.TRIANGLES,0, positionsArray.length);
    //webgl.drawElements( webgl.TRIANGLES, attrIndices.length,webgl.UNSIGNED_SHORT, 0 );

    requestAnimFrame( render );
}

// Utility function to increment a variable and clamp
function IncrementClamp(x, dx, upper){
    var newX = x+dx;
    if (newX > upper){
        return newX-upper;
    }
    return newX;
}

function MyCube2(p1, p2, p3, color, type){ // draw a cube in 3d space
    vertexPositions.push(vec4(p1, p2, p3, 1.0)); // E
    vertexPositions.push(vec4(p1+0.1/2, p2, p3, 1.0)); // F +1
    vertexPositions.push(vec4(p1, p2+0.1/2, p3, 1.0)); // H +2
    vertexPositions.push(vec4(p1+0.1/2, p2+0.1/2, p3, 1.0)); // G +3
    vertexPositions.push(vec4(p1, p2, p3+0./2, 1.0)); // A +4
    vertexPositions.push(vec4(p1+0.1/2, p2, p3+0.1/2, 1.0)); // B +5
    vertexPositions.push(vec4(p1, p2+0.1/2, p3+0.1/2, 1.0)); // C +6
    vertexPositions.push(vec4(p1+0.1/2, p2+0.1/2, p3+0.1/2, 1.0)); // D +7

    for (var i = 0; i<36; i++){
        vertexColors.push(colorPalette[color]);
    }
    for (var k = 0; k<36; k++){
        attrTypes.push(type);
    }
    var init = vertexPositions.length-8;

    // EFGH = GFH EHF
    attrIndices.push(init+3);//G
    attrIndices.push(init+1);//F
    attrIndices.push(init+2);//H

    attrIndices.push(init);//E
    attrIndices.push(init+2);//H
    attrIndices.push(init+1);//F


    //GFBD = BFD GDF
    attrIndices.push(init+5);//B
    attrIndices.push(init+1);//F
    attrIndices.push(init+7);//D

    attrIndices.push(init+3);//G
    attrIndices.push(init+7);//D
    attrIndices.push(init+1);//F
    //CDGH = DGC HCG
    attrIndices.push(init+7);//D
    attrIndices.push(init+3);//G
    attrIndices.push(init+6);//C

    attrIndices.push(init+2);//H
    attrIndices.push(init+6);//C
    attrIndices.push(init+3);//G
    //CHEA = CHA EAH
    attrIndices.push(init+6);//C
    attrIndices.push(init+2);//H
    attrIndices.push(init+4);//A

    attrIndices.push(init);//E
    attrIndices.push(init+4);//A
    attrIndices.push(init+2);//H

    //CDAB = BDA CAD
    attrIndices.push(init+5);//B
    attrIndices.push(init+7);//D
    attrIndices.push(init+4);//A

    attrIndices.push(init+6);//C
    attrIndices.push(init+4);//A
    attrIndices.push(init+7);//D
    //ABFE = FBE AEB
    attrIndices.push(init+1);//F
    attrIndices.push(init+5);//B
    attrIndices.push(init);//E

    attrIndices.push(init+4);//A
    attrIndices.push(init);//E
    attrIndices.push(init+5);//B


}

function MyCube(p1, p2, p3, color, type){ // draw a cube in 3d space
    vertexPositions.push(vec4(p1, p2, p3, 1.0)); // E
    vertexPositions.push(vec4(p1+0.1, p2, p3, 1.0)); // F +1
    vertexPositions.push(vec4(p1, p2+0.1, p3, 1.0)); // H +2
    vertexPositions.push(vec4(p1+0.1, p2+0.1, p3, 1.0)); // G +3
    vertexPositions.push(vec4(p1, p2, p3+0.1, 1.0)); // A +4
    vertexPositions.push(vec4(p1+0.1, p2, p3+0.1, 1.0)); // B +5
    vertexPositions.push(vec4(p1, p2+0.1, p3+0.1, 1.0)); // C +6
    vertexPositions.push(vec4(p1+0.1, p2+0.1, p3+0.1, 1.0)); // D +7

    for (var i = 0; i<36; i++){
        vertexColors.push(colorPalette[color]);
    }
    for (var k = 0; k<36; k++){
        attrTypes.push(type);
    }
    var init = vertexPositions.length-8;

    // EFGH = GFH EHF
    attrIndices.push(init+3);//G
    attrIndices.push(init+1);//F
    attrIndices.push(init+2);//H

    attrIndices.push(init);//E
    attrIndices.push(init+2);//H
    attrIndices.push(init+1);//F


    //GFBD = BFD GDF
    attrIndices.push(init+5);//B
    attrIndices.push(init+1);//F
    attrIndices.push(init+7);//D

    attrIndices.push(init+3);//G
    attrIndices.push(init+7);//D
    attrIndices.push(init+1);//F
    //CDGH = DGC HCG
    attrIndices.push(init+7);//D
    attrIndices.push(init+3);//G
    attrIndices.push(init+6);//C

    attrIndices.push(init+2);//H
    attrIndices.push(init+6);//C
    attrIndices.push(init+3);//G
    //CHEA = CHA EAH
    attrIndices.push(init+6);//C
    attrIndices.push(init+2);//H
    attrIndices.push(init+4);//A

    attrIndices.push(init);//E
    attrIndices.push(init+4);//A
    attrIndices.push(init+2);//H

    //CDAB = BDA CAD
    attrIndices.push(init+5);//B
    attrIndices.push(init+7);//D
    attrIndices.push(init+4);//A

    attrIndices.push(init+6);//C
    attrIndices.push(init+4);//A
    attrIndices.push(init+7);//D
    //ABFE = FBE AEB
    attrIndices.push(init+1);//F
    attrIndices.push(init+5);//B
    attrIndices.push(init);//E

    attrIndices.push(init+4);//A
    attrIndices.push(init);//E
    attrIndices.push(init+5);//B


}
function myTriangle(iA, iB, iC, type){
    var A = vertexPositions[iA];
    var B = vertexPositions[iB];
    var C = vertexPositions[iC];

    positionsArray.push(A);
    positionsArray.push(B);
    positionsArray.push(C);

    var t1 = subtract(B,A);
    var t2 = subtract(C,A);
    var normal = vec4(normalize(cross(t1,t2)));

    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);

    typesArray.push(type);
    typesArray.push(type);
    typesArray.push(type);
}

function myTriangle2(A, B, C, color, type){
    positionsArray.push(A);
    positionsArray.push(B);
    positionsArray.push(C);

    for (var i = 0; i<3; i++){
        vertexColors.push(colorPalette[color]);
    }

    var t1 = subtract(B,A);
    var t2 = subtract(C,A);
    var normal = vec4(normalize(cross(t2,t1)));

    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);

    typesArray.push(type);
    typesArray.push(type);
    typesArray.push(type);
}

function myWall(A, B, C, D, color, dir, type){
    if (dir > 0.5){
        myTriangle2(A, C, B, color, type);
        myTriangle2(A, D, C, color, type);
    }
    else{
        myTriangle2(A, B, C, color, type);
        myTriangle2(A, C, D, color, type);
    }
}