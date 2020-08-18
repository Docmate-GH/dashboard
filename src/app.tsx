import 'regenerator-runtime/runtime'
import * as React from 'react'
import { render } from 'react-dom'
import Home from './pages/Home'
import 'biu.js/dist/biu.css'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'
import Team from './pages/Team'
import { Provider } from 'urql'
import { client } from './client'
import Doc from './pages/Doc'

const App = () => {
  return (
    <Provider value={client} >
      <Router>
        <Home>
          <Switch>
            <Route path='/team/:teamId' component={Team}>
            </Route>
            <Route path='/doc/:docId' component={Doc}>
            </Route>
          </Switch>
        </Home>
      </Router>
    </Provider>
  )
}

render(<App />, document.querySelector('#root'))

