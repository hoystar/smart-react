"use strict";

var EventEmitter = require("wolfy87-eventemitter");
import ElementGen from './element/elementGen';
import EVENTS from './events';
import TYPE from './element/type';

export default class Dataset {
  constructor(option) {
    this.canvasId = option.canvasId;
    //this.modifiedVersion = option.modifiedVersion;
    this.layout = {};
    this.elements = [];
    this.eventProxy = new EventEmitter();
  }

  setLayout(key, value) {
    this.layout[key] = value;
  }

  addElement(config) { //添加元素
    if (this.isElementExist(config.id)) {  //config.id:identifier
      return this.findElement(config.id);
    }

    if (config.elementType === TYPE.ElementType.ELEMENT_TYPE_EDGE) {
      var sourceNode = this.findElement(config.source);
      var targetNode = this.findElement(config.target);
      if (sourceNode === undefined || targetNode === undefined) {
        return;
      }
      config.source = sourceNode.config;
      config.target = targetNode.config;
    }

    var element = new ElementGen(config);
    this.elements.push(element);
    this.eventProxy.emitEvent(EVENTS.DATASET_ADD_ELEMENT, [element]);
    return element;
  }

  addElements(data) {//检索data中的每个item，向画布中添加
    var result = [];
    data.forEach(function(item) {
      var addElement = this.addElement(item);
      result.push(addElement);  //addElement:identifier
    }.bind(this));
    return result;
  }

  removeElement(id) { //删除元素
    this.elements.forEach(function(item, index) {
      if (item.config.id === id) {
        this.eventProxy.emitEvent(EVENTS.DATASET_REMOVE_ELEMENT, [item]);
        return this.elements.splice(index, 1);
      }
    }.bind(this));

    return undefined;
  }

  removeElements(ids) {
    var result = [];
    ids.forEach(function(id) {
      var removeElement = this.removeElement(id);
      result.push(removeElement);
    }.bind(this));

    return result;
  }

  findElement(id) { //id:identifier //查找节点元素
    //console.log(this.elements);
    var element = this.elements.filter(function(item) {
      return item.config.id === id;
    });

    if (element && element.length > 0) {
      return element[0];
    }
    return undefined;
  }

  findElements(ids) { //根据数组集ids，即ID，查找每个id所在的节点元素
    var result = [];
    ids.forEach(function(id) {
      var element = this.findElement(id);
      result.push(element);
    }.bind(this));
    return result;
  }

  getElementsByType(type) { //type:1
    //console.log(this.elements); //this.elements:每个元素及关系及关系线的基本信息
    var result = this.elements.filter(function(item) {
      return item.type === type; //设置每个元素的type
    });

    return result;
  }

  isElementExist(id) { //id:identifier//判断此id所在的节点元素存在与否
    var element = this.findElement(id);
    if (element) {
      return true;
    }

    return false;
  }

  neighborElements(id) {
    throw "This interface is not overloaded";
  }

  clear() { //清空布局，画布还在
    this.eventProxy.removeAllListeners();
    this.layout = {};
    //this.modifiedVersion = null;
    this.elements = [];
  }
}
