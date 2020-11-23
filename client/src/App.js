import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Home from './views/Home'
import Signup from './views/Signin'

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} exact />
      <Route path="/auth" component={Signup} exact />
    </Switch>
  )
}

export default App