import { createClient, Provider } from 'urql'
import * as React from 'react'
import { userService } from './service'
import axios from 'axios'

declare var GQL_PATH
declare var process

export const client = createClient({
  url: process.env.GQL_PATH || `http://${location.hostname}:8080/v1/graphql`,
  requestPolicy: 'cache-and-network',
  fetchOptions() {

    const headers = {}

    if (userService.isLogin()) {
      headers['Authorization'] = `Bearer ${userService.getToken()}`
    }

    return {
      headers
    }
  }
})

export const httpClient = axios.create({
  baseURL: process.env.SERVER_HOST || '/',
  headers: {
    'Authorization': `Bearer ${userService.getToken()}`
  }
})

export default (props) => React.createElement(Provider, { value: client }, props.children)
