import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Home from './views/Home'
import MagicLink from './views/Magic'
import Signup from './views/Signin'

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} exact />
      <Route path="/auth" component={Signup} exact />
      <Route path="/search" component={MagicLink} exact />
    </Switch>
  )
}

export default App