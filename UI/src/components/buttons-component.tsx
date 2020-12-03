import React, { Component, MouseEvent, Props } from 'react';
import { Button } from 'semantic-ui-react'

interface PieceProps {
  color: "white" | "black";
}

export class Buttons extends Component {
  constructor(props: PieceProps){
    super(props)
  }

  handleClick(event: MouseEvent) {
    
    event.preventDefault();
    alert("HELLO")
    //alert(event.currentTarget.tagName); // alerts BUTTON
  }
  
  render() {
    return(
      <div>
        <button onClick={this.handleClick}>ChangeBoard</button>
      </div>
    )

    
  }
  // render() {
  //   return <button onClick={this.handleClick}>
  //     {this.props.children}
  //   </button>
  // }

}

export default (Buttons)