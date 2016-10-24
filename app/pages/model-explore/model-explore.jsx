//import '../node_modules/bootstrap/scss/bootstrap.scss';
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import d3 from "d3";
import { Button } from 'react-bootstrap';
import LayoutGen from '../../dag/layout/layoutGen';
import Header from '../public/header';
import Nav from '../public/nav';
import './model-explore.css';
var canvasData = require('../../data.js');
var Promise = require('es6-promise').Promise;
/*var canvasData;
$.ajax({    
    url:'http://188.188.2.200:8080/smartView/View/getViewJson?id=1', 
    cache:false,
    dataType: 'json',  
    async: false,
    success: function(data) {  
      console.log(data); 
      canvasData = data;
    }  
}); */


class CanvasMenu extends React.Component {
  render(){
    return (
      <div className="all-http-right-menu">
        <ul>
          <li>A</li>
          <li>B</li>
          <li>C</li>
          <li>D</li>
        </ul>
      </div>
    )
  }
}

class CanvasSearch extends React.Component {
  render(){
    return (
      <div className="all-http-right-search">
        <div className="all-http-right-btnsearch">搜</div>
        <div className="all-http-right-detailsearch">

          <div className="all-http-right-detailsearch-li-btn">拖动按钮</div>
        </div>
      </div>
    )
  }
}



export default React.createClass({

    getInistialState() {
      return{
        width : 800,
        height : 600
      }
    },

    drawCanvas(canvasType, canvasData) {
      console.log(canvasData);
      var svg_id = "svg-canvas-" + canvasData.data.id + "-" + canvasType;

      let svg = $([
        '<svg id=' + svg_id + ' class="dag-svg">',
        '<defs>',
        '<marker id="arrow" markerUnits="strokeWidth" markerWidth="8" markerHeight="6" viewBox="0 0 12 12" refX="6" refY="6" orient="auto">',
        '<path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="#ccc"></path>',
        '</marker>',
        '<marker id="arrow-highlight" markerUnits="strokeWidth" markerWidth="8" markerHeight="6" viewBox="0 0 12 12" refX="6" refY="6" orient="auto">',
        '<path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="#3daefe"></path>',
        '</marker>',
        '</defs>',
        '<g class="zoom-container"></g>',
        '</svg>'
      ].join(""));

      var element = ReactDOM.findDOMNode(this);
      $(element)
        .find("#svg-canvas")
        .replaceWith(svg);

      var layoutOption = {
        width: this.width,
        height: this.height,
        svg: d3.select("#" + svg_id),
        canvasType: canvasType,
        isAutoLayout: false,
        isSplitLinks: false
      };

      this.layout = new LayoutGen(layoutOption);
      this.layout.draw(canvasData.data);
    },

    componentDidMount() {
      this.width = 800;
      this.height = 600;

      this.drawCanvas(10, canvasData);
    },

    render() {
        //JSX here!
      var secHeight = document.body.clientHeight - 50;
      return (
        <div className="all-http">
          <Header />
          <section style={{height: secHeight}}>
            <Nav />
            <div className="all-http-right">
              <CanvasMenu />
              <CanvasSearch />
              <div className="svg-container">
                <svg id="svg-canvas" className="dag-svg">
                  /*<defs>
                    <marker id="arrow" markerUnits="strokeWidth" markerWidth="12" markerHeight="10" viewBox="0 0 12 12" refX="6" refY="6" orient="auto">
                      <path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="#ccc"></path>
                    </marker>
                    <marker id="arrow-highlight" markerUnits="strokeWidth" markerWidth="12" markerHeight="10" viewBox="0 0 12 12" refX="6" refY="6" orient="auto">
                      <path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="#3daefe"></path>
                    </marker>
                  </defs>
                  <g className="zoom-container"></g>*/
                </svg>
              </div>
            </div>
          </section>
        </div>
      );
    }
});
