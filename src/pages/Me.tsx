import { useFormik } from 'formik'
import * as React from 'react'
import { useMutation, useQuery } from 'urql'
import { GetUserInfo, GetUserInfoParams, GetUserInfoResult, UpdateUserInfo, UpdateUserInfoParams, UpdateUserInfoResult } from '../gql'
import { userService } from '../service'
import biu from 'biu.js'

export default () => {

  const [getUserInfoResult] = useQuery<GetUserInfoResult, GetUserInfoParams>({ query: GetUserInfo, variables: { userId: userService.getUserInfo()!.id } })
  const [updateUserInfoResult, updateUserInfo] = useMutation<UpdateUserInfoResult, UpdateUserInfoParams>(UpdateUserInfo)

  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: getUserInfoResult.data?.users_by_pk.username,
      email: getUserInfoResult.data?.users_by_pk.email
    },
    async onSubmit(values) {
      // TODO: verify
      if (!values.username) {
        return
      }

      try {
        await updateUserInfo({
          userId: userService.getUserInfo()!.id,
          input: {
            username: values.username
          }
        })
        biu('Saved', { type: 'success' })

        // TODO: refresh cookies
        location.reload()
      } catch (e) {
        biu('Error', { type: 'danger' })
      }
    }
  })

  if (getUserInfoResult.fetching) {
    return <div>

    </div>
  }

  if (getUserInfoResult.error) {
    return <div>

    </div>
  }

  const userInfo = getUserInfoResult.data!.users_by_pk

  return (
    <div className='flex-1 border-r-2 border-gray-100 p-8'>
      <h1 className='mb-8 font-bold'>Account</h1>
      <form onSubmit={form.handleSubmit}>
        <div className='flex -mx-2'>
          <div className='flex flex-col flex-1 mx-2'>
            <label htmlFor="username">Username</label>
            <input onChange={form.handleChange} value={form.values.username} type="text" name="username" />
          </div>

          <div className='flex flex-col flex-1 mx-2'>
            <label htmlFor="email">Email</label>
            <input className='text-gray-500 cursor-not-allowed p-2' value={userInfo.email} disabled />
          </div>

          {userInfo.auth_service && <div className='flex flex-col flex-1 mx-2 justify-center'>
            <label htmlFor="email">OAuth Service</label>
            {userInfo.auth_service === 'github' && <img className='w-8 h-8' src={require('../assets/github.png')} alt="github" />}
          </div>}

        </div>
        <div className='mt-8'>
          <button className='border-2 border-blueGray-500 font-bold text-sm bg-blueGray-500 animate text-gray-100 px-4 py-2 rounded-full'>
            Update
            </button>

          <a onClick={userService.signOut} className='ml-4 font-bold text-sm animate text-blueGray-500 border-2 border-blueGray-500 px-4 py-2 rounded-full cursor-pointer'>
            Sign Out
            </a>
        </div>

      </form>
    </div>
  )
}