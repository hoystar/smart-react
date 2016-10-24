"use strict";

import Edge from './edge';

export default class FlowEdgeArrow extends Edge {
  constructor(data) {
    super(data);
    this.hasArrow = true;
  }

  active() {
    var lineDom = document.createElementNS("http://www.w3.org/2000/svg", "line");
    var line = d3.select(lineDom);

    line
      .attr("class", "link")
      .attr("id", "element-" + this.config.id)
      .attr("marker-end", "url(" + window.location.pathname + window.location.search + "#arrow)");

    line.classed("link-weight", true);

    this.hover(line);
    this.attachClickEvent(line);
    this.element = lineDom;
    this.updatePosition();
  }

  hover(container) {
    var self = this;
    container.on("mouseover", function() {
      this.highlight();

    }.bind(this));
    container.on("mouseout", function() {
      this.unHighlight();
    }.bind(this))
  }

  highlight() {
    var text = d3.select(this.element);
    text.classed("link-focus", true);
    text.attr("marker-end", "url(" + window.location.pathname + window.location.search + "#arrow-highlight)");
  }

  unHighlight() {
    var text = d3.select(this.element);
    text.classed("link-focus", false);
    text.attr("marker-end", "url(" + window.location.pathname + window.location.search + "#arrow)");
  }

  attachClickEvent($dom) {
    $dom.on("click", function() {
      this.showDeleteBtn();
    }.bind(this));
  }
}
