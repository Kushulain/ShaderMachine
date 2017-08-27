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

void main() {
  vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
  float a = time*40.0;
  float d,e,f,g=1.0/40.0,h,i,r,q;
  e=400.0*(p.x*0.5+0.5);
  f=400.0*(p.y*0.5+0.5);
  i=200.0+sin(e*g+a/150.0)*20.0;
  d=200.0+cos(f*g/2.0)*18.0+cos(e*g)*7.0;
  r=sqrt(pow(abs(i-e),2.0)+pow(abs(d-f),2.0));
  q=f/r;
  e=(r*cos(q))-a/2.0;f=(r*sin(q))-a/2.0;
  d=sin(e*g)*176.0+sin(e*g)*164.0+r;
  h=((f+d)+a/2.0)*g;
  i=cos(h+r*p.x/1.3)*(e+e+a)+cos(q*g*6.0)*(r+h/3.0);
  h=sin(f*g)*144.0-sin(e*g)*212.0*p.x;
  h=(h+(f-e)*q+sin(r-(a+h)/7.0)*10.0+i/4.0)*g;
  i+=cos(h*2.3*sin(a/350.0-q))*184.0*sin(q-(r*4.3+a/12.0)*g)+tan(r*g+h)*184.0*cos(r*g+h);
  i=mod(i/5.6,256.0)/64.0;
  if(i<0.0) i+=4.0;
  if(i>=2.0) i=4.0-i;
  d=r/350.0;
  d+=sin(d*d*8.0)*0.52;
  f=(sin(a*g)+1.0)/2.0;
  gl_FragColor=vec4(vec3(f*i/1.6,i/2.0+d/13.0,i)*d*p.x+vec3(i/1.3+d/8.0,i/2.0+d/18.0,i)*d*(1.0-p.x),1.0);
}
`;

var shaderUniforms = {
  time: { type: "f", value: 0.0 },
  resolution: { type: "v2", value: new THREE.Vector2(500, 500) }
};

var shaderMaterial = new THREE.ShaderMaterial({
  uniforms: shaderUniforms,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader
});

function onChange(newValue) {
  //console.log('change',newValue);
    console.log('window.width',window.innerWidth);

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
var editorBackgroundCol = "rgba(15,15,15,0.3)";
var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
var clock = new THREE.Clock();

class Wavey extends React.Component {
  constructor(props) {
    super(props)

    shaderUniforms.resolution.value.x = props.width;
    shaderUniforms.resolution.value.y = props.height;

  }
  componentWillReceiveProps(nextProps) {
    shaderUniforms.time.value = nextProps.time

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
      width: window.innerWidth,
      height: window.innerHeight  * 0.9,
    };

    this.animate = () => {
      this.setState({
        time: this.state.time + clock.getDelta(),
          width: window.innerWidth,
          height: window.innerHeight * 0.9
      })

      this.frameId = requestAnimationFrame(this.animate)
    }
  }

  // animate() {
  //   this.setState({
  //       time: this.state.time + clock.getDelta(),
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

    return <Renderer width={this.state.width} height={this.state.height} pixelRatio={window.devicePixelRatio} >
        <Scene width={this.state.width} height={this.state.height} camera="maincamera">
            <PerspectiveCamera name="maincamera" {...cameraprops} />
            <Wavey time={this.state.time} width={this.state.width} height={this.state.height} />
        </Scene>
    </Renderer>
  }
}

function shaderstart() { // eslint-disable-line no-unused-vars
  var renderelement = document.getElementById("three-box");
  console.log("new shaderstart");
  ReactTHREE.render(<ExampleScene/>, renderelement);
}


class ShaderMachineEditor extends Component
{
  constructor(props) {
    super(props);
    //this.state = {width: 100, height:100};
    // var editor = document.getElementById("editor");;
    // editor.setValue("the new text here");
    //this.props.text = this.props.text;
     console.log("lalalal", props.width);
     console.log("boh", this.props.shadercode);
  }

  lol()
  {
    console.log("consolg");
    return "mais oh";
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
     console.log("1");
    //   console.log(window.innerHeight);
    return (
      <AceEditor id="editor" style={{fontSize: 20, height: window.innerHeight * 0.9, width: window.innerWidth, zIndex: 2, backgroundColor:editorBackgroundCol}}
        mode="glsl"
        theme="tomorrow_night"
        onChange={onChange}
        name="UNIQUE_ID_OF_DIV"
        value={this.props.shadercode}
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
