/*!
 * app-dtboost: assets/common/io.js
 * Authors  : 剪巽 <jianxun.zxl@taobao.com> (https://github.com/fishbar)
 * Create   : 2015-09-23 21:35:12
 * CopyRight 2015 (c) Alibaba Group
 */
'use strict';

var $ = require('jquery');

exports.request = function request(method, url, data, callback) {
  if (!callback && typeof data === 'function') {
    callback = data;
    data = null;
  }

  var setting = {
    url: url,
    data: data,
    type: method,
    dataType: 'json',
    error: function(xhr, textStatus, error) {
      if (xhr.responseJSON) {
        return callback && callback(xhr.responseJSON.error || xhr.responseJSON, []);
      }
      if (textStatus) {
        return callback && callback(textStatus, []);
      }
      callback && callback(null, []);
    },
    success: function(data) {
      if (data.code && data.code !== 'SUCCESS') {
        return callback && callback(data, []);
      }
      if (data.code === 'SUCCESS') {
        return callback && callback(null, data.data);
      }
      callback && callback(null, data);
    }
  };
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    setting.data = JSON.stringify(setting.data);
    setting.contentType = 'application/json; charset=utf-8';
  }
  return $.ajax(setting);
};
