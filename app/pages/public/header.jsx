import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import d3 from "d3";
import { Button } from 'react-bootstrap';
import LayoutGen from '../../dag/layout/layoutGen';
var Promise = require('es6-promise').Promise;
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var antd = require('antd');
var Menu = antd.Menu;
var Icon = antd.Icon;
var SubMenu = Menu.SubMenu;
require('./header.css');

export default React.createClass({
  render() {
    return (
      <header className="dtboost-header">
        <a className="dtboost-logo" href="/console/pages/data_manager/introduction">
          <img src="/assets/img/logo.png" height="60"/>
          <span className="logo">
            DTBoost
          </span>
        </a>
        <div className="dtboost-header-workspace">
         <Menu mode="horizontal">
          <SubMenu key="workSpaces" title={<span className="workspaces"><i className="iconfont">&#xe623;</i><span>工作组切换</span></span>}>
          </SubMenu>
        </Menu>
        </div>
        <Menu mode="horizontal">
          <Menu.Item key="user_info">
            <span className="userinfo">
              <i className="iconfont">&#xe622;</i>
              <span>登录账户</span>
            </span>
          </Menu.Item>
          <SubMenu key="sub1" title={<span><Icon type="setting" /><span>设置</span></span>}>
            <Menu.Item key="user_manage">
              <Link
              to="/console/pages/system_config/user_manage">
              <span>系统配置</span>
            </Link>
            </Menu.Item>
            <Menu.Item key="logout">
              <a href="#" ><span>退出登录</span></a>
            </Menu.Item>
          </SubMenu>
          <Menu.Item key="system_help">
            <Icon type="question-circle-o"/>帮助
          </Menu.Item>
        </Menu>
      </header>
    )
  }
});
