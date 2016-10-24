"use strict";

import $ from 'jquery';
import Node from './node';
let EVENTS = require("../../events");
//圆形，关系子集
export default class Circle extends Node {
  constructor(data) {
    super(data);
    this.menuData = [{
      name: "删除节点",
      type: "DEL"
    }];

    this.isShowPie = false;
    this.config.width = this.config.width || 60;
    this.config.height = this.config.height || 40;
    this.config.color = this.config.color ? this.config.color : "#12dec6";
  }

  active() { //插入数据
    var containerDom = document.createElementNS("http://www.w3.org/2000/svg", "g");
    var container = d3.select(containerDom);

    container
      .attr("class", "node")
      .attr("id", "element-" + this.config.id)
      .attr("transform", "translate(" + this.config.x + "," + this.config.y + ")");

    var circle = container
      .append("circle")
      .attr("r", 45)
      .style("fill", this.config.color)
      .style("opacity", "0.5");

    let text = container
      .append("text")
      .attr("class", "label")
      .text(this.config.content[0].name)
      .attr("transform", "translate(-2,15)");

    var title = container
      .append("title")
      .text(this.config.name);

    if (this.config.icon) {
      var object = container
        .append("foreignObject")
        .attr("class", "icon-container")
        .attr("transform", "translate(-10,-20)");

      object
        .append("xhtml:div")
        .attr("class", "node-container")
        .append(function() {
          var icon = $("<img src=" + this.config.icon + " height='32' width='32'/>");
          return icon[0];
        }.bind(this));
    }


    this.element = containerDom;

    this.updatePosition();

    this.attachFolderEvent(circle);
    this.attachTipEvent();

    this.menuData = ["DEL"];
    this._genCtxMenu(containerDom);
  }

  updatePosition() {
    var x = this.config.x;
    var y = this.config.y;
    var container = d3.select(this.element);
    container.attr("transform", function() {
      return "translate(" + x + "," + y + ")";
    });
  }

  attachFolderEvent($dom) {
    $dom.on("click", function() {
      var data = {
        shiftKey: d3.event.shiftKey,
        nodeId: this.config.id
      };
      this.emitEvent(EVENTS.FOLDER_NODE_CLICK, [data]);
    }.bind(this));
  }
}
