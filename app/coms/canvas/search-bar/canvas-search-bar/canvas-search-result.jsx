require('./canvas-search-result.less');
var React = require('react');
let ReactDom = require('react-dom');
var baseCom = require("../../../../../../console/coms/commons/base/baseCom.jsx");
let languageProvider = require("../../../../../../console/services/language/index.js");
let SearchBox = require("../search-box/search-box.jsx");

import { message, Button } from 'antd';
import classnames from 'classnames';

class SearchResult extends baseCom {
  constructor(props) {
    super(props);

    this.isDraging = false;
    this._timer = null;
  }

  dragStart(item, event) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraging = true;

    var data = {
      x: event.clientX,
      y: event.clientY,
      data: [item]
    };

    this.props.onDragItem(data);
  }

  dragEnd(item) {
    item.isSelected = !!!item.isSelected;
    this.isDraging = false;
  }

  creeateObjectDom(type) {
    var dragBtnClass = classnames({
      'drag-btn': true,
      'blue': type === "ListEntities",
      'green': type === "ListLinks"
    });
    var url = type === "ListEntities" ? "/page/smartview/entityPage?code=" : "/page/smartview/linkPage?code=";

    var elitems = this.props.result.map(function(item) {
      var href_url = url + item.id;
      return (
        <div className="result-item" key={item.itemKey}>
          <p className="result-item-row">
            <a href={href_url} target="_blank">{item.name}</a>
            <button className={dragBtnClass} id={item.id} onMouseDown={this.dragStart.bind(this,item)} 
                    onMouseUp={this.dragEnd(item)}><span data-i18n="smartview.canvas_search_result.btn_drag_add">拖动添加</span></button>
          </p>
          <p className="result-item-row">
            <label data-i18n="smartview.canvas_search_result.description">描述</label>
            <span className="text des">{item.description}</span>
          </p>
          <p className="result-item-row">
            <span className="field field-2">
              <label data-i18n="smartview.canvas_search_result.bussness_style">业务分类</label>
              <span className="text">-</span>
            </span>
            <span className="field field-2">
              <label data-i18n="smartview.canvas_search_result.first_relation">一度关系</label>
              <span className="text">-</span>
            </span>
          </p>
          <p className="result-item-row">
            <span className="field field-2">
              <label data-i18n="smartview.canvas_search_result.cover_tables_count">覆盖表数</label>
              <span className="text">-</span>
            </span>
            <span className="field field-2">
              <label data-i18n="smartview.canvas_search_result.principal">负责人</label>
              <span className="text">-</span>
            </span>
          </p>
        </div>
      );
    }.bind(this));

    return (
      <div className="result-box">
        {elitems}
      </div>
    );
  }

  creeateTagsDom() {
    var tagsItems = this.props.result.map(function(item) {
      var href_url = "/page/smartview/tagsPage?tagCode=" + item.tagCode + "&entityCode=''";
      return (
        <div className="result-item" key={item.itemKey}>
          <p className="result-item-row">
            <a href={href_url} target="_blank">{item.tagName}</a>
          </p>
          <p className="result-item-row">
            <label data-i18n="smartview.canvas_search_result.description">描述</label>
            <span className="text des">{item.description}</span>
          </p>
          <div className="info-box">
            <p className="result-item-row">
              <span className="field field-2">
                <label data-i18n="smartview.canvas_search_result.owner_entity_link">所属实体/关系</label>
                <span className="text">-</span>
              </span>
              <span className="field field-2">
                <label data-i18n="smartview.canvas_search_result.bussness_style">业务分类</label>
                <span className="text">-</span>
              </span>
            </p>
            <p className="result-item-row">
              <span className="field field-2">
                <label data-i18n="smartview.canvas_search_result.data_type">取值类型/数据类型</label>
                <span className="text">-</span>
              </span>
              <span className="field field-2">
                <label data-i18n="smartview.canvas_search_result.principal">负责人</label>
                <span className="text">-</span>
              </span>
            </p>
            <div className="entity-box">
              {this.creeateTagsBtnDom(item,1)}
            </div>
            <div className="link-box">
              {this.creeateTagsBtnDom(item,2)}
            </div>            
          </div>
        </div>
      );
    }.bind(this));

    return (
      <div className="result-box mark-result-box">
          {tagsItems}
        </div>
    );
  }

  creeateTagsBtnDom(data, domainType) {
    if (data && data.domains) {
      var tagsBtnClass = classnames({
        'drag-btn': true,
        'blue': domainType === 1,
        'green': domainType !== 1
      });

      var tagsBtn = data.domains.map(function(item) {
        if (item.domainType === domainType) {
          var btnKey = item.id + "-" + data.tagCode;
          return (
            <button className={tagsBtnClass} key={btnKey} onMouseDown={this.dragStart.bind(this,item)} 
              onMouseUp={this.dragEnd(item)}>{item.name}</button>
          );
        }
      }.bind(this));
      return tagsBtn;
    }
    return null;
  }

  render() {
    let currentTag = this.props.searchBarCtrl.currentTag;
    switch (currentTag) {
      case "ListEntities":
      case "ListLinks":
        return this.creeateObjectDom(currentTag);
      case "SearchMarkedTagDomains":
        return this.creeateTagsDom();
      default:
        return this.creeateObjectDom(currentTag);
    }
  }
}

module.exports = SearchResult;
