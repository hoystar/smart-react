"use strict";

import $ from 'jquery';
import Element from '../element';
let TYPE = require("../type");
let EVENTS = require("../../events");

export default class Node extends Element {
  constructor(data) {
    super(data);
    this.MENUDATA = [{
      name: "删除节点",
      type: "DEL"
    }, {
      name: "实体详情",
      type: "ENTITY_DETAIL"
    }, {
      name: "关系详情",
      type: "LINK_DETAIL"
    }];
    this.type = TYPE.ElementType.ELEMENT_TYPE_NODE;
    this.config = data;
    this.isExploreAble = true;
    this.isShowTagAble = true;
    this.isSelectAble = false;
    this.isShowPie = true;
    this.isPieOpen = false;
    this.isFocus = false;
    this.isHide = false;
    this.isExploring = false;
    this.hasExplore = false;
    this.exploreNodeIds = [];
    this.isExplored = false;
    this.isShowCtxMenu = true;
    this.tagData = null;
    this.requestTag = data.requestTag;
    if (!this.config.nameChain) {
      this.config.nameChain = [];
    }
  }

  active() {
    throw "This interface is not overloaded";
  }

  attachSelectEvent($dom) {//发选中事件
    if (this.isSelectAble) {
      $dom.on("click", function() {
        if (d3.event.defaultPrevented) return;
        this.emitEvent(EVENTS.SELECT_NODE, [this.config]);
      }.bind(this));
    }
  }

  getTag() {
    if (this.config.content[0].tagCount === 0) {
      return Promise.resolve([]);
    }

    if (this.tagData) {
      return Promise.resolve(this.tagData);
    } else {
      if (this.requestTag) {
        return this.requestTag(this.config.content[0].code);
      } else {
        return Promise.resolve([]);
      }
    }
  }

  showAnnular(data, nodeId, centerX, centerY) { //点击右侧后调用此函数，添加删除按钮以及其点击事件
    if (!this.isShowPie) return;

    var result = [];

    if (data === undefined || data.length <= 0)
      return;
    let  nodeMess = document.getElementById('element-'+nodeId);
    let nodeData = this._genAnnularData({
      data: data || [],
      nodeId: nodeId,
      centerX: centerX,
      centerY: centerY,
      insideR: 55,
      outsideR: 105,
      radius: 60
    });

    var objectDom = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    var object = d3.select(objectDom)
      .attr("class", "explore-btn-object")
      .attr("transform", "translate(" + (this.config.x - 8) + "," + (this.config.y + 30) + ")");
    object
      .append("xhtml:div")
      .attr("class", "close-container")
      .append(function() {
        var icon = $("<i class='iconfont annular-close-btn'>&#8855;</i>");
        icon.click(function() {
          this.isPieOpen = false;
          this.emitEvent(EVENTS.REMOVE_ANNULAR);
        }.bind(this));

        return icon[0];
      }.bind(this));

    var result = {
      data: nodeData,
      close: objectDom
    }
    if (this.isPieOpen) { //判定是执行添加数据动作还是删除数据动作
      this.isPieOpen = false;
      this.emitEvent(EVENTS.REMOVE_ANNULAR);
    } else {
      this.isPieOpen = true;
      this.emitEvent(EVENTS.ADD_ANNULAR, [result]);
      $(nodeMess).clone().appendTo(".annulargroup");
      $('.annulargroup').find(".node").find(".explore-btn-object").remove();
      $('.annulargroup').find(".tag-btn-object").remove();
      //$('.annulargroup').attr("transform",'translate(-37,'+(document.body.clientHeight-100) + ')');

    }
  }

  _genAnnularData(option) {
    let result = [];
    let data = option.data;
    let nodeId = option.nodeId;
    let centerX = option.centerX || 0;
    let centerY = option.centerY || 0;
    let outsideR = option.outsideR || 105;
    let insideR = option.insideR || 55;
    let radius = option.radius || 60;
    let startRadius = option.startRadius || 0;

    if (!data) {
      return [];
    }

    for (let i = 0; i < data.length; i++) {
      let startX = centerX + Math.cos((startRadius + i * radius) / 180 * Math.PI) * outsideR;
      let startY = centerY + Math.sin((startRadius + i * radius) / 180 * Math.PI) * outsideR;
      let endX = centerX + Math.cos((startRadius + (i + 1) * radius) / 180 * Math.PI) * outsideR;
      let endY = centerY + Math.sin((startRadius + (i + 1) * radius) / 180 * Math.PI) * outsideR;
      let startX2 = centerX + Math.cos((startRadius + (i + 1) * radius) / 180 * Math.PI) * insideR;
      let startY2 = centerY + Math.sin((startRadius + (i + 1) * radius) / 180 * Math.PI) * insideR;
      let endX2 = centerX + Math.cos((startRadius + i * radius) / 180 * Math.PI) * insideR;
      let endY2 = centerY + Math.sin((startRadius + i * radius) / 180 * Math.PI) * insideR;
      let textX = centerX + Math.cos(((2 * i + 1) * 60 / 2 + startRadius) / 180 * Math.PI) * (insideR + outsideR) / 2 - 24;
      let textY = centerY + Math.sin(((2 * i + 1) * 60 / 2 + startRadius) / 180 * Math.PI) * (insideR + outsideR) / 2 + 5;

      let cmd = [
        "M", startX, startY,
        //A的属性：x的半径，y的半径，旋转角度，大弧还是小弧，顺时针还是逆时针，结束为坐标(X,Y)
        "A", outsideR, outsideR, 0, 0, 1, endX, endY,
        "L", startX2, startY2,
        "A", insideR, insideR, 0, 0, 0, endX2, endY2
      ];

      result.push({
        d: cmd.join(" "),
        id: data[i].id,
        nameChain: this.config.nameChain.concat([data[i].name]),
        text: data[i].name.length > 4 ? (data[i].name.substring(0, 4) + "..") : data[i].name,
        data: data[i],
        centerNodeId: nodeId,
        centerX: centerX,
        centerY: centerY,
        insideR: insideR,
        outsideR: outsideR,
        textX: textX,
        textY: textY
      })
    }

    return result;
  }

  attachTipEvent() {  //节点在鼠标浮上去后出现提示
    if (!!this.config.isShowTip) {
      let data = {
        id: this.config.id,
        info: this.config,
      };
      $(this.element).on("mouseover", function(event) {
        this.emitEvent(EVENTS.SHOW_NODE_TOOLTIPS, [{
          nodeId: this.config.id,
          x: event.offsetX + 10,
          y: event.offsetY,
          data: data
        }]);
      }.bind(this));

      $(this.element).on("mouseout", function() {
        this.emitEvent(EVENTS.HIDE_NODE_TOOLTIPS, []);
      }.bind(this));
    }
  }

  _genExploreBtn(container) {
    var x = this.config.width;
    var y = this.config.height / 2 - 11;

    var object = container
      .append("foreignObject")
      .attr("class", "explore-btn-object")
      .attr("transform", "translate(" + -8 + "," + y + ")");

    object
      .append("xhtml:div")
      .attr("class", "node-container")
      .append(function() {
        var icon = $("<i class='iconfont'>&#9021;</i>");
        return icon[0];
      }.bind(this))
      .on("click", function() {
        this.explore();
      }.bind(this));

    return object[0][0];
  }

  _genTagIcon(container) {//右侧点击按钮append进来，并添加click事件
    var x = this.config.width - 4;
    var y = this.config.height / 2 - 7;
    var object = container
      .append("foreignObject")
      .attr("class", "tag-btn-object")
      .attr("transform", "translate(" + x + "," + y + ") scale(0.8)");

    object
      .append("xhtml:div")
      .attr("class", "info-container")
      .append(function() {
        var icon = $("<i class='iconfont'>&#9021;</i>");
        return icon[0];
      }.bind(this))
      .on("click", function() {
        this.getTag().then((data) => {
          this.showAnnular(data, this.config.id, this.config.x, this.config.y);
        });
      }.bind(this));
    return object[0][0];
  }

  _genCtxMenu(container) {
    var data = this.menuData.map(function(item) {
      for (let i = 0; i < this.MENUDATA.length; i++) {
        if (item === this.MENUDATA[i].type) {
          return $.extend(true, {}, this.MENUDATA[i], {
            nodeId: this.config.id,
            code: this.config.content[0].code
          })
        }
      }
    }.bind(this));
    if (this.isShowCtxMenu) {
      d3.select(container).on("contextmenu.node", function(event) {
        d3.event.preventDefault();
        this.emitEvent(EVENTS.SHOW_CXTMENU, [{
          nodeId: this.config.id,
          x: d3.event.layerX,
          y: d3.event.layerY,
          data: data
        }]);
      }.bind(this));
    }
  }

  isExploreLeaf() {
    return this.exploreNodeIds.length === 0;
  }

  explore() {
    var result = {
      id: this.config.id, 
      exploreNodeIds: this.exploreNodeIds,
      hasExplore: this.hasExplore
    }
    this.isExploring = true;
    this.emitEvent(EVENTS.EXPLORE_NODE, [result]);
  }

  unExplore() {
    //console.log(this);
    this.isExploring = false;
    this.emitEvent(EVENTS.UNEXPLORE_NODE, [this.config.id]);
    this.setUnExploreBtn();
  }

  setUnExploreBtn() {
    var btnContainer = d3.select(this.element)
      .select(".node-container");
    btnContainer.select("i").remove();
    btnContainer.append(function() {
      var icon = $("<i class='iconfont'>&#9021;</i>");
      icon.click(function() {
        this.explore();
      }.bind(this));

      return icon[0];
    }.bind(this));
  }

  afterExplore(result) {
    this.hasExplore = true;
    this.config.critical = true;
    if (result) {
      this.exploreNodeIds = result.nodes.map(function(item) {
        return item.id;
      });
    }

    var btnContainer = d3.select(this.element)
      .select(".node-container");

    if (this.exploreNodeIds.length === 0) {
      //假如没有结果直接把icon隐藏
      btnContainer.attr("display", "none");
    } else {
      //假如有结果把icon替换
      btnContainer.select("i").remove();
      btnContainer.append(function() {
        var icon = $("<i class='iconfont'>&#920;</i>");
        icon.click(function() {
          this.unExplore();
        }.bind(this));

        return icon[0];
      }.bind(this));
    }
  }

  getExploreData() {
    return {
      id: this.config.id,
      exploreNodeIds: this.exploreNodeIds
    }
  }

  remove() {
    if (this.isPieOpen) {
      this.emitEvent(EVENTS.REMOVE_ANNULAR);
    }
    this.emitEvent(EVENTS.COLLAPSE_NODE, [
      [this.config.id]
    ]);
  }

  focus() {
    if (this.isFocus) {
      return;
    }
    this.isFocus = true;
    this.emitEvent(EVENTS.FOCUS_NODE, [
      [this.config.id]
    ]);
  }

  unFocus() {
    if (!this.isFocus) {
      return;
    }
    this.isFocus = false;
    this.emitEvent(EVENTS.UNFOCUS_NODE, [
      [this.config.id]
    ]);
  }

  highlight() {
    var node = d3.select(this.element);
    node.classed('node-focus', true);
  }

  unHighlight() {
    var node = d3.select(this.element);
    node.classed('node-focus', false);
  }

  closeExploreNodes() {
    this.emitEvent(EVENTS.CLOSE_EXPLORENODE, [
      [this.config.id]
    ]);
  }

  updatePosition() {
    throw "This interface is not overloaded";
  }

  unRelateRect() {
    d3.select(this.element)
      .classed('node-dash', true);
  }

  relateRect() {
    d3.select(this.element)
      .classed('node-dash', false);
  }

  attachRecommentEvent($dom) {
    $dom.on("click", function() {
      if (d3.event.defaultPrevented) return;
      this.emitEvent(EVENTS.ENTITY_RECOMMENT_MODAL, [this]);
    }.bind(this));
  }

  changeColor(color) {
    var node = d3.select(this.element)
      .style("fill", color);
  }

  updateContent(text) {
    throw "This interface is not overloaded";
  }

  destroy() {

  }
}
