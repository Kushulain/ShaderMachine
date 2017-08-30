import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { render } from 'react-dom';
import brace from 'brace';
import AceEditor from 'react-ace';
import windowSize from 'react-window-size';

import 'brace/mode/glsl';
import 'brace/theme/tomorrow_night';

var ReactTHREE = require('react-three');
var THREE = require('three');


var vertexShader = `
void main()	{
  gl_Position = vec4( position, 1.0 );
}`;

var fragmentShader = `uniform vec2 resolution;
uniform float time;
uniform float timeSinceLastSpaceBar;
uniform float deltaTime;
uniform sampler2D lastImage; //texture2D( lastImage, gl_FragCoord.xy )

void main() {
  vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.yy;

  gl_FragColor= texture2D( lastImage, gl_FragCoord.xy );
  gl_FragColor+=vec4(  0.5*length(p) + sin(2.*time+length(p)*2.2)*0.3,
                      0.5*length(p) + sin(3.*time+length(p)*3.1)*0.3 ,
                      0.5*length(p) + sin(4.*time+length(p)*4.9)*0.3 ,
                      1.);
}
`;

var fragmentBlitShader = `			varying vec2 vUv;
			uniform sampler2D tDiffuse;
			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );
			}
`;
var rtTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight * 0.9, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );

var shaderUniforms = {
  lastImage: { value: rtTexture.texture },
  time: { type: "f", value: 0.0 },
  timeSinceLastSpaceBar: { type: "f", value: Infinity },
  deltaTime: { type: "f", value: 0.015 },
  resolution: { type: "v2", value: new THREE.Vector2(500, 500) },
  mousePosition: { type: "v2", value: new THREE.Vector2(0, 0) }
};

var shaderMaterial = new THREE.ShaderMaterial({
  uniforms: shaderUniforms,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  depthWrite: false
});

var materialBlitScreen = new THREE.ShaderMaterial( {
	uniforms: { tDiffuse: { value: rtTexture.texture } },
  vertexShader: vertexShader,
	fragmentShader: fragmentBlitShader,
	depthWrite: false
} );

function onChange(newValue) {
  fragmentShader = newValue;

    var newShader = new THREE.ShaderMaterial({
      uniforms: shaderUniforms,
      vertexShader: vertexShader,
      fragmentShader: newValue
    });

    // console.log(newShader.program);
    // console.log(shaderMaterial.program);
		// newShader.addEventListener('shaderCompileError', function(err) {
		// 	console.log('================================= === = = = = =Shader failed to compile');
		// });
		// newShader.addEventListener('programLinkError', function(err) {
		// 	console.log('==================================   = = = = = = = Program failed to link');
		// });
    //console.log(THREE.WebGLProgram);
      shaderMaterial = newShader;

}

const { Renderer, Scene, Mesh, Object3d, PerspectiveCamera } = ReactTHREE;

const element = <h1>Hello, world!</h1>;
var colorA = "#F00";
var colorB = "#550";
var editorBackgroundCol = "rgba(15,15,15,0.0)";
var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
var clockTime = new THREE.Clock();
var clockSpaceBar = new THREE.Clock();
clockSpaceBar.elapsedTime = Infinity;
var isSpaceBarPressed = false;
var mouse = new THREE.Vector2();
var test = false;

function CustomRenderer(renderer, scene, cam)
{
  if (!test)
  {
    console.log(scene);
    console.log(cam);
    console.log(rtTexture);
    test = true;
  }
  renderer.render(scene,cam,rtTexture,false);
  renderer.clear();
  renderer.render(scene,cam);
}

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 32) {
      isSpaceBarPressed = true;
    }
};

document.addEventListener("keyup", onDocumentKeyUp, false);
function onDocumentKeyUp(event) {
    var keyCode = event.which;
    if (keyCode == 32) {
      isSpaceBarPressed = false;
    }
};

document.addEventListener( 'mousemove', onDocumentMouseMove, false );
function onDocumentMouseMove( event ) {
  event.preventDefault();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

class Wavey extends React.Component {
  constructor(props) {
    super(props)

    shaderUniforms.resolution.value.x = props.width;
    shaderUniforms.resolution.value.y = props.height;

  }
  componentWillReceiveProps(nextProps) {
    shaderUniforms.time.value = nextProps.time
    shaderUniforms.deltaTime.value = nextProps.deltaTime
    shaderUniforms.timeSinceLastSpaceBar.value = nextProps.timeSinceLastSpaceBar
    shaderUniforms.mousePosition.value.x = mouse.x
    shaderUniforms.mousePosition.value.y = mouse.y
    //shaderUniforms.lastImage = rtTexture.texture


    if(nextProps.width !== this.props.width)
      shaderUniforms.resolution.value.x = nextProps.width;

    if(nextProps.height !== this.props.height)
      shaderUniforms.resolution.value.y = nextProps.height;
  }
  render() {
    return <Mesh geometry={geometry} material={shaderMaterial} />
  }
}

class ExampleScene extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      time: 1.0,
      deltaTime: 0.016,
      timeSinceLastSpaceBar: Infinity,
      width: window.innerWidth,
      height: window.innerHeight  * 0.9,
    };

    this.animate = () => {
      var delta = clockTime.getDelta()
      if (isSpaceBarPressed) {
        clockSpaceBar.start()
      }

      var _timeSinceLastSpaceBar = Infinity
      if (clockSpaceBar.running) {
        _timeSinceLastSpaceBar = clockSpaceBar.getElapsedTime()
      }


      this.setState({
        timeSinceLastSpaceBar: _timeSinceLastSpaceBar,
        time: (this.state.time + delta) % 500.0,
          deltaTime: delta,
          width: window.innerWidth,
          height: window.innerHeight * 0.9
      })

      this.frameId = requestAnimationFrame(this.animate)
    }
  }

  // animate() {
  //   this.setState({
  //       time: this.state.time + clockTime.getDelta(),
  //       width: window.innerWidth,
  //       height: window.innerHeight * 0.9
  //   })
  //
  //   this.frameId = requestAnimationFrame(this.animate)
  // }

  componentDidMount() {
    this.animate();
    window.addEventListener( 'resize', this.onWindowResize.bind(this), false )
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.frameId)
    window.removeEventListener('resize', this.onWindowResize)
  }

  onWindowResize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight * 0.9
    })
  }

  render() {
    var cameraprops = {position:{z: 1}};

    return <Renderer customRender={CustomRenderer} width={this.state.width} height={this.state.height} pixelRatio={window.devicePixelRatio} >
        <Scene width={this.state.width} height={this.state.height} camera="maincamera">
            <PerspectiveCamera name="maincamera" {...cameraprops} />
            <Wavey timeSinceLastSpaceBar={this.state.timeSinceLastSpaceBar} time={this.state.time} deltaTime={this.state.deltaTime} width={this.state.width} height={this.state.height} />
        </Scene>
    </Renderer>
  }
}

function shaderstart() { // eslint-disable-line no-unused-vars
  var renderelement = document.getElementById("three-box");
  console.log("new shaderstart");
  console.log(ReactTHREE.render(<ExampleScene/>, renderelement));
  //ReactTHREE.render(<ExampleScene/>, renderelement, rtTexture:texture, true);
}


class ShaderMachineEditor extends Component
{
  constructor(props) {
    super(props);
    //this.state = {width: 100, height:100};
    // var editor = document.getElementById("editor");;
    // editor.setValue("the new text here");
    //this.props.text = this.props.text;
    //  console.log("lalalal", props.width);
    //  console.log("boh", this.props.shadercode);
  }

  componentDidMount() {
    window.addEventListener( 'resize', this.onWindowResize.bind(this), false )
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize)
  }

  onWindowResize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight * 0.9
    })
  }

  render() {
    return (
      <AceEditor id="editor" style={{fontSize: 20, height: window.innerHeight * 0.9, width: window.innerWidth, zIndex: 2, backgroundColor:editorBackgroundCol}}
        mode="glsl"
        theme="tomorrow_night"
        onChange={onChange}
        name="UNIQUE_ID_OF_DIV"
        value={fragmentShader}
        editorProps={{$blockScrolling: true}} ref={(AceEditor) => { this.editor = AceEditor; }} >
      </AceEditor>
    );
  }
}


class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h3>Shader Machine</h3>
        </div>

        <div className="container" id="container" style={{position:"absolute"}}>
            <div className="container"  id="three-box" style={{position:"absolute", top:0, left:0}}>
            </div>
            <div  className="container"  id="div2" style={{position:"absolute", top:0, left:0}}>
                    <ShaderMachineEditor shadercode={fragmentShader}>
                    </ShaderMachineEditor>
            </div>
        </div>

      </div>

      //document.getElementById('example')

    );
  }
}

window.onload = shaderstart;

export default App;
