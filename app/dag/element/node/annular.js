"use strict";

import Node from './node';
let EVENTS = require("../../events");
//扇形元素的绘画
export default class Annular extends Node {
  constructor(data) {
    super(data);
    if (data.isChildAnnular) {
      this.isShowPie = false;
    }
    this.isShowCtxMenu = false;
  }

  active() {
    var containerDom = document.createElementNS("http://www.w3.org/2000/svg", "g");

    var container = d3.select(containerDom);

    container
      .append("path")
      .attr("id", "element-" + this.config.id)
      .attr("fill", "#fff")
      .attr("d", this.config.d);

    container
      .append("text")
      .attr("transform", "translate(" + this.config.textX + "," + this.config.textY + ") scale(0.9)")
      .text(this.config.text);

    this.attachAnnularEvent(container);

    this.element = containerDom;

    this.attachTipEvent();
  }

  attachAnnularEvent($dom) {//圆环的鼠标事件
    if (this.isShowPie) {
      $dom.on("click", function() { //点击出现环形菜单
        this.showAnnular(this.config.centerNodeId, this.config.centerX, this.config.centerY, this.config.index);
      }.bind(this));
    }
    if (this.config.isChildAnnular) {//点击一级菜单出现二级菜单
      $dom.on("click", function() {
        this.emitEvent(EVENTS.SHOW_DETAILENTITY, [{
          nodeId: this.config.id,
          config: this.config
        }]);
        if (this.config.data.children && this.config.data.children.length > 0) {
          this.config.data.children.forEach((item) => {
            item.domainCode = this.config.centerNodeId;
          });
          this._detectDept();
          this.emitEvent(EVENTS.HIDE_MULTIPILE_DROPDOWN);
          this.emitEvent(EVENTS.SHOW_MULTIPILE_DROPDOWN, [{
            x: d3.event.layerX + "px",
            y: d3.event.layerY + "px",
            data: this.config.data.children
          }]);
          this.isPieOpen = true;
        }
      }.bind(this));
    }
  }

  _detectDept() {
    this.config.data.nameChain = this.config.nameChain;
    let queue = [this.config.data];
    while (queue.length > 0) {
      let obj = queue.shift();
      if (obj.children && obj.children.length > 0) {
        obj.children.forEach((item) => {
          item.nameChain = obj.nameChain.concat([item.name]);
          queue.push(item);
        });
      }
    }
  }

  showAnnular(nodeId, centerX, centerY, index) {
    let data = this.config.data.children || [];
    let centerRadius = (2 * index + 1) * 60 / 2;

    let startRadius = centerRadius - data.length * 60 / 2;
    startRadius = startRadius < 0 ? startRadius + 360 : startRadius;
    let result = this._genAnnularData({
      data: data,
      nodeId: nodeId,
      centerX: centerX,
      centerY: centerY,
      insideR: 110,
      outsideR: 160,
      radius: 60,
      startRadius: startRadius
    });

    this.emitEvent(EVENTS.ADD_CHILDANNULAR, [result]);
    this.emitEvent(EVENTS.SHOW_DETAILENTITY, [{
      nodeId: this.config.id,
      config: this.config
    }]);
  }
}
