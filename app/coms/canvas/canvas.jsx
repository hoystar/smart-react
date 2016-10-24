require("./canvas.less");

let CanvasLayout = require("./canvas-layout/canvas-layout.jsx");
var HttpRequest = require("@ali/dtboost-url-helper").sv.request;
let TYPE = require("../../services/dag/layout/layoutType");
import React, { Component } from 'react';
import { Spin } from 'antd';

class Canvas extends Component {
  constructor(props) {
    super(props);

    this.state = {
      canvasType: TYPE.TYPE_STANDARD,
      loading: true,
      canvasData: {}
    };
  }

  _openCanvas(canvasId, type) {
      switch (type) {
        case TYPE.TYPE_STANDARD:
          this.openStandardCanvas(canvasId);
          break;
        case TYPE.TYPE_REOMMEND:
          this.openReommendCanvas(canvasId);
          break;
        case TYPE.TYPE_EXPLORE:
          this.openExploreCanvas(canvasId);
          break;
        case TYPE.TYPE_EXPLORE_DEFINE:
          this.openExploreDefineCanvas(canvasId);
          break;
        case TYPE.TYPE_EXPLORE_INSTANCE:
          this.openExploreInstanceCanvas(canvasId);
          break;
        case TYPE.TYPE_CREATE_DEFINE:
          this.openCreateDefineCanvas(canvasId);
          break;
      }
    }
    //标准视图
  openStandardCanvas(canvasId) {
    HttpRequest.getCanvas({
      id: canvasId
    }).then((data) => {
      this.setState({
        canvasType: TYPE.TYPE_STANDARD,
        loading: false,
        canvasData: {
          id: canvasId,
          data: data,
          isAutoLayout: false,
          isSplitLinks: false
        }
      });
    });
  }

  openCreateDefineCanvas(canvasId) {
      HttpRequest.getCanvas({
        id: canvasId
      }).then((data) => {
        this.setState({
          canvasType: TYPE.TYPE_CREATE_DEFINE,
          loading: false,
          canvasData: {
            id: canvasId,
            data: data,
            isAutoLayout: false,
            isSplitLinks: true
          }
        });
      });
    }
    //发现视图
  openReommendCanvas(canvasId) {
      HttpRequest.GetRecommendCanvasInfo({
        cavansId: canvasId
      }).then((data) => {
        this.setState({
          canvasType: TYPE.TYPE_REOMMEND,
          loading: false,
          canvasData: {
            id: canvasId,
            data: data,
            isAutoLayout: true,
            isSplitLinks: false
          }
        });
      });
    }
    //探索视图(标准视图拆分关系后形成的视图)
  openExploreCanvas(canvasId) {
      HttpRequest.getCanvas({
        id: canvasId
      }).then((data) => {
        this.setState({
          canvasType: TYPE.TYPE_EXPLORE,
          loading: false,
          canvasData: {
            id: canvasId,
            data: data,
            isAutoLayout: false,
            isSplitLinks: true
          }
        });
      });
    }
    //探索定义视图
  openExploreDefineCanvas(canvasId) {
      HttpRequest.LoadGraphByDefineId({
        defineId: canvasId
      }).then((data) => {
        var tmp = data.vertexs;
        for (var i = 0; i < tmp.length; i++) {
          var content = tmp[i].content;
          var ary = new Array();
          ary[0] = content;
          tmp[i].content = ary;
          tmp[i].type = content.type;
        }

        this.setState({
          canvasType: TYPE.TYPE_EXPLORE_DEFINE,
          loading: false,
          canvasData: {
            id: canvasId,
            data: data,
            isAutoLayout: true,
            isSplitLinks: false
          }
        });
      });
    }
    //探索实例视图
  openExploreInstanceCanvas(canvasId) {
    HttpRequest.LoadGraphByInstanceId({
      instanceId: canvasId
    }).then((data) => {
      var tmp = data.vertexs;
      for (var i = 0; i < tmp.length; i++) {
        var content = tmp[i].content;
        var ary = new Array();
        ary[0] = content;
        tmp[i].content = ary;
        tmp[i].type = content.type;
      }

      this.setState({
        canvasType: TYPE.TYPE_EXPLORE_INSTANCE,
        loading: false,
        canvasData: {
          id: canvasId,
          data: data,
          isAutoLayout: true,
          isSplitLinks: false
        }
      });
    });
  }

  componentDidMount() {
    var canvasId = parseInt(this.props.canvasId);
    var canvasType = parseInt(this.props.type);
    this._openCanvas(canvasId, canvasType);
  }

  render() {
    var standardOpts = {
      beginDefine: this.props.beginDefine
    };
    var recommendOpts = {
      selectNode: this.props.selectNode,
      updateNode: this.props.updateNode
    };
    var exploreOpts = {
      showAddInstanceModal: this.props.showAddInstanceModal,
      execExploreByInstanceID: this.props.execExploreByInstanceID,
      deleteCanvasItem: this.props.deleteCanvasItem
    };

    if (this.state.loading) {
      return (
        <div className="canvas-container">
          <Spin spinning={this.state.loading} tip="正在读取数据..." />
        </div>
      );
    } else {
      return (
        <div className="canvas-container">
          <CanvasLayout
          instanceInfos={this.props.instanceInfos}
          defineInfoData={this.props.defineInfoData}
          getPartitionInfo={this.props.getPartitionInfo}  
          createDetect={this.props.createDetect} 
          onEdit={this.props.onEdit}
          tabKey={this.props.tabKey}
          getERTagDetail={this.props.getERTagDetail} 
          objectList={this.props.objectList} 
          getCanvas={this.props.getCanvas} 
          canvasId={this.props.canvasId} 
          beginDefine={this.props.beginDefine}
          canvasType={this.state.canvasType} 
          dataSource={this.state.canvasData} 
          standardOpts={standardOpts} 
          recommendOpts={recommendOpts}
          exploreOpts={exploreOpts}
          />    
        </div>
      );
    }
  }
}

module.exports = Canvas;
