import { useFormik } from 'formik'
import * as React from 'react'
import { httpClient } from '../client'
import * as yup from 'yup'
import { Redirect, Route, Switch, useHistory } from 'react-router-dom'
import { userService } from '../service'

declare var process
export default () => {

  if (userService.isLogin()) {
    return <Redirect to='/' />
  }

  return (
    <div className='h-full flex bg-gray-50 flex-col justify-center' >
      <div className='bg-white mx-auto rounded-lg shadow-xl p-8' style={{ width: '24rem' }}>
        <h1 className='mb-8 font-bold text-center text-lg'>
          Welcome to Docmate
        </h1>
        {process.env.USE_OAUTH === 'true' ? <SSO /> : (
          <Switch>
            <Route path='/sign/in' component={SignIn} exact />
            <Route path='/sign/up' component={SignUp} exact />
            <Route path='/sign' exact>
              <Redirect to='sign/up' />
            </Route>
          </Switch>
        )}
      </div>
    </div>
  )
}

function SignUp() {
  const [errorMessage, setErrorMessage] = React.useState(null as null | string)
  const history = useHistory()
  const form = useFormik({
    initialValues: {
      password: '',
      password_confirm: '',
      email: ''
    },
    validationSchema() {
      return yup.object().shape({
        password: yup.string().required(),
        password_confirm: yup.string().required(),
        email: yup.string().required()
      })
    },
    async onSubmit(values) {
      try {
        const result = await httpClient.post<{
          message: string,
          id: string,
          email: string,
          avatar: string,
          username: string
        }>('/api/v1/signUp', {
          email: values.email,
          password: values.password,
          password_confirm: values.password_confirm
        })
        location.reload()
      } catch (e) {
        const errorMessage = e.response.data.message
        setErrorMessage(errorMessage)
      }
    }
  })

  return (
    <div>
      <div className='text-red-900'>
        {errorMessage}
      </div>
      <form onSubmit={form.handleSubmit}>
        <div className='flex flex-col'>
          <label htmlFor="email">Email</label>
          <input name="email" onChange={form.handleChange} value={form.values.email} className="focus:outline-none" type="email" placeholder="john@smith.com" />
        </div>
        <div className='flex flex-col mt-4'>
          <label htmlFor="password">Password</label>
          <input name="password" onChange={form.handleChange} value={form.values.password} className="focus:outline-none" type="password" placeholder="" />
        </div>
        <div className='flex flex-col mt-4'>
          <label htmlFor="password_confirm">Password Confirm</label>
          <input name="password_confirm" onChange={form.handleChange} value={form.values.password_confirm} className="focus:outline-none" type="password" placeholder="" />
        </div>

        <div className='mt-8'>
          <button type='submit' className='w-full rounded-full border-blueGray-500 border-2 bg-blueGray-500 text-sm text-white font-bold py-2'>Create Account</button>
        </div>
      </form>
      <div className='mt-4'>
        <button onClick={_ => { history.push('/sign/in') }} className='w-full rounded-full border-2 border-blueGray-500 text-sm text-blueGray-500 font-bold py-2'>Already have account</button>
      </div>
    </div>
  )
}

function SignIn() {

  const [errorMessage, setErrorMessage] = React.useState(null as null | string)

  const history = useHistory()

  const form = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    async onSubmit(values) {
      try {
        const result = await httpClient.post<{
          message: string,
          id: string,
          email: string,
          avatar: string,
          username: string
        }>('/api/v1/signIn', {
          email: values.email,
          password: values.password
        })
        location.reload()
      } catch (e) {
        const errorMessage = e.response.data.message
        setErrorMessage(errorMessage)
      }
    }
  })


  return (
    <div>
      <div className='text-red-900'>
        {errorMessage}
      </div>
      <form onSubmit={form.handleSubmit}>
        <div className='flex flex-col'>
          <label htmlFor="email">Email</label>
          <input value={form.values.email} onChange={form.handleChange} name="email" className="focus:outline-none" type="email" placeholder="john@example.com" />
        </div>
        <div className='flex flex-col mt-4'>
          <label htmlFor="password">Password</label>
          <input name="password" value={form.values.password} onChange={form.handleChange} className="focus:outline-none" type="password" placeholder="" />
        </div>

        <div className='mt-8'>
          <button type='submit' className='w-full rounded-full border-blueGray-500 border-2 bg-blueGray-500 text-sm text-white font-bold py-2'>Sign In</button>
        </div>
      </form>
      <div className='mt-4'>
        <button  onClick={_ => { history.push('/sign/up') }} className='w-full rounded-full border-2 border-blueGray-500 text-sm text-blueGray-500 font-bold py-2'>Create Account</button>
      </div>
    </div>
  )
}

function SSO() {
  return (
    <div className='flex justify-center'>
      <button className='border-2 border-gray-900 rounded-full px-4 py-2 flex hover:bg-gray-100 animate'>
        <img className='w-8 h-8' src={require('../assets/github.png')} alt="" />
        <a href={`/login/github`} className='self-center ml-4'>
          Continue with Github
        </a>
      </button>
    </div>
  )
}