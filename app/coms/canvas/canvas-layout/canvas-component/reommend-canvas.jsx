require("../canvas-layout.less");

let ReactDom = require('react-dom');

import { Button } from 'antd';
import { Component } from 'react';

class RecommendCanvas extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="dag-box">        
        <div className="svg-container">
          <svg id="svg-canvas" className="dag-svg">
            <defs>
              <marker id="arrow" markerUnits="strokeWidth" markerWidth="12" markerHeight="10" viewBox="0 0 12 12" refX="6" refY="6" orient="auto">
                <path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="#ccc"></path>
              </marker>
              <marker id="arrow-highlight" markerUnits="strokeWidth" markerWidth="12" markerHeight="10" viewBox="0 0 12 12" refX="6" refY="6" orient="auto">
                <path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="#3daefe"></path>
              </marker>
            </defs>
            <g className="zoom-container"></g>
          </svg>
        </div>       
      </div>
    );
  }
}

module.exports = RecommendCanvas;
