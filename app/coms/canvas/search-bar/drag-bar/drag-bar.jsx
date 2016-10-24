require('./drag-bar.less');

import classnames from 'classnames';
import { Icon } from 'antd';
import React, { Component } from 'react';

let ReactDom = require('react-dom');
var baseCom = require("../../../../../../console/coms/commons/base/baseCom.jsx");
let languageProvider = require("../../../../../../console/services/language/index.js");

class DragBar extends baseCom {
  constructor(props) {
    super(props);

    this.state = {
      isMinimize: true,
      isDraging: false
    };

    this.startPos = {
      x: 0,
      y: 0
    };

    this._oldHeight = 35;
    this.clickTime = 0;
    this.element = null;
    this.MOUSE_CLICK_INTERVAL = 300;
  }

  startDrag(e) {
    this.startPos = {
      top: parseInt($(this.element).css("top")),
      left: parseInt($(this.element).css("left")),
      x: e.clientX,
      y: e.clientY
    }

    this.setState({ isDraging: true });
  }

  minimize() {
    var dBox = ReactDom.findDOMNode(this);
    this._oldHeight = $(dBox).height();

    $(dBox).animate({
      width: "35px",
      height: "35px"
    }, function() {
      $(dBox).css("overflow", "hidden");
    });

    this.setState({
      isMinimize: true
    });
  }

  maximize() {
    var dBox = ReactDom.findDOMNode(this);

    $(dBox).animate({
      width: "350px",
      height: this._oldHeight + "px"
    }, function() {
      var left = parseInt($(this.element).css("left"));
      var top = parseInt($(this.element).css("top"));
      var location = this.caculateLocation(left, top);

      $(dBox).css({
        "overflow": "auto",
        "height": "auto",
        "left": location.x,
        "top": location.y
      });
    }.bind(this));

    this.setState({
      isMinimize: false
    });
  }

  minboxMouseDown(e) {
    this.startDrag(e);
    this.clickTime = new Date().getTime();
  }

  minboxMouseUp(e) {
    if (new Date().getTime() - this.clickTime < this.MOUSE_CLICK_INTERVAL) {
      this.maximize();
    }
  }

  caculateLocation(currentX, currentY) {
    var result = {
      x: currentX,
      y: currentY
    }

    var dBox = ReactDom.findDOMNode(this);
    var parentDom = dBox.parentNode.parentNode;

    var computedStyle = document.defaultView.getComputedStyle(this.element, null);
    var docWidth = $(parentDom).width();
    var docHeight = $(parentDom).height();
    var boxWidth = $(dBox).width();
    var boxHeight = $(dBox).height();
    var maxLeft = Math.abs(parseInt(computedStyle.marginLeft));
    var maxTop = Math.abs(parseInt(computedStyle.marginTop));

    if (currentX <= maxLeft) {
      result.x = maxLeft + "px";
    } else if (currentX >= (docWidth + maxLeft - boxWidth)) {
      result.x = (docWidth + maxLeft - boxWidth) + "px";
    } else {
      result.x = currentX + "px";
    }
    if (currentY <= maxTop) {
      result.y = maxTop + "px";
    } else if (currentY >= (docHeight + maxTop - boxHeight)) {
      result.y = (docHeight + maxTop - boxHeight) + "px";
    } else {
      result.y = currentY + "px";
    }

    return result;
  }

  componentDidMount() {
    this.element = ReactDom.findDOMNode(this);

    $(document).on("mousemove.dragBar", function(e) {
      if (!this.state.isDraging) return;

      var currentLeft = this.startPos.left + (e.clientX - this.startPos.x);
      var currentTop = this.startPos.top + (e.clientY - this.startPos.y);
      var location = this.caculateLocation(currentLeft, currentTop);

      $(this.element).css({
        left: location.x,
        top: location.y
      })
    }.bind(this));

    $(document).on("mouseup.dragBar", function(e) {
      this.setState({ isDraging: false });
    }.bind(this));
  }

  componentWillUnmount() {
    $(document).off("mousemove.dragBar");
    $(document).off("mouseup.dragBar");
  }

  render() {
    if (this.state.isMinimize) {
      return (
        <div className="search-bar">
          <div className="minimize-content-box" onMouseDown={this.minboxMouseDown.bind(this)} onMouseUp={this.minboxMouseUp.bind(this)}>
            <i className="iconfont">&#xe610;</i>      
          </div>
        </div>
      );
    } else {
      return (
        <div className="search-bar">
          <i className="iconfont search-bar-icon drag-icon" title={languageProvider["smartview.canvas_drag_bar.drag_window"] || "拖动窗口"} onMouseDown={this.startDrag.bind(this)}>&#xe612;</i>
          <i className="iconfont search-bar-icon mini-icon" title={languageProvider["smartview.canvas_drag_bar.minimize_window"] || "最小化"} onClick={this.minimize.bind(this)}>&#xe611;</i>
          <div className="search-bar-children">
            {this.props.children}
          </div>        
        </div>
      );
    }
  }
}

module.exports = DragBar;
