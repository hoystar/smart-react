"use strict";

import Rect from './node/rect';
import Diamond from './node/diamond';
import Annular from './node/annular';
import Ellipse from './node/ellipse';
import Circle from './node/circle';
import Topic from './node/topic';
import SolidEdge from './edge/solidEdge';
import DashWithSingleArrow from './edge/dashWithSingleArrow';
import DashWithDoubleArrow from './edge/dashWithDoubleArrow';
import FlowEdgeArrow from './edge/flowEdgeArrow';
import TYPE from './type';

module.exports = function(data) { //根据type类型判断节点是实体还是关系，是画实线还是箭头
  var rstElement = null;
  if (data.elementType === TYPE.ElementType.ELEMENT_TYPE_NODE) {
    switch (data.type) {
      case TYPE.NodeType.NODE_TYPE_RECT:
        rstElement = new Rect(data);
        break;
      case TYPE.NodeType.NODE_TYPE_DIAMOND:
        rstElement = new Diamond(data);
        break;
      case TYPE.NodeType.NODE_TYPE_ANNULAR:
        rstElement = new Annular(data);
        break;
      case TYPE.NodeType.NODE_TYPE_CIRCLE:
        rstElement = new Circle(data);
        break;
      case TYPE.NodeType.NODE_TYPE_TOPIC:
        rstElement = new Topic(data);
        break;
      case TYPE.NodeType.NODE_TYPE_ELLIPSE:
        rstElement = new Ellipse(data);
        break;
      default:
        rstElement = new Rect(data);
        break;
    }
  } else if (data.elementType === TYPE.ElementType.ELEMENT_TYPE_EDGE) {
    switch (data.type) {
      case TYPE.EdgeType.EDGE_TYPE_SOLID:
        rstElement = new SolidEdge(data);
        break;
      case TYPE.EdgeType.EDGE_TYPE_DASHWITHSINGLEALLOW:
        rstElement = new DashWithSingleArrow(data);
        break;
      case TYPE.EdgeType.EDGE_TYPE_DASHWITHDOUBLEALLOW:
        rstElement = new DashWithDoubleArrow(data);
        break;
      case TYPE.EdgeType.EDGE_TYPE_FLOW:
        rstElement = new FlowEdgeArrow(data);
        break;
      default:
        rstElement = new SolidEdge(data);
        break;
    }
  }

  return rstElement;
}
