"use strict";
var BaseCom = require("../../../../../../../../console/coms/commons/base/baseCom.jsx");
require("./cond-tag-list.less");
let ExploreRange = require("./explore-range.jsx");
let _ = require("lodash");
var classnames = require('classnames');
class ConditionTagList extends BaseCom {
  constructor(props) {
    super(props);
    this.state = {
      isInputStretch: true,
      isOutputStretch: true,
      isRangeStretch: true,
      isPathStretch: true,
    };
  }
  collapseClick(param) {
    if (param === 'output') {
      this.setState({
        isOutputStretch: !!!this.state.isOutputStretch
      });
    }
    if (param === 'input') {
      this.setState({
        isInputStretch: !!!this.state.isInputStretch
      });
    }
    if (param === 'path') {
      this.setState({
        isPathStretch: !!!this.state.isPathStretch
      });
    }
    if (param === 'range') {
      this.setState({
        isRangeStretch: !!!this.state.isRangeStretch
      });
    }
  }
  activeER(item) {
    if (item.isActive) {
      this.removeItemToExtraData(item);
    } else {
      this.addItemToExtraData(item);
    }
  }
  componentWillReceiveProps(nextProps) {
    let oldObjectList = _.concat(nextProps.data.extraData, nextProps.data.inputData.objs, nextProps.data.outputData.objs);
    let newOjectList = _.concat(this.props.data.extraData, this.props.data.inputData.objs, this.props.data.outputData.objs);
    if (!_.isEqual(oldObjectList, newOjectList)) {
      this.props.unHightLightMapDistance();
      this.props.hightLightMapDistance();
    }
  }

  addItemToExtraData(item) {
    let _index = _.findIndex(this.props.data.extraData, function(tagItem) {
      return tagItem.code === item.code;
    });
    if (_index === -1) {
      let _propsData = _.cloneDeep(this.props.data);
      _propsData.extraData.push(item);
      this.props.svaeExtraDataToState && this.props.svaeExtraDataToState(_propsData.extraData);
    }
  }
  removeItemToExtraData(item) {
    this.props.data.extraData.forEach((tagItem, index) => {
      if (tagItem.code === item.code) {
        let _propsData = _.cloneDeep(this.props.data);
        _propsData.extraData.splice(index, 1);
        this.props.svaeExtraDataToState && this.props.svaeExtraDataToState(_propsData.extraData);
        return;
      }
    });
  }
  getObjectListDOM(data, type) {
    let objectList = data.showObjectList.map((id) => {
      return data.objects[id];
    });
    if (type) {
      objectList = objectList.filter((item) => {
        return item.domainType === parseInt(type);
      });
    }
    objectList = objectList.map((item) => {
      item.isActive = false;
      let index = _.findIndex(this.props.data.extraData, (obj) => {
        return obj.code === item.code;
      });
      if (index !== -1) {
        item.isActive = true;
      }
      return item;
    });
    return objectList.map((item, index) => {
      return <span key={index} className={item.isActive?"activeObject":"unActiveObject"} onClick={this.activeER.bind(this,item)}>{item.name}</span>;
    });
  }

  getTagListDOM(data) {
    let outputList = data.tags.map((item) => {
      let object = _.find(data.objs, (obj) => {
        return obj.code === item.markedDomainCode;
      });
      item.markedDomainName = object.name;
      item.markedDomainType = object.type;
      return item;
    });
    return outputList.map((item, index) => {
      let classType = "";
      if (item.markedDomainType === 2) {
        classType = "linkTag";
      } else {
        classType = "objectTag";
      }
      return <span key={index} className={classType}>{item.markedDomainName}({item.name})</span>;
    });
  }

  render() {
    const linkListDOM = this.getObjectListDOM(this.props.objectList, 2);
    const inputListDOM = this.getTagListDOM(this.props.data.inputData);
    const outputListDOM = this.getTagListDOM(this.props.data.outputData);
    const objectListDOM = this.getObjectListDOM(this.props.objectList, 1);
    let stretchInputTitleClass = classnames({
      "card-title": true,
      "card-title-expand": this.state.isInputStretch
    });
    let stretchInputContainerClass = classnames({
      "card-container": true,
      "card-container-expand": this.state.isInputStretch
    });
    let stretchOutputTitleClass = classnames({
      "card-title": true,
      "card-title-expand": this.state.isOutputStretch
    });

    let stretchOutputContainerClass = classnames({
      "card-container": true,
      "card-container-expand": this.state.isOutputStretch
    });

    let stretchPathTitleClass = classnames({
      "card-title": true,
      "card-title-expand": this.state.isPathStretch
    });
    let stretchRangeTitleClass = classnames({
      "card-title": true,
      "card-title-expand": this.state.isRangeStretch
    });
    let stretchPathContainerClass = classnames({
      "card-container": true,
      "card-container-expand": this.state.isPathStretch
    });
    let stretchRangeContainerClass = classnames({
      "card-container": true,
      "card-container-expand": this.state.isRangeStretch
    });
    return (
      <div className="explore-steps-second-content">
    <div className="explore-steps-condition">
      <div className="in-out-condition leftSetting">
        <div className="explore-steps-search">
          <div className={stretchInputTitleClass}>
            <span onClick = {this.collapseClick.bind(this,"input")}>输入</span>
          </div>
          <div className={stretchInputContainerClass}>
          {inputListDOM}
          </div>
          <div className={stretchOutputTitleClass}>
            <span onClick = {this.collapseClick.bind(this,"output")}>输出</span>
          </div>
          <div className={stretchOutputContainerClass}>
          {outputListDOM}
          </div>
        </div>
      </div>
    </div>
    <div className="explore-steps-condition">
      <div className="path-condition leftSetting">
        <div className={stretchPathTitleClass}>
          <span onClick = {this.collapseClick.bind(this,"path")}>探索路径</span>
        </div>
        <div className={stretchPathContainerClass}>
          <div className="link">
          {linkListDOM}
          </div>
          <div className="object">
          {objectListDOM}
          </div>                  
        </div>
        <div className={stretchRangeTitleClass}>
          <span onClick = {this.collapseClick.bind(this,"range")}>探索范围</span>
        </div>
        <div className={stretchRangeContainerClass}>
          <ExploreRange
            getPartitionInfo={this.props.getPartitionInfo}  
            nodeData= {this.props.nodeData} 
            data={this.props.data} 
            saveDataToState={this.props.saveDataToState}/>
        </div>
      </div>
    </div>
  </div>
    )
  }
}

module.exports = ConditionTagList;
