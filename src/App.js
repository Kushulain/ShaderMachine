import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { render } from 'react-dom';
import brace from 'brace';
import AceEditor from 'react-ace';
import {Surface} from 'gl-react-dom';
import GL from 'gl-react';
import windowSize from 'react-window-size';

import 'brace/mode/glsl';
import 'brace/theme/tomorrow_night';

function onChange(newValue) {
  console.log('change',newValue);
    console.log('window.width',window.innerWidth);

}

const element = <h1>Hello, world!</h1>;
var colorA = "#F00";
var colorB = "#550";
var editorBackgroundCol = "rgba(15,15,15,0.2)";

const defaultShader = `
precision highp float;
varying vec2 uv; // This variable vary in all pixel position (normalized from vec2(0.0,0.0) to vec2(1.0,1.0))

void main () { // This function is called FOR EACH PIXEL
gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0); // red vary over X, green vary over Y, blue is 50%, alpha is 100%.
}
`;

const myShaders = GL.Shaders.create({
  currentShader: {
    frag: `
precision highp float;
varying vec2 uv; // This variable vary in all pixel position (normalized from vec2(0.0,0.0) to vec2(1.0,1.0))

void main () { // This function is called FOR EACH PIXEL
  gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0); // red vary over X, green vary over Y, blue is 50%, alpha is 100%.
}
    `
  }
});

class ShaderMachineView extends Component
{

  updateDimensions() {
    var w = window;
    var d = document;
    var documentElement = d.documentElement;
    var body = d.getElementsByTagName('body')[0];
    var resultWidth = w.innerWidth || documentElement.clientWidth || body.clientWidth;
    var resultHeight = w.innerHeight|| documentElement.clientHeight|| body.clientHeight;

    this.setState({width: resultWidth, height: resultHeight});
    var parent = this._reactInternalInstance._currentElement._owner._instance;
    console.log("parent:", parent.offsetWidth);

    if (this.props.surfaceInstance) //alway undefined :(
    {
      this.props.surfaceInstance.setHeight(this.props.height*0.5);
      this.props.surfaceInstance.setWidth(this.props.width);
    }

  }

  constructor(props) {
    super(props);
    //this.state = {width: 100, height:100};
    this.updateDimensions = this.updateDimensions.bind(this)
    // console.log("huhu", props.width);
    console.log("boah", props.shader);
  }

  componentWillMount() {
       this.updateDimensions();
   }
   componentDidMount() {
       window.addEventListener("resize", this.updateDimensions);
   }
   componentWillUnmount() {
       window.removeEventListener("resize", this.updateDimensions);
   }
  render() {
    // console.log("1");
    //   console.log(window.innerHeight);
    return (
      <Surface width={window.innerWidth} height={window.innerHeight - 34} style={{top:34, left:0, right:0, bottom:0, position:"absolute", zIndex: 1}}
        ref={(Surface) => { this.surfaceInstance = Surface; }} >
        {/*<Surface width={window.innerWidth} height={window.innerHeight - 34} style={{top:34, left:0, right:0, bottom:0, position:"absolute", zIndex: 1}}*/}
        <GL.Node shader={this.props.shader} />
      </Surface>
    );
  }
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

  render() {
     console.log("1");
    //   console.log(window.innerHeight);
    return (
      <AceEditor id="editor" style={{fontSize: 20,zIndex: 2, backgroundColor:editorBackgroundCol}}
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

        {/*ref={input => {this.myInput = input}*/}
        <div style={{position:"relative"}}>
        {/*<div id="container" style={{position:"relative"}}>*/}
            <div id="div1" style={{position:"absolute", top:0, left:0}}>
                      <ShaderMachineView shader={myShaders.currentShader} width={window.innerWidth} height={window.innerHeight} />
            </div>
            <div id="div2" style={{position:"absolute", top:0, left:0}}>
                    <ShaderMachineEditor shadercode={defaultShader}>

                    </ShaderMachineEditor>
            </div>
        </div>

      </div>

      //document.getElementById('example')

    );
  }
}

export default App;
