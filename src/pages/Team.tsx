
import * as React from 'react'
import { Link, Route, RouteComponentProps, Switch, useHistory } from 'react-router-dom'
import { History } from 'history'
import { useMutation, useQuery } from 'urql'
import { Lock, TeamIcon } from '../components/Icon'
import { GetDocById, GetDocByIdResult, GetTeamById, GetTeamByIdParams, GetTeamByIdResult, GetTeamDocsParams, UpdateTeamInfo, UpdateTeamInfoParams, UpdateTeamInfoResult } from '../gql'
import classnames from 'classnames'
import { useFormik } from 'formik'
import biu from 'biu.js'

export default (props: RouteComponentProps<{ teamId: string }>) => {

  const teamId = props.match.params.teamId

  const path = props.location.pathname.split('/')

  const [getTeamByIdResult] = useQuery<GetTeamByIdResult, GetTeamByIdParams>({ query: GetTeamById, variables: { teamId } })

  if (getTeamByIdResult.fetching) {
    return <div></div>
  }

  if (getTeamByIdResult.data) {

    const team = getTeamByIdResult.data.teams_by_pk

    return (
      <div className='flex-1'>
        <div className='bg-white px-8 py-4 flex justify-between border-b-2 border-gray-100'>
          <div>
            <h1 className='font-bold'>
              {team.title}
            </h1>
          </div>

          <div className='self-center'>
            <a className='bg-blueGray-500 text-gray-100 rounded-full px-4 text-sm font-bold py-2 cursor-pointer '>New Doc</a>
          </div>
        </div>

        <nav className='mt-8 px-8 text-sm'>
          <span className={classnames('border-blueGray-500 pb-2 mr-8', { 'border-b-4': path[path.length - 1] === teamId })}><Link to={`/team/${teamId}`}>Documents</Link></span>
          <span className={classnames('border-blueGray-500 pb-2 mr-8', { 'border-b-4': path[path.length - 1] === 'settings' })}><Link to={`/team/${teamId}/settings`}>Settings</Link></span>
        </nav>

        <div className='mt-10 px-8'>
          <Switch>
            <Route path='/team/:teamId' exact>
              <DocList docs={team.docs} />
            </Route>
            <Route path='/team/:teamId/settings' exact>
              <DocSettings team={team} />
            </Route>
          </Switch>
        </div>
      </div>
    )
  }

  return (
    <div></div>
  )
}

function DocList(props: {
  docs: GetTeamByIdResult['teams_by_pk']['docs']
}) {
  const history = useHistory()

  return <table className='table-fixed w-full bg-white rounded-lg'>
    <thead>
      <tr className='text-left text-gray-500 text-sm'>
        <th className='px-8 py-4'>Title</th>
        <th className='px-8 py-4'>Visibility</th>
        <th className='px-8 py-4'>Created</th>
      </tr>
    </thead>
    <tbody className='shadow-xl rounded-lg'>
      {props.docs.map((doc, index) => {
        return (
          <tr onClick={_ => history.push(`/doc/${doc.id}`)} key={doc.id} className={classnames('text-blueGray-900 hover:text-gray-500 animate cursor-pointer', { 'bg-gray-50': index % 2 === 0 })}>
            <td className='px-8 py-4'>
              {doc.title}
            </td>
            <td className='px-8 py-4'>
              {doc.visibility === 'private' ? <Lock /> : <></>}
            </td>
            <td className='px-8 py-4'>
              {new Date(doc.created_at).toLocaleDateString()}
            </td>
          </tr>
        )
      })}
    </tbody>
  </table>
}

function DocSettings(props: {
  team: GetTeamByIdResult['teams_by_pk']
}) {

  const [ updateTeamInfoResult, updateTeamInfo ] = useMutation<UpdateTeamInfoResult, UpdateTeamInfoParams>(UpdateTeamInfo)

  const form = useFormik({
    initialValues: {
      title: props.team.title
    },
    async onSubmit(values) {
      try {
        const res = await updateTeamInfo({
          teamId: props.team.id,
          input: {
            title: values.title
          }
        })
        biu('Saved', { type: 'success' })
      } catch (e) {
        biu('Error', { type: 'danger' })
      }
    }
  })

  return (
    <form>
      <div className='flex flex-col'>
        <label htmlFor="title">Team name</label>
        <input value={form.values.title} onChange={form.handleChange} name="title" type="text" placeholder='An awesome document' />
      </div>


      <div className='mt-8'>
        <a onClick={form.submitForm} className='btn'>Save</a>
      </div>
    </form>
  )
}