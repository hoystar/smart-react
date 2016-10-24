"use strict";

import Edge from './edge';

export default class DashWithDoubleArrow extends Edge {
  constructor(data) {
    super(data);
  }

  active() {
    var lineDom = document.createElementNS("http://www.w3.org/2000/svg", "line");
    var line = d3.select(lineDom);

    line
      .attr("class", "link")
      .attr("id", "element-" + this.config.id)
      .attr("stroke-dasharray", "3,3")
      .attr("marker-start", "url(" + window.location.pathname + window.location.search + "#arrow)")
      .attr("marker-end", "url(" + window.location.pathname + window.location.search + "#arrow)");


    this.element = lineDom;

    this.updatePosition();
  }

  highlight() {
    var text = d3.select(this.element);
    text.classed("link-focus", true);
    text.attr("marker-start", "url(" + window.location.pathname + window.location.search + "#arrow-highlight)");
    text.attr("marker-end", "url(" + window.location.pathname + window.location.search + "#arrow-highlight)");
  }

  unHighlight() {
    var text = d3.select(this.element);
    text.classed("link-focus", false);
    text.attr("marker-start", "url(" + window.location.pathname + window.location.search + "#arrow)");
    text.attr("marker-end", "url(" + window.location.pathname + window.location.search + "#arrow)");
  }
}
