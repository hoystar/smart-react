"use strict";

import Node from './node';
let EVENTS = require("../../events");
//菱形，即关系
export default class Diamond extends Node {
  constructor(data) {
    super(data);
    this.menuData = [{
      name: "删除节点",
      type: "DEL"
    }];
    //自适应宽度
    this.isShowDetailCircle = false;
    this.config.width = this.config.width || 60;
    this.config.height = this.config.height || 40;
  }

  active() {
    var containerDom = document.createElementNS("http://www.w3.org/2000/svg", "g");
    var container = d3.select(containerDom);

    container
      .attr("class", "node")
      .attr("id", "element-" + this.config.id);

    var polygon = container
      .append("polygon")
      .attr("class", "diamond");

    let _tmpName = "";
    if (this.config.content[0].name.length > 4) {
      _tmpName = this.config.content[0].name.substr(0, 5) + "..";
    } else {
      _tmpName = this.config.content[0].name;
    }
    let diamondText = this.config.content.length > 1 ? ("关系" + "(" + this.config.content.length + ")") : _tmpName;

    var label = container
      .append("text")
      .attr("class", "label")
      .text(diamondText)
      .attr("transform", function() {
        var x = this.config.width / 2;
        var y = (this.config.height - 14);
        return "translate(" + x + "," + y + ")";
      }.bind(this));

    var title = container
      .append("title")
      .text(this.config.name);

    if (this.config.content.length > 1) {
      this.showDetailCircle(polygon);
    } else {
      this.attachSelectEvent(polygon);
      if (!!this.config.content[0].tagCount && this.isShowTagAble) {//isShowTagAble:外部开关，设置是否右侧按钮可点开
        this._genTagIcon(container);
      }
    }

    this.element = containerDom;

    if (this.config.content.length === 1) {
      this.menuData = ["DEL", "LINK_DETAIL"];
    } else {
      this.menuData = ["DEL"];
    }

    this._genCtxMenu(containerDom);

    this.updatePosition();

    this.hover(container);

    if (this.config.content[0].recType === 2 || this.config.content[0].recType === 3) {
      this.unRelateRect();
    }

    this.attachTipEvent();
  }

  updateContent(text) {//检测是否关系中的content长度大于1，填写关系名称
    if (this.config.content && this.config.content.length > 0) {
      this.config.content[0].name = text;
      let _tmpName = "";
      if (text.length > 4) {
        _tmpName = text.substr(0, 5) + "..";
      } else {
        _tmpName = text;
      }
      let diamondText = this.config.content.length > 1 ? ("关系" + "(" + this.config.content.length + ")") : _tmpName;
      d3.select(this.element).select("text").text(diamondText);
    }
  }

  hover(container) {
    //探索按钮
    if (this.isExploreAble) {
      container.append(function() {
        return this._genExploreBtn(container);
      }.bind(this));
    }

    container.on("mouseover", function() {
      this.focus();
    }.bind(this));
    container.on("mouseout", function() {
      this.unFocus();
    }.bind(this))
  }

  updatePosition() {
    var x = this.config.x;
    var y = this.config.y;
    var w = this.config.width || 60;
    var h = this.config.height || 40;
    var container = d3.select(this.element);
    container.attr("transform", function() {
      return "translate(" + (x - w / 2) + "," + (y - h / 2) + ")";
    });

    var _x = 0 - w / 2 + 20;
    var _y = 0 - h / 2 + 10;
    container
      .select("polygon")
      .attr("points", [_x, _y + 30, _x + 40, _y, _x + 80, _y + 30, _x + 40, _y + 60].join(","));
  }

  showDetailCircle($dom) {//点击展开隐藏复合关系
    $dom.on("click", function() {
      if (d3.event.defaultPrevented) return;
      let contents = this.config.content;

      if (this.isShowDetailCircle) {
        let nodeIds = contents.map(function(item) {
          return "diamondDetail_" + item.code;
        });
        this.emitEvent(EVENTS.REMOVE_DOMAINDETIAL, [
          nodeIds
        ]);
      } else {
        let radius = 120 / (contents.length - 1);
        let R = 60;
        let result = [];
        for (let i = 0; i < contents.length; i++) {
          var pos_x = this.config.x + Math.cos((radius * i - 60) / 180 * Math.PI) * R + 40;
          var pos_y = this.config.y + Math.sin((radius * i - 60) / 180 * Math.PI) * R
          result.push({
            x: pos_x,
            y: pos_y,
            x1: pos_x,
            y1: pos_y,
            x2: pos_x,
            y2: pos_y,
            type: 7, //圆形
            content: [contents[i]]
          })
        }
        this.emitEvent(EVENTS.SHOW_DETAILCIRCLE, [{
          nodeId: this.config.id,
          nodes: result
        }]);
      }

      this.isShowDetailCircle = !this.isShowDetailCircle;
    }.bind(this));
  }

  changeColor(color) {
    var node = d3.select(this.element)
      .select("polygon")
      .style("fill", color);
  }

  highlight() {
    var node = d3.select(this.element)
      .select("polygon")
      .classed('diamond-focus', true);
  }

  unHighlight() {
    var node = d3.select(this.element)
      .select("polygon")
      .classed('diamond-focus', false);
  }
}
