import React from "react";

export default class TestComponent extends React.Component {
    constructor(props:any) {
      super(props);
      this.state = { hasError: false };
    }
  

    render() {
        return <h1>test</h1>
    }
  }