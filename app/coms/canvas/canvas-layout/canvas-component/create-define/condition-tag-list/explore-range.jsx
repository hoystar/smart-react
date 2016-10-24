"use strict";

var BaseCom = require("../../../../../../../../console/coms/commons/base/baseCom.jsx");

var exploreRangeService = require("../../../../../../services/exploreRange/exploreRange.js");
import { Radio, Select, message, Icon, DatePicker, Input, Row , Col} from 'antd';
let ExploreRangeModal = require("./explore-range-modal/explore-range-modal.jsx");
const Option = Select.Option;
const RadioGroup = Radio.Group;
require("./explore-range.less");
class ExploreRange extends BaseCom {
  constructor(props) {
    super(props);
    this.exploreRangeModalInfo = { partition: {}, mixtureArray: [] };
    this.partitionResult = [];
    this.state = {
      radioValue: "PARTITION",
      loading: false,
      isShowExpRangeModal: false,
      batchArray: [{
        type: "BATCH",
        condition: {
          name: "批量设置",
          symbol: "",
          multiValue: false,
          type: "TEXT"
        },
        value: []
      }],
      linkArray: [],
      partitionArray: [],
      entityArray: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.nodeData, nextProps.nodeData)) {
      this.createPartitionCache(nextProps);
    }
  }
  getPartition(stateData) {
    let partitionData = _.concat(stateData.linkArray, stateData.entityArray);
    let dataModal = _.cloneDeep(this.props.data);
    dataModal.partitionData = partitionData;
    this.props.saveDataToState && this.props.saveDataToState(dataModal);
  }

  createPartitionCache(propsData) {
    this.partitionStatus = false;
    let _stateData = _.cloneDeep(this.state);
    _stateData.loading = true;
    this.setState(_stateData);
    let params = _.isEmpty(propsData.nodeData) || propsData.nodeData.MapNodes.map((item) => {
      return item.config.content[0].code;
    }).join(",");
    propsData.getPartitionInfo && propsData.getPartitionInfo({
      domainCodes: params
    }).then((data) => {
      if (data.data.length < 1) {
        this.partitionStatus = true;
        message.warn("数据无分区，不需要设置探索范围!");
      }
      let _stateData = _.cloneDeep(this.state);
      _stateData.loading = false;
      this.setState(_stateData);
      this.partitionResult = [];

      this.partitionResult = _.cloneDeep(_.assign(this.partitionResult, data.data));
      this.createPartitionListCache();
      this.createDomainCache();
    }).catch((data) => {
      let _stateData = _.cloneDeep(this.state);
      _stateData.loading = false;
      this.setState(_stateData);
      message.error("分区信息获取失败!");
    })
  }
  createDomainCache() {
    let domainType;
    let showArray = [];
    let _stateData = _.cloneDeep(this.state);
    _stateData.entityArray = [];
    _stateData.linkArray = [];
    this.partitionResult.forEach((item) => {
      item.markedTables.forEach((domainItem) => {
        let chineseType = this.getchineseType(item.type);
        domainItem = _.cloneDeep(_.assign(domainItem, {
          symbol: "",
          multiValue: false,
          type: item.type,
          partitionName: item.name,
          chineseType: chineseType,
          valueType: ""
        }));
        let _obj = {
          condition: domainItem,
          value: [],
          type: "",
          partitionId: item.name + "_" + item.type,
        };

        if (domainItem.domainType === 1) {
          _obj.type = "ENTITY";
          _stateData.entityArray.push(_obj);
        } else if (domainItem.domainType === 2) {
          _obj.type = "LINK";
          _stateData.linkArray.push(_obj);
        }
      });
    })
    this.getPartition(_stateData);
    this.setState(_stateData);
  }
  createPartitionListCache() {
    let _stateData = _.cloneDeep(this.state);
    _stateData.partitionArray = [];
    this.partitionResult.forEach((item) => {
      let chineseType = this.getchineseType(item.type);
      let _partitionItem = {
        type: "PARTITION",
        partitionId: item.name + "_" + item.type,
        condition: {
          name: item.name,
          symbol: "",
          type: item.type,
          markedTables: item.markedTables,
          multiValue: false,
          chineseType: chineseType,
          valueType: ""
        },
        value: []
      };
      let _item = {
        key: _partitionItem.partitionId,
        value: _partitionItem
      };
      _stateData.partitionArray.push(_partitionItem);
    });
    this.getPartition(_stateData);
    this.setState(_stateData);
  }
  getchineseType(type) {
    let chineseType = "";
    switch (type) {
      case "INTEGER":
        chineseType = "整数";
        break;
      case "BIGINT":
        chineseType = "长整数";
        break;
      case "NUMERIC":
        chineseType = "小数";
        break;
      case "TEXT":
        chineseType = "文本";
        break;
      case "DATE":
        chineseType = "日期";
        break;
      case "DATETIME":
        chineseType = "时间戳";
        break;
    }
    return chineseType;
  }


  changeLinkInputType(index, value) {
    let _stateData = _.cloneDeep(this.state);
    _stateData.linkArray[index].condition.symbol = value;
    _stateData.linkArray[index] = exploreRangeService.changeInputType(_stateData.linkArray[index]);
    this.getPartition(_stateData);
    this.setState(_stateData);
  }
  changeEntityInputType(index, value) {
    let _stateData = _.cloneDeep(this.state);
    _stateData.entityArray[index].condition.symbol = value;
    _stateData.entityArray[index] = exploreRangeService.changeInputType(_stateData.entityArray[index]);
    this.getPartition(_stateData);
    this.setState(_stateData);
  }
  onChangeRadio(e) {
    this.setState({
      radioValue: e.target.value,
    });
  }
  removeInputBox(partition, item) {
    exploreRangeService.removeInputBox(partition, item);
  }
  batchModifyInput(type, partIndex, valueIndex, e) {
    let _stateData = _.cloneDeep(this.state);
    if (type === 'PARTITION') {
      _stateData.partitionArray[partIndex].value[valueIndex].value = e.target.value;
      let mixtureArray = [];
      mixtureArray.push(_stateData.entityArray);
      mixtureArray.push(_stateData.linkArray);
      mixtureArray.forEach((objectArray) => {
        objectArray.map((partition) => {
          _stateData.partitionArray[partIndex].condition.markedTables.forEach((domainItem) => {
            let id1 = partition.partitionId + "_" + partition.condition.code + "_" + partition.condition.tableName;
            let id2 = _stateData.partitionArray[partIndex].partitionId + "_" + domainItem.code + "_" + domainItem.tableName;
            if (id1 === id2) {
              partition.condition.symbol = _stateData.partitionArray[partIndex].condition.symbol;
              partition.condition.valueType = _stateData.partitionArray[partIndex].condition.valueType;
              partition.value = [];
              partition.value = _.cloneDeep(_stateData.partitionArray[partIndex].value);
            }
          })
        })
      })
    }
    if (type === 'BATCH') {
      _stateData.batchArray[partIndex].value[valueIndex].value = e.target.value;
      let mixtureArray = [];
      mixtureArray.push(_stateData.entityArray);
      mixtureArray.push(_stateData.linkArray);
      mixtureArray.push(_stateData.partitionArray);
      mixtureArray.forEach((objectArray) => {
        objectArray = objectArray.map((cacheItem) => {
          cacheItem.condition.symbol = _stateData.batchArray[partIndex].condition.symbol;
          cacheItem.condition.valueType = _stateData.batchArray[partIndex].condition.valueType;
          cacheItem.value = [];
          let value = [];
          switch (cacheItem.condition.type) {
            case 'TEXT':
              cacheItem.value = _.cloneDeep(_stateData.batchArray[partIndex].value);
              break;
            case 'INTEGER':
            case 'BIGINT':
              _stateData.batchArray[partIndex].value.forEach((item) => {
                let _item = _.cloneDeep(item);
                if (item.value === "") {
                  value.push(_item);
                } else if (!isNaN(item.value)) {
                  _item.value = parseInt(_item.value).toString();
                  value.push(_item);
                } else if (isNaN(item.value)) {
                  _item.value = "";
                  value.push(_item);
                }
              })
              cacheItem.value = value;
              break;
            case 'NUMERIC':
              _stateData.batchArray[partIndex].value.forEach((item) => {
                let _item = _.cloneDeep(item);
                if (item.value === "") {
                  value.push(_item);
                } else if (!isNaN(item.value)) {
                  value.push(_item);
                } else if (isNaN(item.value)) {
                  _item.value = "";
                  value.push(_item);
                }
              })
              cacheItem.value = value;
              break;
          }
        });
      })
    }
    this.getPartition(_stateData);
    this.setState(_stateData);
  }
  changePartitionInputType(type, index, value) {
    let _stateData = _.cloneDeep(this.state);
    _stateData.partitionArray[index].condition.symbol = value;
    _stateData.partitionArray[index] = exploreRangeService.changeInputType(_stateData.partitionArray[index]);

    let mixtureArray = [];
    mixtureArray.push(_stateData.entityArray);
    mixtureArray.push(_stateData.linkArray);
    mixtureArray.forEach((objectArray) => {
      objectArray.map((partition) => {
        _stateData.partitionArray[index].condition.markedTables.forEach((domainItem) => {
          let id1 = partition.partitionId + "_" + partition.condition.code + "_" + partition.condition.tableName;
          let id2 = _stateData.partitionArray[index].partitionId + "_" + domainItem.code + "_" + domainItem.tableName;
          if (id1 === id2) {
            partition.condition.multiValue = _stateData.partitionArray[index].condition.multiValue;
            partition.condition.symbol = _stateData.partitionArray[index].condition.symbol;
            partition.condition.valueType = _stateData.partitionArray[index].condition.valueType;
            partition.value = [];
            partition.value = _.cloneDeep(_stateData.partitionArray[index].value);
          }
        })
      })
    })
    this.getPartition(_stateData);
    this.setState(_stateData);

  }
  batchModifyInputType(type, index, value) {

    let _stateData = _.cloneDeep(this.state);
    _stateData.batchArray[index].condition.symbol = value;
    _stateData.batchArray[index] = exploreRangeService.changeInputType(_stateData.batchArray[index]);
    let mixtureArray = [];
    mixtureArray.push(_stateData.entityArray);
    mixtureArray.push(_stateData.linkArray);
    mixtureArray.push(_stateData.partitionArray);
    mixtureArray.forEach((objectArray) => {
      objectArray = objectArray.map((cacheItem) => {
        cacheItem.condition.multiValue = _stateData.batchArray[index].condition.multiValue;
        cacheItem.condition.symbol = _stateData.batchArray[index].condition.symbol;
        cacheItem.condition.valueType = _stateData.batchArray[index].condition.valueType;
        cacheItem.value = [];
        cacheItem.value = _.cloneDeep(_stateData.batchArray[index].value);
      })
    });
    this.getPartition(_stateData);
    this.setState(_stateData);
  }
  changeLinkDatePicker(partIndex, valueIndex, value, valueString) {
    let _stateData = _.cloneDeep(this.state);
    _stateData.linkArray[partIndex].value[valueIndex].value = valueString;
    this.getPartition(_stateData);
    this.setState(_stateData);
  }
  changeLinkInput(partIndex, valueIndex, e) {
    let _stateData = _.cloneDeep(this.state);
    _stateData.linkArray[partIndex].value[valueIndex].value = e.target.value;
    this.getPartition(_stateData);
    this.setState(_stateData);
  }
  changeEntityDatePicker(partIndex, valueIndex, value, valueString) {
    let _stateData = _.cloneDeep(this.state);
    _stateData.entityArray[partIndex].value[valueIndex].value = valueString;
    this.getPartition(_stateData);
    this.setState(_stateData);
  }
  changeEntityInput(partIndex, valueIndex, e) {
    let _stateData = _.cloneDeep(this.state);
    _stateData.entityArray[partIndex].value[valueIndex].value = e.target.value;
    this.getPartition(_stateData);
    this.setState(_stateData);
  }
  batchModifyDatePicker(type, partIndex, valueIndex, value, valueString) {
    let _stateData = _.cloneDeep(this.state);
    if (type === 'PARTITION') {
      _stateData.partitionArray[partIndex].value[valueIndex].value = valueString;
      let mixtureArray = [];
      mixtureArray.push(_stateData.entityArray);
      mixtureArray.push(_stateData.linkArray);
      mixtureArray.forEach((objectArray) => {
        objectArray.map((partition) => {
          _stateData.partitionArray[partIndex].condition.markedTables.forEach((domainItem) => {
            let id1 = partition.partitionId + "_" + partition.condition.code + "_" + partition.condition.tableName;
            let id2 = _stateData.partitionArray[partIndex].partitionId + "_" + domainItem.code + "_" + domainItem.tableName;
            if (id1 === id2) {
              partition.condition.symbol = _stateData.partitionArray[partIndex].condition.symbol;
              partition.condition.valueType = _stateData.partitionArray[partIndex].condition.valueType;
              partition.value = [];
              partition.value = _.cloneDeep(_stateData.partitionArray[partIndex].value);
            }
          })
        })
      })

    }
    if (type === 'BATCH') {
      _stateData.batchArray[partIndex].value[valueIndex].value = valueString;
      let mixtureArray = [];
      mixtureArray.push(_stateData.entityArray);
      mixtureArray.push(_stateData.linkArray);
      mixtureArray.push(_stateData.partitionArray);
      mixtureArray.forEach((objectArray) => {
        objectArray = objectArray.map((cacheItem) => {
          if (cacheItem.condition.type === "TEXT") {
            cacheItem.condition.symbol = _stateData.batchArray[partIndex].condition.symbol;
            cacheItem.condition.valueType = _stateData.batchArray[partIndex].condition.valueType;
            cacheItem.value = [];
            cacheItem.value = _.cloneDeep(_stateData.batchArray[partIndex].value);
          }
        });
      });
      this.getPartition(_stateData);
      this.setState(_stateData);
    }
  }
  showExploreRangeModal(partition) {
    let _stateData = _.cloneDeep(this.state);
    _stateData.isShowExpRangeModal = true;
    this.exploreRangeModalInfo.partition = partition;
    this.exploreRangeModalInfo.mixtureArray = _.concat(this.state.entityArray, this.state.linkArray);
    this.setState(_stateData);
  }

  addInputBox(partition) {
    exploreRangeService.addInputBox(partition);
  }

  getPartitionDOM(partitionArray) {
    return partitionArray.map((partition, index) => {
      return (<div key={index}>
                <Row>
                  <Icon type="info-circle-o" onClick={this.showExploreRangeModal.bind(this,partition)}/>
                  <label>{partition.condition.name}({partition.condition.chineseType}): </label>
                  <Select onChange={this.changePartitionInputType.bind(this,partition.type,index)}  value={this.state.partitionArray[index].condition.symbol} style={{width:200}}>
                    {exploreRangeService.conditionArray.map((item,condIndex)=>{
                      return(<Option key={condIndex} value={item.value}>{item.symbol}</Option>)
                    })}
                  </Select>
                </Row>
                <div>
                {partition.value.map((item,valueIndex)=>{
                  let inputBox ="";
                  let minuxButton="";
                  let plusButton="";
                  if(partition.condition.multiValue){
                    plusButton=<Icon type="plus" onClick={this.addInputBox.bind(this,partition)} />
                  }
                  if(item.type==='DATE'){
                    inputBox=<DatePicker format={partition.condition.type==='DATETIME'?"yyyy-MM-dd HH:mm:ss":"yyyy-MM-dd"} value={this.state.partitionArray[index].value[valueIndex].value} onChange={this.batchModifyDatePicker.bind(this,partition.type,index,valueIndex)} showTime={partition.condition.type==='DATETIME'}/>
                  }else if(item.type==='INPUT'){
                    inputBox=<input type="text"  placeholder="请输入此类分区取值" onChange={this.batchModifyInput.bind(this,partition.type,index,valueIndex)} value={this.state.partitionArray[index].value[valueIndex].value}/>
                  }
                  if(partition.condition.multiValue){
                    minuxButton=<Icon type="minus" onClick={this.removeInputBox.bind(this,partition,item)}/>
                  }
                  return (
                    <Row key={valueIndex}>{plusButton}{inputBox}{minuxButton}</Row>
                    );
                })}
                </div>
              </div>);
    });
  }

  getLinkDOM(objectArray) {
    return objectArray.map((object, index) => {
      return (<div key={index}>
                <Row>
                  <label>{object.condition.name}({object.condition.chineseType}):</label>
                  <Select onChange={this.changeLinkInputType.bind(this,index)} value={this.state.linkArray[index].condition.symbol} style={{width:120}}>
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
                    plusButton = <Icon type="plus" onClick={this.addInputBox.bind(this,object)} />
                  }
                  if(item.type==='DATE'){
                    inputBox = <DatePicker value={this.state.linkArray[index].value[valueIndex].value} onChange={this.changeLinkDatePicker.bind(this,object.type,index,valueIndex)} showTime={object.condition.type==='DATETIME'}/>
                  }else if(item.type==='INPUT'){
                    inputBox = <input type="text"  value={this.state.linkArray[index].value[valueIndex].value} onChange={this.changeLinkInput.bind(this,index,valueIndex)} placeholder="请输入此类分区取值"  />
                  }
                  if(object.condition.multiValue){
                   minusButton = <Icon type="minus" onClick={this.removeInputBox.bind(this,object,item)}/>
                  }
                  return (<Row key={valueIndex}>{plusButton}{inputBox}{minusButton}</Row>);
                })}
                </div>
              </div>);
    });
  }
  getEntityDOM(objectArray) {
    return objectArray.map((object, index) => {
      return (<div key={index}>
                <Row>
                  <label>{object.condition.name}({object.condition.chineseType}):</label>
                  <Select onChange={this.changeEntityInputType.bind(this,index)} value={this.state.entityArray[index].condition.symbol} style={{width:120}}>
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
                    plusButton = <Icon type="plus" onClick={this.addInputBox.bind(this,object)} />
                  }
                  if(item.type==='DATE'){
                    inputBox = <DatePicker value={this.state.entityArray[index].value[valueIndex].value} onChange={this.changeEntityDatePicker.bind(this,index,valueIndex)} showTime={object.condition.type==='DATETIME'}/>
                  }else if(item.type==='INPUT'){
                    inputBox = <input type="text"  value={this.state.entityArray[index].value[valueIndex].value} onChange={this.changeEntityInput.bind(this,index,valueIndex)} placeholder="请输入此类分区取值" />
                  }
                  if(object.condition.multiValue){
                   minusButton = <Icon type="minus" onClick={this.removeInputBox.bind(this,object,item)}/>
                  }
                  return (<Row key={valueIndex}>{plusButton}{inputBox}{minusButton}</Row>);
                })}
                </div>
              </div>);
    });
  }
  getBatchModifyDOM(batchArray) {
    return batchArray.map((partition, index) => {
      return (<div key={index}>
                <Row>
                  <label>{partition.condition.name}:</label>
                  <Select onChange={this.batchModifyInputType.bind(this,partition.type,index)} value={this.state.batchArray[index].condition.symbol} style={{width:200}}>
                    {exploreRangeService.conditionArray.map((item,condIndex)=>{
                      return(<Option key={condIndex} value={item.value}>{item.symbol}</Option>)
                    })}
                  </Select>
                </Row>
                {partition.value.map((item,valueIndex)=>{
                  let inputBox ="";
                  let minuxButton="";
                  let plusButton="";
                  if(partition.condition.multiValue){
                      plusButton= <Icon type="plus" onClick={this.addInputBox.bind(this,partition)} />;
                    }
                  if(item.type==='DATE'){
                     inputBox =<DatePicker value={this.state.batchArray[index].value[valueIndex].value} format={partition.condition.type==='DATETIME'?"yyyy-MM-dd HH:mm:ss":"yyyy-MM-dd"} onChange={this.batchModifyDatePicker.bind(this,partition.type,index,valueIndex)} showTime={partition.condition.type==='DATETIME'}/>;           
                  }else if(item.type==='INPUT'){
                     inputBox= <Input type="text"  placeholder="请输入此类分区取值" onChange={this.batchModifyInput.bind(this,partition.type,index,valueIndex)} value={this.state.batchArray[index].value[valueIndex].value}/>
                  }
                  if(partition.condition.multiValue){
                       minuxButton= <Icon type="minus" onClick={this.removeInputBox.bind(this,partition,item)}/>;
                  }
                  return (
                    <Row className="condition-input-box" key={valueIndex}>
                      <Col span={20}>{inputBox}</Col>
                      <Col className="action-btn" span={2}>{plusButton}</Col>
                      <Col className="action-btn" span={2}>{minuxButton}</Col>
                    </Row>
                  );
                })}
              </div>);
    });
  }
  onSubmitExpRangeModal(param) {
    let _stateData = _.cloneDeep(this.state);
    _stateData.isShowExpRangeModal = false;
    param.forEach((item) => {
      switch (item.condition.domainType) {
        case 1:
          let entityIndex = _.findIndex(this.state.entityArray, (obj) => {
            let id1 = obj.partitionId + "_" + obj.condition.code + "_" + obj.condition.tableName;
            let id2 = item.partitionId + "_" + item.condition.code + "_" + item.condition.tableName;
            return id1 === id2;
          });
          _stateData.entityArray[entityIndex] = item;
          break;
        case 2:
          let linkIndex = _.findIndex(this.state.linkArray, (obj) => {
            let id1 = obj.partitionId + "_" + obj.condition.code + "_" + obj.condition.tableName;
            let id2 = item.partitionId + "_" + item.condition.code + "_" + item.condition.tableName;
            return id1 === id2;
          });
          _stateData.linkArray[linkIndex] = item;
          break;
      }
    })
    this.getPartition(_stateData);
    this.setState(_stateData);
  }
  onCancleExpRangeModal() {
    let _stateData = _.cloneDeep(this.setState);
    _stateData.isShowExpRangeModal = false;
    this.setState(_stateData);
  }
  render() {
    let partitionDOM = [];
    let batchDOM = this.getBatchModifyDOM(this.state.batchArray);
    switch (this.state.radioValue) {
      case 'PARTITION':
        partitionDOM = this.getPartitionDOM(this.state.partitionArray);
        break;
      case 'ENTITY':
        partitionDOM = this.getEntityDOM(this.state.entityArray);
        break;
      case 'LINK':
        partitionDOM = this.getLinkDOM(this.state.linkArray);
        break;
    }
    if (this.state.loading) {
      return (
        <div>
          <span>loading</span>
        </div>);
    } else {

      return (
        <div className="explore-range-container">
          <RadioGroup onChange = {this.onChangeRadio.bind(this)} value = {this.state.radioValue}>
            <Radio value="PARTITION">所有分区</Radio>
            <Radio value="ENTITY">所有实体</Radio>
            <Radio value="LINK">所有关系</Radio>
          </RadioGroup>
          <div className="explore-steps-batch-setting">
          </div>
          <div className="explore-steps-batch-setting-container">
          {batchDOM}
          </div>
          <div>
            {partitionDOM}
          </div>
          <ExploreRangeModal 
            isShow={this.state.isShowExpRangeModal} 
            data={this.exploreRangeModalInfo} 
            onOK={this.onSubmitExpRangeModal.bind(this)} 
            onCancle={this.onCancleExpRangeModal.bind(this)}
            removeInputBox={this.removeInputBox}
            addInputBox={this.addInputBox}
            />
        </div>
      );
    }
  }
}
module.exports = ExploreRange;
