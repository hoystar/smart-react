"use strict";

import Node from './node';
//椭圆，type为7的
export default class Ellipse extends Node {
  constructor(data) {
    super(data);
    //自适应宽度
    this.config.width = this.config.width || 30;
    this.config.height = this.config.height || 20;
  }

  active() {
    var containerDom = document.createElementNS("http://www.w3.org/2000/svg", "g");
    var container = d3.select(containerDom);

    container
      .attr("class", "node circle")
      .attr("id", "element-" + this.config.id);

    var ellipse = container
      .append("ellipse")
      .attr("rx", 30)
      .attr("ry", 20);

    var label = container
      .append("text")
      .attr("class", "label")
      .text(this.config.content[0].name)
      .attr("transform", function() {
        return "translate(" + 0 + "," + 6 + ")";
      }.bind(this));

    var title = container
      .append("title")
      .text(this.config.name);

    this.element = containerDom;

    this.updatePosition();

    this.menuData = ["LINK_DETAIL"];
    this._genCtxMenu(containerDom);

    this.attachTipEvent();
    this.attachSelectEvent(ellipse);
    if (!!this.config.content[0].tagCount) {
      this._genTagIcon(container);
    }
  }

  updatePosition() {
    var x = this.config.x;
    var y = this.config.y;
    var container = d3.select(this.element);
    container.attr("transform", function() {
      return "translate(" + x + "," + y + ")";
    });
  }
}
