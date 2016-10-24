"use strict";

var EventEmitter = require("wolfy87-eventemitter");
//一些要调用的公用函数
export default class Element {
  constructor(data) { 
    this.id = data.id;
    this.type = null;
    this.element = null;
    this.eventProxy = new EventEmitter();
  }

  hide() {
    //d3.select(this.element).attr("hidden", true);
    d3.select(this.element).attr("display", "none");
  }

  show() {
    d3.select(this.element).attr("display", "inline");
  }

  neighBor() {
    throw "This interface is not overloaded";
  }

  updatePosition() {
    throw "This interface is not overloaded";
  }

  emitEvent(event, data) {
    return this.eventProxy.emitEvent(event, data);
  }

  on(event, func) {
    this.eventProxy.on(event, func);
  }

  removeAllListeners() {
    return this.eventProxy.removeAllListeners();
  }
}
