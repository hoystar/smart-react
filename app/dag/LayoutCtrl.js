"use strict";

import $ from 'jquery';
import SVDataset from './SVDataset';
import TYPE from './element/type';
import HttpRequest from '../httpCenter/request';

export default class LayoutCtrl { //拿到数据，对数据的一些处理，数据控制层
  constructor() {
    this.canvasId = null;
    //this.modifiedVersion = null;
    this.nodes = [];
    this.links = [];
    this.isSplitRelation = false;
    this.dataSet = null;
  }

  initLayoutCtrl(data, isSplitRelation) {  //data:canvasData.data,isSplitRelation:参数传进来的false
    this.clear();

    this.canvasId = data.id; //180
    //this.modifiedVersion = data.modifiedVersion; //730
    this.isSplitRelation = isSplitRelation; //false

    this.dataSet = new SVDataset({
      canvasId: this.canvasId,  //180
      //modifiedVersion: this.modifiedVersion //730
    });

    var result = this._resolveInitData(data);//result = {nodes:vertexs,links:edges}
    this.dataSet.addElements(result.nodes); //result.nodes.identifier
    this.dataSet.addElements(result.links); //esult.links.identifier
  }

  _resolveInitData(data) { //数据的解析
    !data.vertexs && (data.vertexs = []);  //!data.vertexs:false
    !data.edges && (data.edges = []);  /*判断data.edges是否为空，如果为空，
                                        就将它定义为data.edges = [],即设置其为数组*/

    var nodes = [];
    var links = [];

    nodes = data.vertexs.map(function(item) { //item:vertexs中各个元素本身的各种信息
      var obj = {};
      obj.id = item.identifier; //元素的identifier
      obj.content = item.content; //数组
      obj.detectable = item.detectable;  //true
      obj.elementType = TYPE.ElementType.ELEMENT_TYPE_NODE; //1
      obj.type = item.type;  //实体还是关系的标志
      obj.critical = item.critical;
      if (item.position1) { //item.position1是数组，定义节点位置
        obj.x = item.position1[0]; //x方向位置
        obj.y = item.position1[1]; //y方向位置
      }
      obj.width = 60;
      obj.height = 40;
      return obj; //obj赋值给nodes
    });

    data.edges.forEach(function(item) { //item:sdges中各个元素的信息
      if (item.type !== -1) {
        links.push({  //将这些信息放入links中
          id: item.identifier,
          elementType: TYPE.ElementType.ELEMENT_TYPE_EDGE, //2
          type: item.type,
          source: item.vertexs[0],//连线开始元素
          target: item.vertexs[1] //连线最终元素
        });
      }
    });

    var initData = {
      nodes: nodes, //元素性质、位置等进本信息
      links: links //个元素的关系
    };

    var result = this.isSplitRelation ? this._splitRelationContent(initData) : initData; //条件为false,result=initdata
    return result;
  }

  _resolveDragData(selectEle, data) {//搜索数据后拖动到画布上后的数据解析
    var result = {
      nodes: [],
      links: []
    }

    var vertexs = data.vertexs || [];
    var _nodes = vertexs.filter(function(item) {
      for (var i = 0; i < item.content.length; i++) {
        if (item.content[i].code === selectEle.id) {
          result.nodes.push({
            id: item.identifier,
            x: selectEle.x,
            y: selectEle.y,
            width: 60,
            height: 40,
            content: item.content,
            detectable: item.detectable,
            elementType: 1,
            type: item.type,
            critical: item.critical,
            isShowTip: item.isShowTip
          });
          return false;
        }
      }
      return true;
    });
    var centerX = selectEle.x;
    var centerY = selectEle.y;
    var R = 120;
    var radus = 360 / _nodes.length;
    for (var i = 0; i < _nodes.length; i++) {
      var posX = centerX + Math.cos(i * radus / 180 * Math.PI) * R;
      var posY = centerY + Math.sin(i * radus / 180 * Math.PI) * R;

      result.nodes.push({
        id: _nodes[i].identifier,
        x: posX,
        y: posY,
        content: _nodes[i].content,
        detectable: _nodes[i].detectable,
        elementType: 1,
        type: _nodes[i].type,
        isShowTip: _nodes[i].isShowTip
      })
    }

    var edges = data.edges || [];
    edges.forEach(function(item) {
      result.links.push({
        id: item.identifier,
        elementType: 2,
        type: item.type,
        source: item.vertexs[0],
        target: item.vertexs[1]
      });
    });

    return result;
  }

  _splitRelationContent(data) {//数据探索、流程视图时，复合关系拆分，即将有1个以上content的关系拆分出来
    var source = {
      nodes: data.nodes,
      links: data.links
    };

    function findLinks(nodeId) {
      return source.links.filter(function(item) {
        return item.source === nodeId || item.target === nodeId;
      });
    }

    var _nodes = [];
    var _links = [];
    source.nodes.forEach(function(node) {
      var relationLinks = findLinks(node.id);

      if (node.type === 2 && node.content !== undefined && node.content.length > 1) {
        node.content.forEach(function(nodeItem, index) {
          var newNode = {};
          $.extend(true, newNode, node);
          newNode.id = nodeItem.code;
          newNode.content = [nodeItem];
          newNode.content[0].domainType = node.type;
          newNode.y += index * 100;
          _nodes.push(newNode);

          var newLinks = [];
          $.extend(true, newLinks, relationLinks);
          newLinks = newLinks.map(function(linkItem) {
            var newLink = {
              type: linkItem.type,
              source: linkItem.source,
              target: linkItem.target,
              elementType: TYPE.ElementType.ELEMENT_TYPE_EDGE
            };
            if (linkItem.source === node.id) {
              newLink.source = newNode.id;
            } else if (linkItem.target === node.id) {
              newLink.target = newNode.id;
            }
            newLink.id = newLink.source + "-" + newLink.target;
            return newLink;
          });

          _links = _links.concat(newLinks);
        });
      } else {
        _nodes.push(node);
        _links = _links.concat(relationLinks);
      }
    });

    var result = {
      nodes: _nodes,
      links: _links
    };

    return result;
  }

  _genData(data) {//将数据转换成DOM
    var addNodes = data.nodes.map(function(item) {
      var node = this.findNode(item.id);
      if (node) {
        return node;
      } else {
        node = new elementGen(item);
        node.active();
        return node;
      }
    }.bind(this));
    this.nodes = this.nodes.concat(addNodes);
    this.nodes = _.uniqBy(this.nodes, "config.id");

    var addLinks = data.links.map(function(item) {
      var link = this.findLink(item.id);
      if (link) {
        return link;
      } else {
        item.source = this.findNode(item.source).config;
        item.target = this.findNode(item.target).config;
        var edge = new elementGen(item);
        edge.active();
        return edge;
      }
    }.bind(this));
    this.links = this.links.concat(addLinks);
    this.links = _.uniqBy(this.links, "config.id");

    this.links.forEach(function(item) {
      var sourceNode = this.findNode(item.config.source.id);
      var targetNode = this.findNode(item.config.target.id);
    }.bind(this));
  }

  addData(data) { //拖动添加元素
    var selectEle = data.nodes.length !== 0 ? data.nodes[0] : data.links[0];

    let allLinks = [];
    let allEntities = [];
    let isRepeat = false;

    var nodes = this.dataSet.getElementsByType(TYPE.ElementType.ELEMENT_TYPE_NODE);
    nodes.forEach((node) => {
      node.config.content.forEach((cxt) => {
        if (node.config.type === TYPE.ObjectType.TYPE_ENTITY) {
          allEntities.push(cxt.code);
        } else if (node.config.type === TYPE.ObjectType.TYPE_LINK) {
          allLinks.push(cxt.code);
        }
        if (cxt.code === selectEle.id) {
          isRepeat = true;
        }
      });
    });

    if (isRepeat) {
      return Promise.reject({
        code: 1000,
        error: "画布中已存在该元素"
      })
    }

    var params = {
      links: [],
      entities: [],
      allEdges: this.links.map(function(item) {
        return item.config.id;
      }),
      allLinks: allLinks,
      allEntities: this.nodes.filter(function(item) {
        return item.config.type === TYPE.ObjectType.TYPE_ENTITY;
      }).map(function(item) {
        return item.config.id;
      })

    }

    if (selectEle.type === TYPE.ObjectType.TYPE_ENTITY) {
      params.entities.push(selectEle.id);
    } else if (selectEle.type === TYPE.ObjectType.TYPE_LINK) {
      params.links.push(selectEle.id);
    }
    //console.log(selectEle);
    return HttpRequest.findElements(params).then(function(data) {
      var result = this._resolveDragData(selectEle, data);
      this.dataSet.addElements(result.nodes);
      this.dataSet.addElements(result.links);
      return result;
    }.bind(this));
  }

  findNode(id) {
    var node = this.nodes.filter(function(item) {
      return item.config.id === id;
    })
    return node.length > 0 ? node[0] : undefined;
  }

  findLink(id) {
    var link = this.links.filter(function(item) {
      return item.config.id === id;
    })
    return link.length > 0 ? link[0] : undefined;
  }

  recommendExplore(_node) { //发现探索，只能发现
    let allLinks = [];

    var nodes = this.dataSet.getElementsByType(TYPE.ElementType.ELEMENT_TYPE_NODE);
    var links = this.dataSet.getElementsByType(TYPE.ElementType.ELEMENT_TYPE_EDGE);

    nodes.filter(function(item) {
      return item.config.type === 2;
    }).forEach(function(item) {
      item.config.content.forEach(function(item) {
        allLinks.push({
          id: item.id,
          code: item.code,
          recType: item.recType//暂且不管
        });
      });
    });

    var params = {
      domainId: _node.config.content[0].id,
      allEdges: links.map(function(item) {
        return item.config.id;
      }),
      allLinks: allLinks,
      allEntities: nodes.filter(function(item) {
        return item.config.type === 1;
      }).map(function(item) {
        return {
          id: item.config.content[0].id,
          code: item.config.content[0].code,
          recType: item.config.content[0].recType
        }
      })
    };

    return HttpRequest.GetRecommendExpore(params);
  }

  ordinaryExplore(_node) { //点击左侧按钮调用此函数，筛选数据调用接口
    let allLinks = [];

    var nodes = this.dataSet.getElementsByType(TYPE.ElementType.ELEMENT_TYPE_NODE);
    var links = this.dataSet.getElementsByType(TYPE.ElementType.ELEMENT_TYPE_EDGE);
    //console.log(nodes);
    //console.log(links);
    nodes.filter(function(item) {
      return item.config.type === 2 && item.config.viewType === 0;
    }).forEach(function(item) {
      item.config.content.forEach(function(item) {
        allLinks.push(item.code);
      });
    });
    //console.log(allLinks);
    var params = {
      detectedEntity: _node.config.content[0].code,
      allEdges: links.map(function(item) {
        return item.config.id;
      }),
      allLinks: allLinks,
      allEntities: nodes.filter(function(item) {
        return item.config.type === 1;
      }).map(function(item) {
        return item.config.id;
      })
    };
    //console.log(params);
    return HttpRequest.detectEntity(params);
  }

  saveCanvas() { //保存视图？
    var nodes = [];
    var nodeElements = this.dataSet.getElementsByType(TYPE.ElementType.ELEMENT_TYPE_NODE);

    if (nodeElements) {
      nodeElements.forEach(function(item) {
        var pos = [];
        pos.push([item.config.x, item.config.y]);
        item.config.content.forEach(function(content) {
          nodes.push({
            domainCode: content.code,
            domainType: content.domainType,
            position: pos,
            criticalNode: item.config.critical
          });
        });
      });

      nodes = _.uniqBy(nodes, "domainCode");

      return HttpRequest.saveCanvas({
        canvasId: this.canvasId,
        nodes: nodes,
        lines: [],
        //modifiedVersion: this.modifiedVersion
      }).then(function(data) {
        //this.dataSet.modifiedVersion = this.modifiedVersion = data.modifiedVersion;
      }.bind(this));
    }
  }

  clear() {
    this.nodes = [];
    this.links = [];
  }
}
