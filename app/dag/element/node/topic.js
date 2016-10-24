"use strict";

import Node from './node';
let EVENTS = require("../../events");

export default class Topic extends Node {
  constructor(data) {
    super(data);
    //自适应宽度
    this.config.width = this.config.width || 60;
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
      .text(this.config.content[0].name)
      .attr("transform", function() {
        var x = this.config.width / 2;
        var y = (this.config.height - 14);
        return "translate(" + x + "," + y + ")";
      }.bind(this));

    var title = container
      .append("title")
      .text(this.config.content[0].name);

    rect.on("click", function() {
      if (d3.event.defaultPrevented) return;
      this.enterCanvas();
    }.bind(this));

    this.element = containerDom;

    this.updatePosition();
    this.attachTipEvent();
  }

  enterCanvas() {
    this.emitEvent(EVENTS.ENTER_FOLDER, [this.config.id]);
  }

  updatePosition() {
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
