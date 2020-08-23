import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './Components/Home';
import Meeting from './Components/Meeting';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/:meetingId" component={Meeting} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
