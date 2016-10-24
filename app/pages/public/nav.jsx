import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import d3 from "d3";
import { Button } from 'react-bootstrap';
import LayoutGen from '../../dag/layout/layoutGen';
var Promise = require('es6-promise').Promise;
import { message } from 'antd';
import OBJECTTYPE from "../../services/objectType.js";
let _ = require("lodash");

import './nav.css';

export default React.createClass({
    getInistialState() {
      return{
        isStretchIcon: false,
        tabsBarItem: [],
        activeKey: ""
      }
    },
	/*onClickTreeMenu(param) {
	    if (param && param.type !== OBJECTTYPE.FOLDER) {
	      let existIndex = this.state.tabsBarItem.findIndex(item => item.key === param.key);
	      if (existIndex < 0) {
	        var _tabsBarItems = _.cloneDeep(this.state.tabsBarItem);
	        _tabsBarItems.push(param);
	        this.setState({
	          tabsBarItem: _tabsBarItems
	        });
	      }
	      this.changeActiveKey(param.key);
	    }
  	},
  	onClickDeleteMenu(param) {
	    if (param && param.type === OBJECTTYPE.FOLDER) {
	      this.props.DeleteFolderViaJson({}, { folderId: param.id, parentId: param.parentId }).then((data) => {
	        if (data.data) {
	          message.success("删除文件夹成功!");
	        }
	      });
	    }
	    if (param && param.type === OBJECTTYPE.CANVAS) {
	      this.props.DeleteCanvas({}, { canvasId: param.id, parentId: param.parentId }).then((data) => {
	        message.success("删除视图成功!");
	        this.removeTabsBar(param.key);
	      });
	    }
  	},	
	changeActiveKey: function(item) {
		this.setState({ activeKey: item });
	},
	removeTabsBar: function(targetKey) {//关闭画布
		let deleteIndex = this.state.tabsBarItem.findIndex(item => item.key === targetKey);
		var _tabsBarItems = _.cloneDeep(this.state.tabsBarItem);
		_tabsBarItems.splice(deleteIndex, 1);
		if (this.state.activeKey === targetKey) {
		  if (_tabsBarItems.length > 0) {
		    if (deleteIndex > 0) {
		      this.changeActiveKey(_tabsBarItems[deleteIndex - 1].key);
		    } else {
		      this.changeActiveKey(_tabsBarItems[deleteIndex].key);
		    }
		  }
		}
		this.setState({
		  tabsBarItem: _tabsBarItems
		});
	},*/

	render(){
		return(
			<nav>
				<div className="nav-mainmenu">
					<header>哈哈哈</header>
					<ul>
						<li>1</li>
						<li>2</li>
						<li>3</li>
						<li>4</li>
					</ul>
				</div>
				<div className="nav-secondmenu">
					<h3>你好逗</h3>
					<ul>
						<li>5</li>
						<li>6</li>
						<li>7</li>
						<li>8</li>
					</ul>
				</div>
			</nav>
		);
	}
});