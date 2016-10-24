"use strict";

import $ from 'jquery';
import Element from '../element';
var EventEmitter = require("wolfy87-eventemitter");
let TYPE = require("../type");
let EVENTS = require("../../events");

export default class Edge extends Element {
  constructor(data) {
    super(data);
    this.type = TYPE.ElementType.ELEMENT_TYPE_EDGE;
    this.config = data;
    this.hasArrow = false;
    this.eventProxy = new EventEmitter();
  }

  active() {
    throw "This interface is not overloaded";
  }

  highlight() {
    var text = d3.select(this.element);
    text.classed("link-focus", true);
  }

  unHighlight() {
    var text = d3.select(this.element);
    text.classed("link-focus", false);
  }

  updatePosition(nodeId, x, y) {
    if (nodeId) {
      var config = null;
      if (this.config.target.id === nodeId) {
        config = this.config.target;
      } else if (this.config.source.id === nodeId) {
        config = this.config.source;
      }

      config.x = x;
      config.y = y;
    }

    var targetPosition = this.config.target;
    if (this.hasArrow) {
      targetPosition = this._calculateTarget();
    }

    d3.select(this.element)
      .attr("x1", this.config.source.x)
      .attr("y1", this.config.source.y)
      .attr("x2", targetPosition.x)
      .attr("y2", targetPosition.y);
  }

  //计算出交集的点，以便箭头展示
  _calculateTarget() {
    var x1 = this.config.source.x;
    var x2 = this.config.target.x;
    var y1 = this.config.source.y;
    var y2 = this.config.target.y;
    var w1 = this.config.source.width;
    var w2 = this.config.target.width + 40;
    var h1 = this.config.source.height;
    var h2 = this.config.target.height + 40;

    var pos1 = null;
    var pos2 = null;

    if (x2 - x1 === 0 && y2 - y1 !== 0) {
      //斜率不存在
      pos1 = {
        x: x2,
        y: y2 + h2 / 2
      };
      pos2 = {
        x: x2,
        y: y2 - h2 / 2
      };
    } else if (y2 - y1 === 0 && x2 - x1 !== 0) {
      //斜率为0
      pos1 = {
        x: x2 + w2 / 2,
        y: y2
      };
      pos2 = {
        x: x2 - w2 / 2,
        y: y2
      };
    } else if (y2 - y1 === 0 && x2 - x1 === 0) {
      //回环
      return {
        x: this.config.target.x,
        y: this.config.target.y
      }
    } else {
      var k = (y2 - y1) / (x2 - x1);
      var a = y1 - k * x1;
      var pos1_1, pos1_2, pos2_1, pos2_2;
      if (k > 0) {
        pos1_1 = {
          x: x2 - w2 / 2,
          y: k * x2 + a
        }
        pos1_2 = {
          x: ((y2 + h2 / 2) - a) / k,
          y: y2 + h2 / 2
        }
        pos2_1 = {
          x: x2 + w2 / 2,
          y: k * x2 + a
        }
        pos2_2 = {
          x: ((y2 - h2 / 2) - a) / k,
          y: y2 - h2 / 2
        }
      } else {
        pos1_1 = {
          x: x2 - w2 / 2,
          y: k * x2 + a
        }
        pos1_2 = {
          x: ((y2 - h2 / 2) - a) / k,
          y: y2 - h2 / 2
        }
        pos2_1 = {
          x: x2 + w2 / 2,
          y: k * x2 + a
        }
        pos2_2 = {
          x: ((y2 + h2 / 2) - a) / k,
          y: y2 + h2 / 2
        }
      }

      var l1_1 = (pos1_1.x - x2) * (pos1_1.x - x2) + (pos1_1.y - y2) * (pos1_1.y - y2);
      var l1_2 = (pos1_2.x - x2) * (pos1_2.x - x2) + (pos1_2.y - y2) * (pos1_2.y - y2);
      pos1 = l1_1 < l1_2 ? pos1_1 : pos1_2;
      var l2_1 = (pos2_1.x - x2) * (pos2_1.x - x2) + (pos2_1.y - y2) * (pos2_1.y - y2);
      var l2_2 = (pos2_2.x - x2) * (pos2_2.x - x2) + (pos2_2.y - y2) * (pos2_2.y - y2);
      pos2 = l2_1 < l2_2 ? pos2_1 : pos2_2;
    }

    //算出了2个交点
    var l1 = (pos1.x - x1) * (pos1.x - x1) + (pos1.y - y1) * (pos1.y - y1);
    var l2 = (pos2.x - x1) * (pos2.x - x1) + (pos2.y - y1) * (pos2.y - y1);

    var result = l1 < l2 ? pos1 : pos2;
    return result;
  }

  changeColor(color) {
    var node = d3.select(this.element)
      .style("stroke", color);
  }

  showDeleteBtn() {
    var targetPosition = this._calculateTarget();
    var x = (this.config.source.x + this.config.target.x) / 2;
    var y = (this.config.source.y + this.config.target.y) / 2;
    var objectDom = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    var object = d3.select(objectDom)
      .attr("class", "link-delete-btn")
      .attr("transform", "translate(" + x + "," + y + ")");
    object
      .append("xhtml:div")
      .attr("class", "close-container")
      .append(function() {
        var icon = $("<i class='iconfont draw-close-btn'>&#xe613;</i>");
        icon.click(function() {
          this.eventProxy.emitEvent(EVENTS.DELETE_FLOW);
        }.bind(this));

        return icon[0];
      }.bind(this));

    var result = {
      data: this.config,
      close: objectDom
    };

    this.eventProxy.emitEvent(EVENTS.SHOW_DELETE_BTN, [result]);
  }
}
