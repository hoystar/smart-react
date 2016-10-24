vertexs:[{
type: //节点类型（矩形、凌型==）
identifier: //节点标识（ID）
content: [] //节点内容
detectable: true, //是否能探索标识
critical: true //暂时没用到，我也不知道什么东东
position: //节点位置
}, …],
edges:[{
type: //边类型
vertexs: ["", ""] //起始节点ID，终止节点ID
}, …]

content:
	"code": //ID
	"name": //名称
	"description": //描述
	"tagCount": 标签数量，右侧按钮:0/1/2
	"domainType": 域类型，是实体还是关系
	"position1": //位置
	"position2": 
	"critical":  对于画布这一块暂时没用
	"detectable":  可不可以探索，左边按钮：true/false



node文件夹：画各种形状的相关代码，其中node.js文件是一些共有函数，这些画的动作都是从node.js派生出来的。
edge文件夹：画边、点的相关代码。
layout文件夹：对数据的处理
httpCenter文件夹：大部分的数据请求，跟后台数据连接
