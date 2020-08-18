import 'regenerator-runtime/runtime'
import * as React from 'react'
import { render } from 'react-dom'
import Home from './pages/Home'
import 'biu.js/dist/biu.css'
import Modal from 'react-modal'

Modal.setAppElement(document.querySelector('#root'))

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
        <Home />
      </Router>
    </Provider>
  )
}

render(<App />, document.querySelector('#root'))

