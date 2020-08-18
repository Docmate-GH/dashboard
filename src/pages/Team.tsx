
import * as React from 'react'
import { Link, Route, RouteComponentProps, Switch, useHistory, useRouteMatch } from 'react-router-dom'
import { History } from 'history'
import { formatDocument, useMutation, useQuery } from 'urql'
import { Lock, TeamIcon } from '../components/Icon'
import { CreateDoc, CreateDocParams, CreateDocResult, GetDocById, GetDocByIdResult, GetTeamById, GetTeamByIdParams, GetTeamByIdResult, GetTeamDocsParams, GetUserTeamsResult, UpdateTeamInfo, UpdateTeamInfoParams, UpdateTeamInfoResult } from '../gql'
import classnames from 'classnames'
import { useFormik } from 'formik'
import biu from 'biu.js'
import Modal from 'react-modal'

export default (props: {
  teams: GetUserTeamsResult['users_by_pk']['user_teams']
}) => {

  const history = useHistory()
  const match = useRouteMatch<{ teamId: string }>()

  const teamId = match.params.teamId

  const path = history.location.pathname.split('/')

  const [getTeamByIdResult] = useQuery<GetTeamByIdResult, GetTeamByIdParams>({ query: GetTeamById, variables: { teamId } })
  const [createDocResult, createDoc] = useMutation<CreateDocResult, CreateDocParams>(CreateDoc)

  function teardownModal() {
    setCreateDocModalVisible(false)
    newDocForm.resetForm()
  }

  const newDocForm = useFormik({
    initialValues: {
      title: '',
      teamId: teamId,
      template: 'docute',
      visibility: 'public'
    },
    async onSubmit(values) {
      // TODO: verify
      try {
        const res = await createDoc({
          title: values.title,
          teamId: values.teamId,
          visibility: values.visibility,
          template: values.template
        })
        biu('Created', { type: 'success' })
        teardownModal()
        history.push(`/doc/${res.data?.insert_doc_one.id}`)
      } catch (e) {
        biu('Error', { type: 'danger' })
      }
    }
  })

  const [createDocModalVisible, setCreateDocModalVisible] = React.useState(false)

  if (getTeamByIdResult.fetching) {
    return <div></div>
  }

  if (getTeamByIdResult.data) {

    const team = getTeamByIdResult.data.teams_by_pk

    return (
      <div className='flex-1 border-r-2 border-gray-100'>
        <div className='bg-white px-8 py-4 flex justify-between border-b-2 border-gray-100'>
          <div>
            <h1 className='font-bold'>
              {team.title}
            </h1>
          </div>

          <div className='self-center'>
            <a className='bg-blueGray-500 text-gray-100 rounded-full px-4 text-sm font-bold py-2 cursor-pointer ' onClick={_ => setCreateDocModalVisible(true)}>New Doc</a>

            <Modal
              className='border-none outline-none shadow-xl mx-auto p-8 mt-48 bg-white rounded-lg'
              style={{ content: { width: '30rem' } }}
              isOpen={createDocModalVisible}
              contentLabel='create doc'
            >
              <h1 className='mb-4 font-bold'>New Document</h1>

              <form onSubmit={newDocForm.handleSubmit}>
                <div className='flex'>
                  <div className='flex flex-col w-32 mr-4'>
                    <label htmlFor="team">Team</label>
                    <select value={newDocForm.values.teamId} onChange={newDocForm.handleChange}>
                      {props.teams.map(team => {
                        return (
                          <option key={team.team.id} value={team.team.id}>{team.team.title}</option>
                        )
                      })}
                    </select>
                  </div>
                  <div className='flex flex-col flex-1'>
                    <label htmlFor="title">Document Title</label>
                    <input onChange={newDocForm.handleChange} type="text" name="title" placeholder='Document title' />
                  </div>
                </div>

                <div className='flex flex-col mt-4'>
                  <label>Template</label>

                  <div className='flex' >
                    <label className='mr-4 flex text-blueGray-900'><input onChange={newDocForm.handleChange} checked={newDocForm.values.template === 'docsify'} className='self-center mr-2' type="radio" name="template" value='docsify' />Docsify</label>
                    <label className='flex text-blueGray-900'><input onChange={newDocForm.handleChange} checked={newDocForm.values.template === 'docute'} className='self-center mr-2' type="radio" name="template" value="docute" />Docute</label>
                  </div>

                </div>

                <div className='flex flex-col mt-4'>
                  <label>Visibility</label>
                  <select name='visibility' value={newDocForm.values.visibility} onChange={newDocForm.handleChange}>
                    <option value="public">Public</option>
                    <option value="private">Only team members</option>
                  </select>
                </div>

                <div className='mt-8 flex'>

                  <button onClick={_ => teardownModal()} className='flex-1 px-8 py-2 text-blueGray-500 border-blueGray-500 border-2 text-sm rounded-full font-bold box-border mr-4'>
                    Cancel
                  </button>
                  <button disabled={createDocResult.fetching} className='flex-1 px-8 py-2 bg-blueGray-500 border-blueGray-500 border-2 text-gray-100 text-sm rounded-full font-bold'>
                    Create
                  </button>


                </div>
              </form>
            </Modal>
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

  return <div>
    <table className='table-fixed w-full bg-white rounded-lg'>
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
    {props.docs.length === 0 && <div className='text-center py-8 text-gray-500 bg-gray-100'>
      No document
      </div>}
  </div>
}

function DocSettings(props: {
  team: GetTeamByIdResult['teams_by_pk']
}) {

  const [updateTeamInfoResult, updateTeamInfo] = useMutation<UpdateTeamInfoResult, UpdateTeamInfoParams>(UpdateTeamInfo)

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