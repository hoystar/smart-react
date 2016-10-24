"use strict";

import StandardLayout from './StandardLayout';
import RecommendLayout from './RecommendLayout';
import ExploreLayout from './ExploreLayout';
import TYPE from './layoutType';

module.exports = function(option) {
  var expLayout = undefined;

  switch (option.canvasType) {
    case TYPE.TYPE_STANDARD:
      expLayout = new StandardLayout(option);
      break;
    case TYPE.TYPE_REOMMEND:
      expLayout = new RecommendLayout(option);
      break;
    case TYPE.TYPE_EXPLORE:
    case TYPE.TYPE_EXPLORE_DEFINE:
    case TYPE.TYPE_EXPLORE_INSTANCE:
      expLayout = new ExploreLayout(option);
      break;
    default:
      expLayout = new StandardLayout(option);
      break;
  }

  return expLayout;
}
