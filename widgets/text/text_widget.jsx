import React from 'react';
import BaseWidget from '../widget.jsx';

export default class TextWidget extends BaseWidget {

  constructor(props) {
    super(props);
    this.state = {title: "init", text: "init"};
  }

  render() {
    return (
      <div className={`text_widget widget ${this.props.customClass || ''}`}>
        <h1>{this.props.title}</h1>
        <h2>{this.state.text}</h2>
      </div>
    );
  }
}
