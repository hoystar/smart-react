require("../canvas-layout.less");

import { Button } from 'antd';
let ReactDom = require('react-dom');
var baseCom = require("../../../../../../console/coms/commons/base/baseCom.jsx");
let languageProvider = require("../../../../../../console/services/language/index.js");
let TYPE = require("../../../../services/dag/layout/layoutType");

class ExploreDefineCanvas extends baseCom {
  constructor(props) {
    super(props);
  }

  onShowAddInstanceModalClick() {
    this.props.options.showAddInstanceModal({
      canvasId: this.props.canvasId,
      canvasType: TYPE.TYPE_EXPLORE_DEFINE
    });
  }

  onDeleteCanvasItemClick(){
    let defineData = this.props.defineInfoData.objectInfos[this.props.canvasId]
    this.props.options.deleteCanvasItem({
      key:this.props.tabKey,
      id: this.props.canvasId,
      parentId:defineData.parentId,
      type: defineData.objectType
    });
  }

  render() {
    return (
      <div className="dag-box">
          <div className="tool-bar">
            <div className="item">
              <button type="button" onClick={this.onDeleteCanvasItemClick.bind(this)} className="btn-default" title={languageProvider["smartview.canvas_explore_define.delete_explore"] || "删除探索"}>
                <i className="iconfont">&#xe62e;</i>
              </button>
            </div>
            <div className="item">
              <button type="button" className="btn-default" onClick={this.onShowAddInstanceModalClick.bind(this)} title={languageProvider["smartview.canvas_explore_define.add_instance"] || "添加实例"}>
                <i className="iconfont">&#xe628;</i>
              </button>
            </div>            
          </div>        
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

module.exports = ExploreDefineCanvas;
