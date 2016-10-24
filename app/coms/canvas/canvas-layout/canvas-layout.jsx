require("./canvas-layout.less");

let ReactDom = require('react-dom');
let LayoutGen = require("../../../services/dag/layout/LayoutGen");
let MaskLayout = require("./mask-layout.jsx");
let CxtMenu = require("../../../../../console/coms/commons/cxt-menu/cxt-menu.jsx");
let TagMarkModal = require("../../commons/uppop-modal/tag-mark-modal/tag-mark-modal.jsx");
let events = require("../../../services/dag/events");
let TYPE = require("../../../services/dag/layout/layoutType");

let StandardCanvas = require("./canvas-component/standard-canvas.jsx");
let ReommendCanvas = require("./canvas-component/reommend-canvas.jsx");
let ExploreDefineCanvas = require("./canvas-component/explore-define-canvas.jsx");
let ExploreInstanceCanvas = require("./canvas-component/explore-instance-canvas.jsx");

let CreateDefine = require("./canvas-component/create-define/create-define-canvas.jsx");
let languageProvider = require("../../../../../console/services/language/index.js");

import { message, Button } from 'antd';
import { Component } from 'react';

class CanvasLayout extends Component {
  constructor(props) {
    super(props);

    this.canvasType = undefined;
    this.layout = {};
    this.width = 500;
    this.height = 400;
    this.offset = null;
    this.canvasType = undefined;
    this.searchType = "canvas";
    this.state = {
      canvasId: undefined,
      cxtMenu: {
        x: "0px",
        y: "0px",
        data: [],
        isShow: false
      },
      detailEntity: {
        data: {
          domainCode: null,
          domainName: null,
          domainType: null,
          nodes: [],
          tags: []
        },
        isShow: false
      }
    };
  }

  onCxtMenuHide(event) {
    var e = event ? event : window.event;

    this.setState({
      cxtMenu: {
        x: e.clientX + "px",
        y: e.clientY + "px",
        data: [],
        isShow: false
      }
    });
  }

  drawCanvas(canvasType, canvasData) {
    var svg_id = "svg-canvas-" + canvasData.id + "-" + canvasType;

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

    var element = ReactDom.findDOMNode(this);
    $(element)
      .find("#svg-canvas")
      .replaceWith(svg);

    var layoutOption = {
      width: this.width,
      height: this.height,
      svg: d3.select("#" + svg_id),
      canvasType: canvasType,
      isAutoLayout: canvasData.isAutoLayout,
      isSplitLinks: canvasData.isSplitLinks
    };

    this.layout = new LayoutGen(layoutOption);
    this.layout.draw(canvasData.data);
    this.attatchLayoutEvent();

    this.setState({ canvasId: canvasData.id });
  }

  attatchLayoutEvent() {
    this.layout.eventProxy.on(events.SHOW_CXTMENU, function(data) {
      var menuData = data.data.map(function(item) {
        var menuName = item.name;
        switch (item.type) {
          case "DEL":
            menuName = languageProvider["smartview.canvas_layout.delete_node"] || item.name;
            break;
          case "DEL_FLOW":
            menuName = languageProvider["smartview.canvas_layout.delete_flow"] || item.name;
            break;
          case "ENTITY_DETAIL":
            menuName = languageProvider["smartview.canvas_layout.eintiy_detail"] || item.name;
            break;
          case "LINK_DETAIL":
            menuName = languageProvider["smartview.canvas_layout.link_detail"] || item.name;
            break;
          default:
            menuName = item.name;
            break;
        }
        var menuItem = {
          code: item.code,
          objectId: item.objectId,
          type: item.type,
          name: menuName
        };

        return menuItem;
      });
      this.setState({
        cxtMenu: {
          x: data.x + "px",
          y: data.y + "px",
          data: menuData,
          isShow: true
        }
      });
    }.bind(this));

    this.layout.eventProxy.on(events.SHOW_DETAILENTITY, function(data) {
      
      var detailEntityData = {
        domainCode: (this.layout.dataSet.findNode(data.config.centerNodeId)).config.id,
        domainName: (this.layout.dataSet.findNode(data.config.centerNodeId)).config.content[0].name,
        domainType: (this.layout.dataSet.findNode(data.config.centerNodeId)).config.content[0].domainType,
        nodes: data.config.nameChain.map(function(item) {
          return {
            name: item
          }
        }),
        tags: data.config.data.tags ? data.config.data.tags.map(function(item) {
          return {
            id: item.code,
            name: item.name
          }
        }) : []
      };

      this.setState({
        detailEntity: {
          data: detailEntityData,
          isShow: true
        }
      });
    }.bind(this));

    this.layout.eventProxy.on(events.HIDE_DETAILENTITY, function(data) {
      this.setState({
        detailEntity: {
          data: {
            domainCode: null,
            domainName: null,
            domainType: null,
            nodes: [],
            tags: []
          },
          isShow: false
        }
      });
    }.bind(this));

    this.layout.eventProxy.on(events.SELECT_NODE, function(data) {
      this.props.recommendOpts.selectNode(data);
    }.bind(this));
  }

  componentDidMount() {
    $(document).on("click.cxtMenu", (e) => { this.onCxtMenuHide(e); });

    var element = ReactDom.findDOMNode(this);
    this.width = $(element).find(".svg-container").width() - 5;
    this.height = $(element).find(".svg-container").height();
    this.offset = $(element).offset();

    this.drawCanvas(this.props.canvasType, this.props.dataSource);
  }

  componentWillUnmount() {
    $(document).off("click.cxtMenu");
  }

  componentWillReceiveProps(nextProps) {
    var _node = nextProps.recommendOpts.updateNode;
    if (_node) {
      this.layout.changeBGColor(_node.id, "#c8ffff");

      var text = _node.content[0].name || "";
      this.layout.updateContent(_node.id, text);
    }
  }

  addItemsToCanvasHandle(data) {
    if (data.eventType !== this.searchType) return;

    var x = data.x;
    var y = data.y;

    var svg_x_left = this.offset.left;
    var svg_x_right = this.offset.left + this.width;
    var svg_y_top = this.offset.top;
    var svg_y_bottom = this.offset.top + this.height;

    if (x > svg_x_left && x < svg_x_right && y > svg_y_top && y < svg_y_bottom) {
      data.data.nodes = data.data.nodes.map(function(item) {
        item.x = item.x - svg_x_left + item.width / 2;
        item.y = item.y - svg_y_top - item.height / 2;
        return item;
      });
      let selectEle = data.data.nodes.length !== 0 ? data.data.nodes[0] : data.data.links[0];
      switch (selectEle.type) {
        case 1:
        case 2:
          this.layout.layoutCtrl.addData(data.data).catch(function(e) {
            let errorText = e.error || "添加失败";
            message.error(errorText);
          });
          break;
        case 3:
          break;
      }
    }
  }

  changeTagModalVisibleHandle() {
    var newState = {
      detailEntity: {
        data: this.state.detailEntity.data,
        isShow: !this.state.detailEntity.isShow
      }
    };
    this.setState(newState);
  }


  menuClickHandle(item) {
    switch (item.type) {
      case "DEL":
        this.layout.removeRelatedItem(item.objectId);
        break;
      case "DEL_FLOW":
        this.layout.removeItem(item.objectId);
        break;
      case "ENTITY_DETAIL":
        window.open("/console/pages/data_manager/entity_detail?entityCode=" + item.code);
        break;
      case "LINK_DETAIL":
        window.open("/console/pages/data_manager/link_detail?entityCode=" + item.code);
        break;
    }

    this.setState({
      cxtMenu: {
        x: 0 + "px",
        y: 0 + "px",
        data: [],
        isShow: false
      }
    });
  }

  saveCanvasHandle() {
    this.layout.saveCanvas().then(function() {
      message.success('保存成功');
    });
  }

  onChangeViewType(viewType){
    this.layout.changeView(viewType);
  }

  addFlowLine(){
    this.layout.addFlowInfo.switch = 'on';
  }

  render() {
    switch (this.props.canvasType) {
      case TYPE.TYPE_STANDARD:
        return (
          <StandardCanvas 
            canvasId={this.state.canvasId}
            getCanvas={this.props.getCanvas}
            cxtMenu={this.state.cxtMenu}
            detailEntity={this.state.detailEntity}
            addItemsToCanvas={this.addItemsToCanvasHandle.bind(this)}
            changeTagModalVisible={this.changeTagModalVisibleHandle.bind(this)}
            saveCanvas={this.saveCanvasHandle.bind(this)}
            menuClick={this.menuClickHandle.bind(this)}
            changeViewType={this.onChangeViewType.bind(this)}
            addFlowLine={this.addFlowLine.bind(this)}
            options={this.props.standardOpts}
          />
        );
      case TYPE.TYPE_REOMMEND:
        return (
          <ReommendCanvas 
            canvasId={this.state.canvasId}
            options={this.props.recommendOpts}
          />
        );
      case TYPE.TYPE_EXPLORE_DEFINE:
        return (
          <ExploreDefineCanvas 
            canvasId={this.state.canvasId}
            options={this.props.exploreOpts}
            tabKey={this.props.tabKey}
            defineInfoData={this.props.defineInfoData}
          />
        );
      case TYPE.TYPE_EXPLORE_INSTANCE:
        return (
          <ExploreInstanceCanvas 
            canvasId={this.state.canvasId}
            options={this.props.exploreOpts}
            instanceInfos={this.props.instanceInfos}
            tabKey={this.props.tabKey} 
          />
        );
      case TYPE.TYPE_CREATE_DEFINE:
        return (
          <CreateDefine
            getPartitionInfo={this.props.getPartitionInfo}  
            createDetect={this.props.createDetect}
            onEdit={this.props.onEdit}
            tabKey={this.props.tabKey} 
            layout = {this.layout}
            canvasData={this.props.dataSource}
            getERTagDetail={this.props.getERTagDetail}
            canvasId={this.props.canvasId} 
            getCanvas={this.props.getCanvas} 
            objectList={this.props.objectList}
            />
        );
    }
  }
}

module.exports = CanvasLayout;
