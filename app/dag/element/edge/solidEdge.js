"use strict";

import Edge from './edge';

export default class SolidEdge extends Edge {
  constructor(data) {
    super(data);
  }

  active() {
    var lineDom = document.createElementNS("http://www.w3.org/2000/svg", "line");
    var line = d3.select(lineDom);

    line
      .attr("class", "link")
      .attr("id", "element-" + this.config.id);

    this.element = lineDom;
    this.updatePosition();
  }
}
