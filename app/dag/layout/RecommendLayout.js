"use strict";

import Layout from './Layout';
import TYPE from '../element/type';

//发现视图布局
export default class RecommendLayout extends Layout {
  constructor(option) {
    super(option);

    this.isAutoLayout = option.isAutoLayout;
    this.isSplitLinks = option.isSplitLinks;
  }

  draw(dataSource) {
    this.layoutCtrl.initLayoutCtrl(dataSource, this.isSplitLinks);
    this.dataSet = this.layoutCtrl.dataSet;

    if (this.dataSet != null) {
      this.initResolveDataset();
      this.update();
      this.dataSet.setLayout(this.onlyKey, this);
      this.attachDatasetEvent();
    }
  }

  initResolveDataset() {
    var _nodes = this.dataSet.getElementsByType(TYPE.ElementType.ELEMENT_TYPE_NODE);

    _nodes.forEach(function(item) {
      item.isExploreAble = true;
      item.isShowTagAble = false;
      item.isSelectAble = true;
    })
  }

}
