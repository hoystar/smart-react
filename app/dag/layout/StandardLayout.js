"use strict";

import Layout from './Layout';
import TYPE from '../element/type';

//标准视图布局
export default class StandardLayout extends Layout {
  constructor(option) {
    super(option);

    this.isAutoLayout = option.isAutoLayout; //false
    this.isSplitLinks = option.isSplitLinks; //false
  }

  draw(dataSource) { 
    this.layoutCtrl.initLayoutCtrl(dataSource, this.isSplitLinks); //dataSource:canvasData.data
    this.dataSet = this.layoutCtrl.dataSet; //

    if (this.dataSet != null) {
      this.initResolveDataset();
      this.update();
      this.dataSet.setLayout(this.onlyKey, this);
      this.attachDatasetEvent();
    }
  }

  initResolveDataset() {
    var _nodes = this.dataSet.getElementsByType(TYPE.ElementType.ELEMENT_TYPE_NODE);//getElementsByType(1)

    _nodes.forEach(function(item) { //每个元素的属性设置
      item.isExploreAble = true;
      item.isShowTagAble = true;
      item.isSelectAble = false;
    })
  }

}
