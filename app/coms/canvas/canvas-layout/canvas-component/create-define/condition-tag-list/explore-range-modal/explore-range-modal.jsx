"use strict";
import { Component } from 'react';
import { Modal, Button, Icon, DatePicker, Row, Select } from 'antd';
let Option = Select.Option;
var exploreRangeService = require("../../../../../../../services/exploreRange/exploreRange.js");

class ExploreRangeModal extends Component {
  constructor(props) {
    super(props);
    this.state = { objectArray: [] };
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.isShow === false && nextProps.isShow === true) {
      this.createMixtureArray(nextProps);
    }
  }
  createMixtureArray(propsData) {
    let _stateData = _.cloneDeep(this.state);
    let partition = propsData.data.partition;
    let mixtureArrayCache = propsData.data.mixtureArray;
    _stateData.objectArray = [];
    partition.condition.markedTables.forEach((item) => {
      let _index = _.findIndex(mixtureArrayCache, function(cacheItem) {
        let key1 = partition.partitionId + "_" + item.code + "_" + item.tableName;
        let key2 = cacheItem.partitionId + "_" + cacheItem.condition.code + "_" + cacheItem.condition.tableName;
        return key1 === key2;
      });
      if (_index !== -1) {
        _stateData.objectArray.push(mixtureArrayCache[_index]);
      }
    })
    this.setState(_stateData);
  }
  changeObjectInputType(index, value) {
    let _stateData = _.cloneDeep(this.state);
    _stateData.objectArray[index].condition.symbol = value;
    _stateData.objectArray[index] = exploreRangeService.changeInputType(_stateData.objectArray[index]);
    this.setState(_stateData);
  }
  changeObjectDatePicker(partIndex, valueIndex, value, valueString) {
    let _stateData = _.cloneDeep(this.state);
    _stateData.objectArray[partIndex].value[valueIndex].value = valueString;
    this.setState(_stateData);
  }
  changeObjectInput(partIndex, valueIndex, e) {
    let _stateData = _.cloneDeep(this.state);
    _stateData.objectArray[partIndex].value[valueIndex].value = e.target.value;
    this.setState(_stateData);
  }
  onSubmit() {
    this.props.onOK && this.props.onOK(this.state.objectArray);
  }
  getObjectDOM(objectArray) {
    return objectArray.map((object, index) => {
      return (<div key={index}>
                <Row>
                  <label>{object.condition.name}({object.condition.chineseType})({object.condition.tableName}):</label>
                  <Select onChange={this.changeObjectInputType.bind(this,index)} value={this.state.objectArray[index].condition.symbol} style={{width:120}}>
                    {exploreRangeService.conditionArray.map((item,condIndex)=>{
                      return(<Option key={condIndex} value={item.value}>{item.symbol}</Option>)
                    })}
                  </Select>
                </Row>
                <div>
                
                {object.value.map((item,valueIndex)=>{
                  let inputBox ="";
                  let minusButton="";
                  let plusButton="";
                  
                  if(object.condition.multiValue){
                    plusButton = <Icon type="plus" onClick={this.props.addInputBox.bind(this,object)} />
                  }
                  if(item.type==='DATE'){
                    inputBox = <DatePicker value={this.state.objectArray[index].value[valueIndex].value} onChange={this.changeObjectDatePicker.bind(this,index,valueIndex)} showTime={object.condition.type==='DATETIME'}/>
                  }else if(item.type==='INPUT'){
                    inputBox = <input type="text"  value={this.state.objectArray[index].value[valueIndex].value} onChange={this.changeObjectInput.bind(this,index,valueIndex)} placeholder="请输入此类分区取值" />
                  }
                  if(object.condition.multiValue){
                   minusButton = <Icon type="minus" onClick={this.props.removeInputBox.bind(this,object,item)}/>
                  }
                  return (<Row key={valueIndex}>{plusButton}{inputBox}{minusButton}</Row>);
                })}
                </div>
              </div>);
    });
  }
  render() {
    let objectDOM = this.getObjectDOM(this.state.objectArray);
    return ( < Modal visible = { this.props.isShow }
      onOk = { this.onSubmit.bind(this) }
      onCancle = { this.props.onCancle }
      footer = {
        [
          <Button key="back" type="ghost" size="large" onClick={this.props.onCancle}>取消</Button>,
          <Button key="submit" type="primary" size="large"  onClick={this.onSubmit.bind(this)}>
              提 交
            </Button>,
        ]
      } > { objectDOM } < /Modal>
    );
  }
}

module.exports = ExploreRangeModal;
