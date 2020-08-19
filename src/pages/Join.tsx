import * as React from 'react'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import { client } from '../client'
import { JoinTeam, JoinTeamParasm, JoinTeamResult } from '../gql'
import { userService } from '../service'
import biu from 'biu.js'

export default (props: RouteComponentProps<{ inviteId: string }>) => {
  const { inviteId } = props.match.params

  if (!userService.isLogin()) {
    return <Redirect to='/sign' />
  }

  const onClickJoin = async () => {
    const joinTeamResult = await client.mutation<JoinTeamResult, JoinTeamParasm>(JoinTeam, { inviteId: inviteId }).toPromise()

    if (!joinTeamResult.error) {
      props.history.push(`/team/${joinTeamResult.data!.joinTeam.teamId}`)
    } else {
      // TODO:
      biu('Invalid invite link', { type: 'danger' })
    }
  }


  return (
    <div className='container mx-auto flex justify-center flex-col h-full'>
      <div className='self-center'>
        <h1 className='text-5xl text-blueGray-700 font-bold'>Welcome to <span className='logo'>Docmate</span></h1>
        <h2 className='text-3xl text-gray-900 ml-1'>You are invited to join a team.</h2>

        <button onClick={onClickJoin} className='mt-8 bg-blueGray-500 px-6 py-2 rounded-full text-white font-bold shadow-lg'>Accept</button>
      </div>
    </div>
  )
}