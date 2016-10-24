"use strict";
import { Modal, Button, Form, Input, Tooltip } from 'antd';

var FormItem = Form.Item;
let BaseCom = require("../../../../../../../../console/coms/commons/base/baseCom.jsx");
let languageProvider = require("../../../../../../../../console/services/language/index.js");
require('./save-define-modal.less');

class SaveDefineModal extends BaseCom {
  constructor(props) {
    super(props);
  }
  onInputChange(evt) {
    let _propsData = _.cloneDeep(this.props.data);
    _propsData[evt.target.name] = evt.target.value;
    this.props.saveDataToState && this.props.saveDataToState(_propsData);
  }
  render() {
    var data = this.props.data;
    var formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 }
    };
    return (
      <Modal title={languageProvider["smartview.add_define_modal.create_define"] || "保存探索"} visible={this.props.visible} className="add-define-modal"
        onOk={this.props.onSubmit} onCancel={this.props.onHide} width="420px">
        <Form horizontal>
          <FormItem
            {...formItemLayout}
            label={languageProvider["smartview.add_define_modal.define_name"] || "探索名称"}>
            <Input type="text" name="defineName" value={data.defineName} placeholder={languageProvider["smartview.add_define_modal.define_name_tip"] || "请输入探索名称" } onChange={this.onInputChange.bind(this)}/>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={languageProvider["smartview.add_define_modal.define_describe"] || "探索描述" }>
            <Input type="textarea" name="defineDescription" value={data.defineDescription} placeholder={languageProvider["smartview.add_define_modal.define_describe_tip"] || "请输入探索描述" } onChange={this.onInputChange.bind(this)} autosize={{ minRows: 2, maxRows: 6 }} />
          </FormItem>
        </Form>
      </Modal>
    );
  }

};

module.exports = SaveDefineModal;
