"use strict";

import Node from './node';
let EVENTS = require("../../events");
//各个节点
export default class Rect extends Node {
  constructor(data) {
    super(data);
    //自适应宽度
    this.config.width = Math.min(this.config.content[0].name.toString().length * 16 + 10, 155);
    this.config.height = this.config.height || 40;
  }

  active() {
    var containerDom = document.createElementNS("http://www.w3.org/2000/svg", "g");
    var container = d3.select(containerDom);

    container
      .attr("class", "node")
      .attr("id", "element-" + this.config.id);

    var rect = container
      .append("rect")
      .attr("class", "rect")
      .attr("width", this.config.width)
      .attr("height", this.config.height)
      .attr("rx", 5).attr("ry", 5);

    var label = container
      .append("text")
      .attr("class", "label")
      .text(function() {
        let _name = this.config.content[0].name;
        _name = _name.length > 12 ? _name.substr(0, 4) + "..." + _name.substr(_name.length - 4, _name.length) : _name;
        return _name
      }.bind(this))
      .attr("transform", function() {
        var x = this.config.width / 2;
        var y = (this.config.height - 14);
        return "translate(" + x + "," + y + ")";
      }.bind(this));

    var title = container
      .append("title")
      .text(this.config.content[0].name);

    this.hover(container);

    this.menuData = ["DEL", "ENTITY_DETAIL"];
    this._genCtxMenu(containerDom);//设置右击鼠标出现菜单中，给选项绑定其所在的节点信息

    if (!!this.config.content[0].tagCount && this.isShowTagAble) {
      this._genTagIcon(container);
    }

    this.element = containerDom;

    this.updatePosition();

    if (this.config.content[0].recType === 2 || this.config.content[0].recType === 3) {
      this.attachRecommentEvent(rect);
      this.unRelateRect();
    }

    this.attachTipEvent();
    this.attachSelectEvent(rect);
  }

  hover(container) {
    var self = this;
    //探索按钮
    if (this.isExploreAble && this.config.detectable) {
      container.append(function() {
        return this._genExploreBtn(container);
      }.bind(this));
    }

    container.on("mouseover", function() {
      self.focus();
    }.bind(this));
    container.on("mouseout", function() {
      self.unFocus();
    }.bind(this))
  }

  updatePosition() { //确定元素位置
    var x = this.config.x;
    var y = this.config.y;
    var width = this.config.width || 60;
    var height = this.config.height || 40;
    var container = d3.select(this.element);
    container.attr("transform", function() {
        return "translate(" + (x - width / 2) + "," + (y - height / 2) + ")";
      })
      .attr("cx", function() {
        return x
      })
      .attr("cy", function() {
        return y
      });
  }

  updateContent(text) {//如果名称太长，进行缩减
    if (this.config.content && this.config.content.length > 0) {
      this.config.content[0].name = text;
      var _name = text.length > 12 ? text.substr(0, 4) + "..." + text.substr(text.length - 4, text.length) : text;
      d3.select(this.element).select("text").text(_name);
    }
  }

  changeColor(color) {
    var node = d3.select(this.element)
      .select(".rect")
      .style("fill", color);
  }

  highlight() {
    var node = d3.select(this.element)
      .select(".rect")
      .classed('rect-focus', true);
  }

  unHighlight() {
    var node = d3.select(this.element)
      .select(".rect")
      .classed('rect-focus', false);
  }
}
