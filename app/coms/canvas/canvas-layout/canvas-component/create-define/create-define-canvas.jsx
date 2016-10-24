import React, { Component, PropTypes } from 'react';
let BaseCom = require("../../../../../../../console/coms/commons/base/baseCom.jsx");
let CondTagList = require("./condition-tag-list/cond-tag-list.jsx");
let SaveDefineModal = require("./save-define-modal/save-define-modal.jsx");
let ConditionExpressions = require("../../../../commons/condition/condition.jsx");
let CondiSelect = require("../../../../commons/condition-select/condition-select.jsx");
let TreeDag = require("../../../../commons/treeDag/treeDag.jsx");
let PathDag = require("../../../../../services/pathDag/pathDag");
var EventEmitter = require("wolfy87-eventemitter");
var tagSearchService = require("../../../../../services/condition/tagSearch.js");
let ReactDom = require('react-dom');
let moment = require('moment');
let TYPE = require("../../../../../services/dag/element/type");
var color = require("../../../../../services/process/color");
var MapDistance = require("../../../../../services/algorithm/mapDistance");
var MapJudgement = require("../../../../../services/algorithm/mapJudgement");
import { Row, Col, Tabs, Input, Table, Select, Radio, message, Modal } from 'antd';
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const RadioGroup = Radio.Group;
var classnames = require('classnames');
let EVENTS = require("../../../../../services/events");
require("./create-define-canvas.less");
let _ = require("lodash");
class CreateDefine extends Component {
  constructor(props) {
    super(props);
    this.tabKey = ["input", "output"];
    this.hasSubmit = false;
    this.partitionDate = [];
    this.nodeData = {};
    this.tagList = [];
    this.outputColumns = [{
      title: '节点名称',
      dataIndex: 'markedDomainName',
      key: 'markedDomainName'
    }, {
      title: '类型',
      dataIndex: 'type',
      key: 'type'
    }, {
      title: '标签名称',
      dataIndex: 'tagName',
      key: 'tagName'
    }, {
      title: '操作',
      key: 'operation',
      render: (text, record) => (
        <span>
      <a onClick={record.removeOutputObject.bind(this,record)}>删除</a>
    </span>
      ),
    }];
    this.layout = {};
    this.width = 0,
    this.height = 0;
    this.state = {
      conditiontipsData: {},
      isShowSaveDefineModal: false,
      ERActiveObj: {},
      activeKey: "input",
      dataModal: {
        inputData: {
          tags: [],
          objs: []
        },
        outputData: {
          tags: [],
          objs: []
        },
        layout: null,
        contidionData: {},
        extraData: [],
        executedPath: [],
        partitionData: [],
        defineDescription: "",
        defineName: ""
      },
      isTreeStretch: true,
      isExpressionStretch: false,
      isPathStretch: true,
      isRangeStretch: true,
      currentStep: 1,
      selectedNode: {}
    };
  }

  setCondition(id, data) {
    let _node = this.layout.findNode(id);
    if (_node) {
      _node.highlight();
      _node.config.condition = _.cloneDeep(_.assign(_node.config.condition, data));
      let _stateData = _.cloneDeep(this.state);
      _stateData.selectedNode.condition = _node.config.condition;
      this.setState(_stateData);
    }
  }
  isTree() {
    let result = true;
    this.layout.nodes.forEach((item) => {
      if (!item.config.isTree && !item.config.parentId) {
        result = false;
      }
    });
    if (this.layout.nodes.length === 1) {
      result = true;
    }
    return result;
  }

  componentDidMount() {
    let svgDom = $("#path-canvas").parent();
    this.width = $(svgDom).width();
    this.height = $(svgDom).height();
    this.layout = new PathDag({
      svg: d3.select("#path-canvas"),
      width: this.width,
      height: this.height
    });
    this.layout.eventProxy.on(EVENTS.REMOVE_ITEM_INPUTDATA, (inputDataParams) => {
      let _stateData = _.cloneDeep(this.state);
      if (inputDataParams.tags.length > 0) {
        _stateData.dataModal.inputData.tags = _stateData.dataModal.inputData.tags.filter((tagItem) => {
          return tagItem.code !== inputDataParams.tags[0].config.code || tagItem.markedDomainCode !== inputDataParams.tags[0].config.markedDomainCode;
        })
      }
      if (inputDataParams.objs.length > 0) {
        _stateData.dataModal.inputData.objs = _stateData.dataModal.inputData.objs.filter((objItem) => {
          return objItem.code !== inputDataParams.objs[0].config.markedDomainCode;
        })
      }
      _stateData.selectedNode = {};
      this.setState(_stateData);
    });
    this.layout.eventProxy.on(EVENTS.SHOW_CONDITION_TOOLTIPS, (data) => {
      var halfRectWidth = 30;
      let _stateData = _.cloneDeep(this.state);
      _stateData.conditiontipsData = _.cloneDeep(_.assign(data, {
        isShow: true,
        x: (data.data.info.x + halfRectWidth) + "px",
        y: data.data.info.y + "px"
      }));
      this.setState(_stateData);
    });

    this.layout.eventProxy.on(EVENTS.HIDE_CONDITION_TOOLTIPS, () => {
      let _stateData = _.cloneDeep(this.state);

      _stateData.conditiontipsData.isShow = false;
      this.setState(_stateData);
    });
    this.layout.eventProxy.on(EVENTS.PATH_CANVAS_CXTMENUE, function(data) {
      let _stateData = _.cloneDeep(this.state);
      _stateData.selectedNode = data;
      let _node = this.layout.findNode(data.id);

      if (_node) {
        this.layout.nodes.forEach((node) => {
          if (node.config.type === 1) {
            node.unSelected();
          }
        });
        _node.selected();
      }
      this.setState(_stateData);
    }.bind(this));
    this.props.getCanvas && this.props.getCanvas({}, { canvasId: this.props.canvasId }).then(() => {});
  }

  createExecPath(_stateData) {
    _stateData.dataModal.executedPath = [];
    this.nodeData.MapLinks && this.nodeData.MapLinks.forEach((item) => {
      let link = [];
      link.push(item.config.source.content[0].code);
      link.push(item.config.target.content[0].code);
      _stateData.dataModal.executedPath.push(link);
    });
    return _stateData;
  }

  unHightLightMapDistance() {
    this.nodeData.MapNodes && this.nodeData.MapNodes.forEach(function(_nodes) {
      _nodes.changeColor("#fff");
    })
    this.nodeData.MapLinks && this.nodeData.MapLinks.forEach(function(_edges) {
      _edges.changeColor("#ccc");
    })
  }

  hightLightMapDistance() {
    let _stateData = _.cloneDeep(this.state);
    let layout = this.props.layout;
    var nodes = layout.dataSet && layout.dataSet.getElementsByType(TYPE.ElementType.ELEMENT_TYPE_NODE);
    var links = layout.dataSet && layout.dataSet.getElementsByType(TYPE.ElementType.ELEMENT_TYPE_EDGE);
    var mapInfo = {
      mapNodes: [].concat(nodes),
      mapLinks: [].concat(links),
      mapInputData: []
    };
    mapInfo.mapInputData = _.unionBy(mapInfo.mapInputData, _stateData.dataModal.extraData, _stateData.dataModal.inputData.objs, _stateData.dataModal.outputData.objs, 'code');
    if (MapJudgement.estimate(mapInfo)) {
      this.nodeData = MapDistance.caculate(mapInfo);
      this.nodeData.MapNodes.forEach(function(_nodes) {
        _nodes.changeColor(color["NODEPATH"]);
      });
      this.nodeData.MapLinks.forEach(function(_edges) {
        _edges.changeColor(color["EDGEPATH"]);
      });
    }
  }

  onChange(activeKey) {
    this.props.changeActiveKey(activeKey);
  }

  onQuitDefineModal() {
    this.props.onEdit && this.props.onEdit(this.props.tabKey, 'remove');
  }

  showSaveDefineModal() {
    let _stateData = _.cloneDeep(this.state);
    _stateData.isShowSaveDefineModal = true;
    _stateData = this.createExecPath(_stateData);
    this.transfromPartitionData();
    this._vertifyPartition();
    this.setState(_stateData);
  }

  transfromPartitionData() {
    let partitions = [];
    let _stateData = _.cloneDeep(this.state);
    _stateData.dataModal.partitionData.forEach((item) => {
      let partitionValue;
      if (item.condition.valueType === 'string') {
        partitionValue = item.value[0].value;
      } else if (item.condition.valueType === 'array') {
        partitionValue = [];
        item.value.forEach((valueItem) => {
          partitionValue = partitionValue.concat(valueItem.value);
        });
      }

      let _obj = {
        contrast: item.condition.symbol,
        leftValue: {
          type: "OBJECT",
          value: {
            partitionName: item.condition.partitionName,
            code: item.condition.code,
            type: item.condition.domainType,
            schemaCode: item.condition.schemaCode,
            tableName: item.condition.tableName
          }
        },
        rightValue: {
          type: item.condition.type,
          value: partitionValue
        }
      };
      partitions.push(_obj);
    });
    this.partitionDate = _.cloneDeep(partitions);
  }

  _vertifyPartition() {
    let result = true;
    this.partitionDate.forEach((item) => {
      if (item.contrast === "" || item.rightValue.value.length === 0) {
        result = false;
      }
      if (_.isArray(item.rightValue.value)) {
        item.rightValue.value.forEach((valueItem) => {
          if (valueItem.trim() === "") {
            result = false;
          }
        });
      } else if (_.isString(item.rightValue.value)) {
        if (item.rightValue.value.trim() === "") {
          result = false;
        }
      }

      if (item.contrast === "BETWEEN") {
        if (item.rightValue.value[0] >= item.rightValue.value[1]) {
          result = false;
        }
      }
    });
    return result;
  }

  onSubmitSaveDefineModal() {
    if (this.hasSubmit) {
      return;
    }
    this.hasSubmit = true;
    let _stateData = _.cloneDeep(this.state);
    let selectedDomains = [];
    let outputTags = [];
    _stateData.dataModal.inputData.objs.forEach(function(item) {
      selectedDomains.push({
        code: item.code,
        type: item.type
      });
    });
    _stateData.dataModal.outputData.objs.forEach(function(item) {
      selectedDomains.push({
        code: item.code,
        type: item.type
      });
    });
    _stateData.dataModal.extraData.forEach(function(item) {
      selectedDomains.push({
        code: item.code,
        type: item.domainType
      });
    });
    selectedDomains = _.uniqBy(selectedDomains, 'code');
    _stateData.dataModal.outputData.tags.forEach(function(item) {
      let index = _.findIndex(outputTags, function(items) {
        return items.code === item._obj.code;
      });
      if (index === -1) {
        outputTags.push({
          code: item._obj.code,
          type: item._obj.type,
          tags: [item.code]
        });
      } else {
        outputTags[index].tags.push(item.code);
      }
    });
    let defineName = _stateData.dataModal.defineName.trim();
    let defineDescription = _stateData.dataModal.defineDescription;
    if (_stateData.dataModal.defineName.trim() === "") {
      defineName = "探索" + moment(new Date()).format("YYYYMMDDHHmmss");
    }
    if (_stateData.dataModal.defineDescription === "") {
      defineDescription = "探索" + moment(new Date()).format("YYYYMMDDHHmmss");
    }

    let params = {
      "workspaceId": this.props.canvasData.data.workspaceId,
      "parentId": this.props.canvasData.data.parentId,
      "name": defineName,
      "description": defineDescription,
      "modifier": 1,
      "selectedDomains": selectedDomains,
      "conditions": _stateData.dataModal.contidionData,
      "outputTags": outputTags,
      "executedPath": _stateData.dataModal.executedPath,
      "partitions": this.partitionDate
    };
    this.props.createDetect && this.props.createDetect(params).then(() => {
      this.hasSubmit = false;
      message.success("保存成功!");
    }).catch((data) => {
      this.hasSubmit = false;
      message.error("保存失败!");
    });
    this.setState({ isShowSaveDefineModal: false });
  }
  onHideSaveDefineModal() {
    this.setState({ isShowSaveDefineModal: false });
  }

  previousStep() {
    this.setState({
      currentStep: this.state.currentStep - 1,
    });
  }

  nextStep() {
    this.jointCondition();
    if(!this.isTree()){
      message.warn("条件树结构不正确！");
    }
    this.setState({
      currentStep: this.state.currentStep + 1,
    });
  }

  collapseClick(param) {
    if (param === 'expression') {
      this.setState({
        isExpressionStretch: !!!this.state.isExpressionStretch
      });
    }
    if (param === 'tree') {
      this.setState({
        isTreeStretch: !!!this.state.isTreeStretch
      });
    }
  }

  objectSelectChange(value) {
    if (this.props.objectList.objects[value].tags) {
      this.setState({ ERActiveObj: this.props.objectList.objects[value] });
    } else {
      this.props.getERTagDetail && this.props.getERTagDetail({ domainCode: value }).then(() => {
        this.setState({ ERActiveObj: this.props.objectList.objects[value] });
      })
    }
  }


  changeContainer(activeKey) {
    this.setState({ activeKey: activeKey });
  }

  getCNDomainType(type) {
    switch (type) {
      case 1:
        return "实体";
      case 2:
        return "关系";
    }
    return "实体";
  }

  jointCondition() {
    let rootNode = {};
    if (this.layout.nodes.length === 1) {
      rootNode = this.layout.nodes[0];
    } else {
      rootNode = _.find(this.layout.nodes, ['config.isRoot', true]);
    }

    if (rootNode !== undefined) {
      this.createConditions(rootNode);
      let _stateData = _.cloneDeep(this.state);
      _stateData.dataModal.contidionData = rootNode.config.condition;
      let vertifyCondition = this.vertifyCondition(_stateData.dataModal.contidionData);
      if (!vertifyCondition) {
        message.warn("存在条件树未赋值！");
      };
      this.setState(_stateData);
    }
  }

  createConditions(node) {
    var queue = [];
    var currentNode = {};
    queue.push(node);
    while (queue.length !== 0) {
      currentNode = queue.shift();
      if (currentNode.config.type === 2) {
        let con = {
          nature: "",
          conditions: []
        };
        currentNode.config.children.forEach((item) => {
          if (item.config.type === 2) {
            queue.push(item);
          }
          con.conditions.push(item.config.condition);
        });
        con.nature = this.getNature(currentNode.config.funcType);
        currentNode.config.condition = _.assign(currentNode.config.condition, con);
      }
    }
  }
  vertifyCondition(conditions) {
    var queue = [];
    var current = {};
    queue.push(conditions);
    while (queue.length !== 0) {
      current = queue.shift();
      if (_.isEmpty(current)) {
        return false;
      }
      if (current.conditions) {
        current.conditions.forEach((item) => {
          queue.push(item);
        });
      }
    }
    return true;
  }

  getNature(funcType) {
    if (funcType === 1) {
      return "AND";
    } else {
      return "OR";
    }
  }

  addCondition(item) {
    let _state = _.cloneDeep(this.state);
    var _obj = {
      type: _state.ERActiveObj.domainType,
      code: _state.ERActiveObj.code,
      name: _state.ERActiveObj.name
    };
    let data = _.cloneDeep(item);
    if (_state.activeKey === this.tabKey[0]) {
      let result = _state.dataModal.inputData.tags.filter(function(inputItem) {
        return inputItem.code === item.code && inputItem.markedDomainCode === item.markedDomainCode;
      });
      tagSearchService.getTagSelectedData(item);
      if (result.length === 0) {
        let objsResult = _state.dataModal.inputData.objs.filter(function(objsItem) {
          return objsItem.code === item.markedDomainCode;
        });
        if (objsResult.length === 0) {
          _state.dataModal.inputData.objs.push(_obj);
        }
        data._obj = _obj;
        _state.dataModal.inputData.tags.push(data);
      }

      this.addItemToContainer(_.cloneDeep(_.assign({
        markedDomainName: _state.ERActiveObj.name
      }, item)));
    } else if (_state.activeKey === this.tabKey[1]) {
      let result = _state.dataModal.outputData.tags.filter(function(outputItem) {
        return outputItem.code === item.code && item.markedDomainCode === outputItem.markedDomainCode;
      });
      if (result.length === 0) {
        let objsResult = _state.dataModal.outputData.objs.filter(function(objsItem) {
          return objsItem.code === item.markedDomainCode;
        });
        if (objsResult.length === 0) {
          _state.dataModal.outputData.objs.push(_obj);
        }
        data._obj = _obj;
        _state.dataModal.outputData.tags.push(data);
      }
    }
    this.setState(_state);
  }

  addItemToContainer(data) {
    let _x = Math.random() * (this.width - 30);
    let _y = Math.random() * (this.height - 30);
    _x = _x < 30 ? (_x + 30) : _x;
    _y = _y < 30 ? (_y + 30) : _y;
    this.layout.addItem2Layout([_.cloneDeep(_.assign({
      x: _x,
      y: _y,
      type: 1,
      isRoot: false,
      isLeaf: false,
      isTree: false
    }, data))], true);
  }

  removeOutputObject(item) {
    let _stateData = _.cloneDeep(this.state);
    _stateData.dataModal.outputData.tags = _stateData.dataModal.outputData.tags.filter((tagItem) => {
      return tagItem.code !== item.code || tagItem.markedDomainCode !== item.markedDomainCode;
    })
    _stateData.dataModal.outputData.objs.filter((objItem, index) => {
      let tags = _stateData.dataModal.outputData.tags.filter((tagItem) => {
        return tagItem._obj.code === objItem.code;
      });
      if (tags.length === 0) {
        _stateData.dataModal.outputData.objs.splice(index, 1);
      }
    });
    this.setState(_stateData);
  }

  removeTreeNode(info) {
    this.layout && this.layout.deleteNode(info.nodeId);
  }

  saveDataToState(data) {
    let _stateData = _.cloneDeep(this.state);
    _stateData.dataModal = data;
    this.setState(_stateData);
  }

  svaeExtraDataToState(extraData) {
    let _stateData = _.cloneDeep(this.state);
    _stateData.dataModal.extraData = extraData;
    this.setState(_stateData);
  }

  confirmQuitDefine() {
    Modal.confirm({
      title: '退出确认',
      content: '确定要退出创建数据探索么？',
      okText: '确定',
      cancelText: '取消',
      onOk: this.onQuitDefineModal.bind(this)
    });
  }

  render() {
    let stretchExpressionTitleClass = classnames({
      "card-title": true,
      "card-title-expand": this.state.isExpressionStretch
    });
    let showFirstStepClass = classnames({
      "explore-steps-first": true,
      "explore-steps-first-hide": this.state.currentStep !== 1
    });
    let showSecondStepClass = classnames({
      "explore-steps-second": true,
      "explore-steps-second-hide": this.state.currentStep !== 2
    });
    let showThirdStepClass = classnames({
      "explore-steps-third": true,
      "explore-steps-third-hide": this.state.currentStep !== 3
    });
    let stretchExpressionContainerClass = classnames({
      "card-container": true,
      "card-container-expand": this.state.isExpressionStretch
    });
    let stretchTreeTitleClass = classnames({
      "card-title": true,
      "card-title-expand": this.state.isTreeStretch
    });
    let stretchTreeContainerClass = classnames({
      "card-container": true,
      "tree-card-container": true,
      "card-container-expand": this.state.isTreeStretch
    });
    let loop = data => data.map((item) => {
      return <Option value={item.code} key={item.code}>{item.name}</Option>;
    });

    let getTagDom = data => data.map((item) => {
      return <span className="explore-object-tag" onClick={this.addCondition.bind(this,item)} key={item.code}>{item.name}</span>;
    });
    let objectList = this.props.objectList.showObjectList.map((id) => {
      return this.props.objectList.objects[id];
    });

    if (!_.isEmpty(this.state.ERActiveObj) && this.state.ERActiveObj.tags) {
      this.tagList = this.state.ERActiveObj.tags;
    }
    let objectListDom = loop(objectList);
    let tagListDom = this.tagList && getTagDom(this.tagList);
    let getOutputData = data => data.map((item, index) => {
      return {
        key: index,
        markedDomainName: item._obj.name,
        markedDomainCode: item.markedDomainCode,
        type: this.getCNDomainType(item._obj.type),
        tagName: item.name,
        code: item.code,
        removeOutputObject: this.removeOutputObject.bind(this)
      }
    });
    let outputData = getOutputData(this.state.dataModal.outputData.tags);

    return (
      <div className="define-container" id="define-container">
          <div className="explore-view">       
              <div className="svg-container">
                <svg id="svg-canvas" className="dag-svg">
                  <defs>
                    <marker id="arrow" markerUnits="strokeWidth" markerWidth="12" markerHeight="10" viewBox="0 0 12 12" refX="6" refY="6" orient="auto">
                      <path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="#ccc"></path>
                    </marker>
                    <marker id="arrow-highlight" markerUnits="strokeWidth" markerWidth="12" markerHeight="10" viewBox="0 0 12 12" refX="6" refY="6" orient="auto">
                      <path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="#3daefe"></path>
                    </marker>
                  </defs>
                  <g className="zoom-container"></g>
                </svg>
              </div>       
          </div>
          <div className="explore-steps">
            <div className={showFirstStepClass}>
              <div className="explore-steps-nav">
                <span className="diabled"><i className="iconfont">&#xe634;</i>上一步</span>
                <span onClick={this.nextStep.bind(this)}><i className="iconfont fontBlueColor">&#xe635;</i>下一步</span>
                <span onClick={this.confirmQuitDefine.bind(this)}><i className="iconfont fontBlueColor">&#xe633;</i>退出探索</span>
                </div>
              <div className="explore-steps-search">
                  <Select showSearch
                    style={{ width: 200 }}
                    placeholder="搜选实体或关系"
                    optionFilterProp="children"
                    notFoundContent="无法找到"
                    onSelect={this.objectSelectChange.bind(this)}>
                    {objectListDom}
                  </Select>
                  <span className="explore-steps-addTag">(点击添加标签)</span>
                  <div className="explore-steps-listTag">
                   {tagListDom}
                  </div>
              </div>
              <div className="explore-steps-condition">
                  <Tabs type="card" activeKey={this.state.activeKey} onChange={this.changeContainer.bind(this)}>
                    <TabPane tab="输入条件" key={this.tabKey[0]}>
                      <div className="leftSetting second-leftSetting">
                        <div className={stretchTreeTitleClass}>
                          <span onClick = {this.collapseClick.bind(this,"tree")}>关系图</span>
                        </div>
                        <div className={stretchTreeContainerClass}>
                          <TreeDag conditiontipsData={this.state.conditiontipsData}/>
                        </div>
                      </div>
                      <div className="rightSetting second-rightSetting">
                      <CondiSelect info={this.state.selectedNode} removeTreeNode={this.removeTreeNode.bind(this)} setCondition={this.setCondition.bind(this)} mode={'create'}/>
                      </div>
                    </TabPane>
                    <TabPane tab="输出条件"key={this.tabKey[1]}>
                       <Table columns={this.outputColumns} dataSource={outputData} pagination={false} size="small" />
                    </TabPane>
                  </Tabs>
              </div>
            </div>
            <div className={showSecondStepClass}>
                <div className="explore-steps-nav">
                  <span onClick={this.previousStep.bind(this)}><i className="iconfont fontBlueColor">&#xe634;</i>上一步</span>
                  <span onClick={this.showSaveDefineModal.bind(this)}><i className="iconfont fontBlueColor">&#xe635;</i>下一步</span>
                  <span onClick={this.confirmQuitDefine.bind(this)}><i className="iconfont fontBlueColor">&#xe633;</i>退出探索</span>
                </div>
                <CondTagList
                  getPartitionInfo={this.props.getPartitionInfo}  
                  layout={this.props.layout}
                  objectList={this.props.objectList}
                  data={this.state.dataModal}
                  nodeData={this.nodeData}
                  svaeExtraDataToState={this.svaeExtraDataToState.bind(this)}
                  saveDataToState={this.saveDataToState.bind(this)}
                  unHightLightMapDistance={this.unHightLightMapDistance.bind(this)}
                  hightLightMapDistance={this.hightLightMapDistance.bind(this)}
                />
            </div>
            <div className={showThirdStepClass}>
                <SaveDefineModal visible={this.state.isShowSaveDefineModal}
                data={this.state.dataModal}
                saveDataToState={this.saveDataToState.bind(this)}
                onHide={this.onHideSaveDefineModal.bind(this)}
                onSubmit={this.onSubmitSaveDefineModal.bind(this)}/>
            </div>
          </div>
        </div>
    );
  }
}
module.exports = CreateDefine;
