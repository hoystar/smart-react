require('./search-box.less');
var React = require('react');
var baseCom = require("../../../../../../console/coms/commons/base/baseCom.jsx");
import classnames from 'classnames';
import { Input, Button } from 'antd';
const InputGroup = Input.Group;

class SearchBox extends baseCom {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      focus: false,
    };
  }

  handleInputChange(e) {
    this.setState({
      value: e.target.value,
    });
  }

  handleFocusBlur(e) {
    this.setState({
      focus: e.target === document.activeElement,
    });
  }

  handleSearch() {
    if (this.props.onSearch) {
      this.props.onSearch(this.state.value);
    }
  }

  render() {
    const btnCls = classnames({
      'ant-search-btn': true,
      'ant-search-btn-noempty': !!this.state.value.trim(),
      "search-btn": true
    });

    return (
      <div className="search-input-container">
        <InputGroup className='ant-search-input'>
          <Input className="search-input" placeholder={this.props.placeholder} value={this.state.value} onChange={this.handleInputChange.bind(this)}
          onFocus={this.handleFocusBlur.bind(this)} onBlur={this.handleFocusBlur.bind(this)} onPressEnter={this.handleSearch.bind(this)} />
            <div className="ant-input-group-wrap">
              <Button icon="search" className={btnCls} onClick={this.handleSearch.bind(this)} />
            </div>
        </InputGroup>
      </div>
    );
  }
}

module.exports = SearchBox;
