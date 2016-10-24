require("./mask-layout.less");

let ReactDom = require('react-dom');
var baseCom = require("../../../../../console/coms/commons/base/baseCom.jsx");
let CanvasSearchBar = require("../search-bar/canvas-search-bar/canvas-search-bar.jsx");
let consts = require("../../../services/consts");

import classnames from 'classnames';

class MaskLayout extends baseCom {
  constructor(props) {
    super(props);

    this.state = {
      eventType: null,
      data: [],
      left: 0,
      top: 0,
      currentX: 0,
      currentY: 0,
      flag: false
    };

    this.searchBarRange = [];
  }

  updatePosition(x, y) {
    $(ReactDom.findDOMNode(this)).find(".rect-box").css({
      left: x + "px",
      top: y + "px"
    })
  }

  onDragItem(data) {
    var element = ReactDom.findDOMNode(this);
    let _pos = $(element).offset();

    $(ReactDom.findDOMNode(this)).find(".mask-layout").css("display", "block");
    var newState = {};
    newState.flag = true;
    newState.data = data.data;
    newState.eventType = this.props.searchType;
    newState.top = _pos.top;
    newState.left = _pos.left;
    this.updatePosition(data.x - _pos.left, data.y - _pos.top);
    this.searchBarRange = [data.searchBarX1, data.searchBarY1, data.searchBarX2, data.searchBarY2];
    this.setState(newState);
  }

  move(event) {
    var e = event ? event : window.event;
    if (this.state.flag) {
      this.updatePosition(e.clientX - this.state.left, e.clientY - this.state.top);
    }
  }

  endDrag(event) {
    var e = event ? event : window.event;
    $(ReactDom.findDOMNode(this)).find(".mask-layout").css("display", "none");
    if (this.state.flag) {
      this.addItem(e.clientX, e.clientY);
      var newState = {};
      newState.flag = false;
      newState.data = [];
      this.setState(newState);
    }
  }

  addItem(x, y) {
    //在搜索框内拖动
    if (x > this.searchBarRange[0] && y > this.searchBarRange[1] && x < this.searchBarRange[2] && y < this.searchBarRange[3]) {
      return;
    }

    var result = this.state.data.map(function(item, index) {
      return {
        id: item.id,
        dsId: item.dsId,
        type: item.type,
        width: 60,
        height: 40,
        name: item.name,
        x: x,
        y: y + index * 90
      }
    });

    var _addItem = {
      x: x,
      y: y,
      eventType: this.state.eventType,
      data: {
        nodes: result,
        links: []
      }
    };

    this.props.addItemToLayout(_addItem);
  }

  componentDidMount() {
    var dMask = ReactDom.findDOMNode(this);
    $(dMask).on("mousemove.maskLayout", (e) => { this.move(e); });
    $(dMask).on("mouseup.maskLayout", (e) => { this.endDrag(e); });

  }

  componentWillUnmount() {
    var dMask = ReactDom.findDOMNode(this);
    $(dMask).off("mousemove.maskLayout");
    $(dMask).off("mouseup.maskLayout");
  }

  render() {
    var rectItem = this.state.data.map(function(item) {
      var itemClass = classnames({
        'rect-item': true,
        'blue': item.type === consts.MASK_LAYOUT_TYPE.ENTITY,
        'green': item.type === consts.MASK_LAYOUT_TYPE.LINK,
        'purple': item.type === consts.MASK_LAYOUT_TYPE.TAG
      });
      return <div className={itemClass} key={item.id}>{item.name}</div>
    });

    return (
      <div>
          <CanvasSearchBar dragDagItem={this.onDragItem.bind(this)}/>
          <div className="mask-layout">
            <div className="rect-box">
              {rectItem}
            </div>
          </div>
      </div>
    );
  }
}

module.exports = MaskLayout;
