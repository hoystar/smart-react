require("../canvas-layout.less");

let ReactDom = require('react-dom');
let CxtMenu = require("../../../../../../console/coms/commons/cxt-menu/cxt-menu.jsx");
let MaskLayout = require("../mask-layout.jsx");
let TagMarkModal = require("../../../commons/uppop-modal/tag-mark-modal/tag-mark-modal.jsx");
var baseCom = require("../../../../../../console/coms/commons/base/baseCom.jsx");
let languageProvider = require("../../../../../../console/services/language/index.js");
let LAYOUT_TYPE = require("../../../../services/dag/layout/layoutType");
let TYPE = require("../../../../services/dag/element/type");
var classnames = require('classnames');
import { Button , Radio } from 'antd';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;


class StandardCanvas extends baseCom {
  constructor(props) {
    super(props);

    this.state = {
      isCanAddFlow: false
    };
  }

  onSaveCanvas() {
    this.props.saveCanvas();
  }

  onAddItemsToCanvas(data) {
    this.props.addItemsToCanvas(data);
  }

  onChangeTagModalVisible() {
    this.props.changeTagModalVisible();
  }

  onMenuClick(item) {
    this.props.menuClick(item);
  }

  onDataExploreClick() {
    let param = {
      key:this.props.canvasId + "##" + LAYOUT_TYPE.TYPE_CREATE_DEFINE,
      name: "创建探索:" + this.props.canvasId,
      id: this.props.canvasId,
      type: LAYOUT_TYPE.TYPE_CREATE_DEFINE,
    };
    this.props.options.beginDefine(param);
  }

  onAddFlowLineClick(){
    this.props.addFlowLine();
  }

  onViewChange(e){
    if(e.target.value === 'basic'){
      this.props.changeViewType(TYPE.viewType.TYPE_BASIC);
      this.setState({isCanAddFlow:false});
    }else{
      this.props.changeViewType(TYPE.viewType.TYPE_FLOW);
      this.setState({isCanAddFlow:true});
    }
  }

  render() {
    var menuItem = this.props.cxtMenu.data.map(function(item) {
      return <li className="cxt-menu-item" key={item.type} onClick={this.onMenuClick.bind(this,item)}><a className="menu-text">{item.name}</a></li>
    }.bind(this));

    var addFlowBtnCls = classnames({
      "btn-default":true,
      "btn-disabled":!this.state.isCanAddFlow
    });

    var addFlowIcoCls = classnames({
      "iconfont":true,
      "btn-disabled":!this.state.isCanAddFlow
    });
    return (
      <div className="dag-box">
        <div className="tool-bar">
          <div className="item">
            <button type="button" className="btn-default" title={languageProvider["smartview.canvas_standard.create_canvas"] || "创建视图"}>
              <i className="iconfont">&#xe628;</i>
            </button>
          </div>
          <div className="item">
            <button type="button" className="btn-default" title={languageProvider["smartview.canvas_standard.save_canvas"] || "保存视图"} onClick={this.onSaveCanvas.bind(this)}>
              <i className="iconfont">&#xe629;</i>
            </button>
          </div>
          <div className="item">
            <button type="button" className="btn-default" title={languageProvider["smartview.canvas_standard.my_canvas"] || "我的视图"}>
              <i className="iconfont">&#xe622;</i>
            </button>
          </div>
          <div className="item">
            <button type="button" className="btn-default" onClick={this.onDataExploreClick.bind(this)} title={languageProvider["smartview.canvas_standard.data_explore"] || "数据探索"}>
              <i className="iconfont">&#xe62a;</i>
            </button>
          </div>
          <div className="item">
            <button type="button" className={addFlowBtnCls} onClick={this.onAddFlowLineClick.bind(this)} title={languageProvider["smartview.canvas_standard.add_flow"] || "添加流程"}>
              <i className={addFlowIcoCls}>&#xe638;</i>
            </button>
          </div>          
          <div className="item-view-select">
            <RadioGroup onChange={this.onViewChange.bind(this)} defaultValue="basic">
              <RadioButton value="basic">标准视图</RadioButton>
              <RadioButton value="flow">流程视图</RadioButton>
            </RadioGroup>    
          </div>            
        </div>         
        <MaskLayout searchType="canvas" addItemToLayout={this.onAddItemsToCanvas.bind(this)} />
        <TagMarkModal {...this.props.detailEntity} changeModalVisible={this.onChangeTagModalVisible.bind(this)}/>         
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
        <CxtMenu {...this.props.cxtMenu}>
          <ul> {menuItem} </ul>
        </CxtMenu>         
      </div>
    );
  }
}

module.exports = StandardCanvas;
