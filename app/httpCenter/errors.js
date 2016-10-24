'use strict';

var antd = require('antd');
var notification = antd.notification;
var consts = require('../consts');

// 参数错误配置
var paramErrorMap = {
  port: {name: '端口', message: '端口名必须由纯数字组成'},
  schema_code: {name: '云计算资源标识', message: '云计算资源标识最长128位，由字母开头字母和数字、下划线的组合'},
  host: {name: '域名/IP', message: '域名和主机输入错误'},
  database: {name: '库名', message: '数据库名称输入错误'}
};

// 通用错误提示
var commonErrorMap = {
  GET_USER_ERROR: '获取用户失败，请检查是否登录或有tenantId',
  NO_DATA_ERROR: '没有数据返回',
  SCHEMA_DUPLICATE_ERROR: '这个云计算资源标识已存在'
};

// 特殊错误提示
var errorDetailMap = {
  // summary
  getSummary: {
    title: '获取统计信息失败'
  },

  // schema
  addSchema: {
    title: '添加云计算资源失败'
  },
  deleteSchema: {
    title: '删除云计算资源失败'
  },
  editSchema: {
    title: '更新云计算资源失败'
  },
  syncedTags: {
    title: '获取已同步标签失败'
  },
  deleteSyncedTags: {
    title: '取消同步失败'
  },

  // object
  addObject: {
    title: '添加实体失败'
  },
  getObjectList: {
    title: '获取实体列表失败'
  },
  getStorages: {
    title: '获取本实体关联的表失败',
    LOGIC_ERROR: '该实体下无关联的表'
  },
  getLinkDetail: {
    title: '获取本关系对应的表失败'
  },
  getFieldSuitableType: {
    title: '获取最小兼容类型列表失败'
  },
  changeObjectColumn: {
    title: '更新实体键对应的列失败'
  },
  addObjectColumn: {
    title: '为实体关联新的表失败'
  },
  deleteObjectColumn: {
    title: '删除实体关联表失败'
  },

  // link
  getLinkList: {
    title: '获取关系列表失败'
  },
  createLink: {
    title: '创建关系失败'
  },
  addLinkStorage: {
    title: '创建关系对应的表失败'
  },
  editLinkStorage: {
    title: '更新关系对应的表失败'
  },

  // data-type
  getDataType: {
    title: '获取最小识别类型失败'
  },

  // schema
  getSchemaList: {
    title: '获取云计算资源列表失败'
  },
  querySchemaTable: {
    title: '获取云计算资源下的表失败'
  },
  objectDescTable: {
    title: '获取表详情失败'
  },
  schemaDescTable: {
    title: '获取表详情失败'
  },

  // tag
  getEntityTagList: {
    title: '获取本实体下的标签列表失败'
  },
  deleteTags: {
    title: '删除标签失败'
  },
  addTag: {
    title: '添加标签失败'
  },
  editTag: {
    title: '编辑标签失败'
  },
  querySchemaEntities: {
    title: '获取本云计算资源下关联的实体失败'
  },
  getTagsByIds: {
    title: '获取标签详情失败'
  },

  // category
  getCategories: {
    title: '获取类目列表失败'
  },
  createCat: {
    title: '创建类目失败'
  },
  editCat: {
    title: '编辑类目失败'
  },
  delCat: {
    title: '删除类目失败'
  }
};

exports.process = function (name, error) {
  let errDetail = errorDetailMap[name] || {title: '网络请求出错'};

  if (typeof error === 'string') {
    return notification.error({
      message: errDetail.title,
      description: error,
      duration: consts.NOTIFICATION_DURATION
    });
  }
  if (!error.code) {
    return notification.error({
      message: errDetail.title,
      description: '无',
      duration: consts.NOTIFICATION_DURATION
    });
  }

  let description = null;
  if (error.code === 'PARAM_ERROR') {
    let message = error.message || [];
    if (typeof message === 'string' && !description)  {
      description = message;
    }
    if (!message.length) message = [];
    if (!description) {
      description = '参数错误: ' + message.map(m => {
        let p = paramErrorMap[m.field] || {};
        return '参数 ' + (p.name || m.field) + ' ,' + (p.message || m.message || ('' + m));
      }).join(',');
    }
  }
  if (!description && commonErrorMap[error.code]) {
    description = commonErrorMap[error.code];
  }
  if (!description && errDetail[error.code]) {
    description = errorDetailMap[error.code];
  }
  if (!description) {
    if (error.message && typeof error.message === 'object') {
      try {
        error.message = JSON.stringify(error.message);
      } catch (e) {
        error.message = '无';
        console.log(e);
      }
    }
    description = error.message || error.msg;
  }
  return notification.error({
    message: errDetail.title,
    description: description,
    duration: consts.NOTIFICATION_DURATION
  });
};
