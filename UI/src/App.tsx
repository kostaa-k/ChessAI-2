import React from 'react';
import logo from './logo.svg';
import './App.css';
import { ChessBoardLandingPage } from './components/landing-page';
import { Button } from 'semantic-ui-react';
import NavBar from './components/NavBar';


type ClockState = {
  time: Date
}

function App() {
  return (
    <React.Fragment>
      {/* <NavBar/> */}
      <ChessBoardLandingPage/>
    </React.Fragment>
  );
}

export default App;
