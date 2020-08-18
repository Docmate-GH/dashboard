import 'regenerator-runtime/runtime'
import * as React from 'react'
import { render } from 'react-dom'
import Home from './pages/Home'
import 'biu.js/dist/biu.css'
import Modal from 'react-modal'

Modal.setAppElement(document.querySelector('#root'))

import {
  BrowserRouter as Router, Redirect, Route, Switch,
} from 'react-router-dom'
import { Provider } from 'urql'
import { client } from './client'
import Sign from './pages/Sign'
import { userService } from './service'

const App = () => {
  return (
    <Provider value={client} >
      <Router>
        <Switch>
          <Route path='/sign' exact component={Sign}>
          </Route>
          <Route path='/'>
            { userService.isLogin() ? <Home /> : <Redirect to='/sign' /> }
          </Route>
        </Switch>
      </Router>
    </Provider>
  )
}

render(<App />, document.querySelector('#root'))

