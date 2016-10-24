require("./canvas-search-bar.less");

import React, { Component } from 'react';
import { Tabs, Select } from 'antd';
import searchBarCtrl from "../../../../services/search-bar-ctrl/search-bar-ctrl";
const Option = Select.Option;

let ReactDom = require('react-dom');
let DragBar = require("../drag-bar/drag-bar.jsx");
let SearchBox = require("../search-box/search-box.jsx");
let SearchResult = require("./canvas-search-result.jsx");
let languageProvider = require("../../../../../../console/services/language/index.js");
var baseCom = require("../../../../../../console/coms/commons/base/baseCom.jsx");

const TabPane = Tabs.TabPane;

class CanvasSearchBar extends baseCom {
  constructor(props) {
    super(props);

    this.searchBar = searchBarCtrl;
    this.state = {
      searchResult: []
    };
  }

  search(searchText) {
    this.searchBar.keyword = searchText;
    this.searchBar.search().then(function() {
      var newState = {
        searchResult: this.searchBar.result
      };
      this.setState(newState);
    }.bind(this)).catch(function(err) {
      let errorText = _.get(err, "errorMessage") || languageProvider["smartview.canvas_search_bar.search_error"] || "搜索出错";
      message.error(errorText);
    }.bind(this));
  }

  changeNav(key) {
    this.searchBar.changeTag(key);
    var newState = {
      searchResult: this.searchBar.result
    };
    this.setState(newState);
  }

  dragItem(data) {
    var element = ReactDom.findDOMNode(this);
    let _pos = $(element).offset();

    var dagItem = {
      x: data.x,
      y: data.y,
      left: _pos.left,
      top: _pos.top,
      searchBarX1: _pos.left,
      searchBarY1: _pos.top,
      searchBarX2: _pos.left + $(element).width(),
      searchBarY2: _pos.top + $(element).height(),
      data: data.data
    };

    this.props.dragDagItem(dagItem);
  }

  render() {
    return (
      <DragBar>
        <div className="container-search-bar">
          <Tabs onChange={this.changeNav.bind(this)} type="card">
          {this.searchBar.navs.map(pane => 
            <TabPane tab={pane.text} key={pane.value}>
              <SearchBox placeholder={languageProvider["smartview.canvas_search_bar.search_key_words"] || "输入关键字搜索，如电"} onSearch={this.search.bind(this)} />
              <SearchResult onDragItem={this.dragItem.bind(this)} searchBarCtrl={this.searchBar} result={this.state.searchResult} />
            </TabPane>
          )}        
          </Tabs>    
        </div> 
      </DragBar>
    );
  }
}

module.exports = CanvasSearchBar;
