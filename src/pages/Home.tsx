import * as React from 'react'
import { render } from 'react-dom'
import classnames from 'classnames'
import { ArrowDownIcon, ArrowRightIcon, PlusIcon, PlusOnlyIcon, SettingsIcon, TeamIcon, UserGroup, UserIcon } from '../components/Icon'
import Team from './Team'
import { useMutation, useQuery } from 'urql'
import { CreateTeam, CreateTeamParams, CreateTeamResult, GetUserTeamParams, GetUserTeams, GetUserTeamsResult } from '../gql'
import { userService } from '../service'
import { Link, matchPath, Redirect, Route, Switch, useHistory, useRouteMatch } from 'react-router-dom'
import Doc from './Doc'
import Me from './Me'
import Modal from 'react-modal'
import { useFormik } from 'formik'

function NavItem(props: {
  children: any,
  title: string,
  icon?: any,
  expanded?: boolean,
  defaultSelected?: boolean,
  arrow?: boolean
}) {

  const [isSelected, setIsSelected] = React.useState(props.defaultSelected)

  return (
    <div className='mb-6'>
      <div className={classnames('flex justify-between mb-2')} onClick={_ => setIsSelected(!isSelected)}>
        <div className={classnames('flex')}>
          {props.icon && props.icon}
          <span className='ml-1 font-bold uppercase tracking-wide text-xs text-blueGray-500'>{props.title}</span>
        </div>
      </div>

      {props.children}
    </div>
  )
}

export default ({
  children,
}) => {
  // @ts-expect-error
  const [getUserTeamsResult, getUserTeams] = useQuery<GetUserTeamsResult, GetUserTeamParams>({ query: GetUserTeams, variables: { userId: userService.getUserInfo()?.id }, pause: !userService.isLogin() })
  const history = useHistory()
  const [currentTeamId, setCurrentTeamId] = React.useState<string | null>(null)
  const [ createTeamModalVisible, setCreateTeamModalVisible ] = React.useState(false)
  const [createTeamResult, createTeam] = useMutation<CreateTeamResult, CreateTeamParams>(CreateTeam)

  function matchTeamId(pathname: string) {
    const match = matchPath<{ teamId: string }>(pathname, {
      path: '/team/:teamId'
    })
    if (match) {
      setCurrentTeamId(match.params.teamId)
    } else {
      setCurrentTeamId(null)
    }
  }

  const form = useFormik({
    initialValues: {
      title: ''
    },
    async onSubmit(values) {
      if (!values.title) {
        return
      }

      const result = await createTeam({
        title: values.title
      })
      if (!result.error) {
        location.href = `/team/${result.data?.createTeam.teamId}`
      }
    }
  })

  function teardownModal() {
    setCreateTeamModalVisible(false)
    form.resetForm()
  }

  React.useEffect(() => {
    matchTeamId(history.location.pathname)
    return history.listen(props => {
      matchTeamId(props.pathname)
    })
  }, [])

  if (getUserTeamsResult.fetching) {
    return <div></div>
  }

  if (getUserTeamsResult.data) {
    const teams = getUserTeamsResult.data.users_by_pk.user_teams

    return (
      <div className='container mx-auto flex h-screen text-blueGray-900'>

        <Modal
          className='border-none outline-none shadow-xl mx-auto p-8 mt-48 bg-white rounded-lg'
          style={{ content: { width: '30rem' } }}
          isOpen={createTeamModalVisible}
          contentLabel='create new team'
        >
          <h1 className='font-bold mb-4'>Create new team</h1>

          <form onSubmit={form.handleSubmit}>
            <div className='flex flex-col'>
              <label htmlFor="title">Team name</label>
              <input onChange={form.handleChange} value={form.values.title} placeholder='An awesome team' type="text" name="title" />
            </div>

            <button className='bg-blueGray-500 px-4 py-2 mt-8 rounded-full text-sm text-white font-bold'>
              Create
            </button>

            <a onClick={teardownModal} className='cursor-pointer text-sm ml-4'>Cancel</a>
          </form>
        </Modal>

          <div className='w-64 border-r-2 border-gray-100'>
            <div className='p-6 box-border'>
              <h1 className='logo text-2xl text-blueGray-900'>Docmate</h1>
              <h1 className='self-center'>Cloud</h1>
            </div>

            <nav className='p-6 flex flex-col justify-between'>
              <div>
                <div onClick={_ => setCreateTeamModalVisible(true)} className='flex justify-between px-4 bg-blueGray-500 hover:bg-blueGray-700 text-white font-bold animate text-center text-sm mb-4  py-2  rounded  cursor-pointer'>
                  <span className='mr-2'>Create new team</span>
                  <PlusOnlyIcon className='w-5 h-5 self-center' />
                </div>
                <NavItem title='Teams'>
                  {teams.map(team => {
                    let selected = currentTeamId === team.team.id
                    return (
                      <Link key={team.team.id}
                        className={classnames('flex text-sm mb-2 pl-2 py-2 rounded block text-gray-500 hover:text-blueGray-900 hover:bg-blueGray-50 cursor-pointer transition-all duration-200', { 'bg-blueGray-50': selected, 'text-blueGray-900': selected })}
                        to={`/team/${team.team.id}`}>
                        {team.team.is_personal ? <UserIcon className='w-4 h-4 ' /> : <UserGroup className='w-4 h-4  self-center' />}<span className='ml-2 tracking-wide'>{team.team.title}</span>
                      </Link>
                    )
                  })}
                </NavItem>

              </div>

              <div>

              </div>
            </nav>

            <div className='flex text-blueGray-900 px-6 cursor-pointer' onClick={_ => history.push('/me')}>
              {/* <Link className='block' to='/me'> */}
              <div className='mr-2 pt-1'>
                <img className='rounded block w-8 h-8' src={userService.getUserInfo()?.avatar} alt="avatar" />
              </div>
              <div className=''>
                <div className='text-sm'>{userService.getUserInfo()?.username}</div>

                <div className='text-xs text-gray-500'>
                  Free
              </div>
              </div>
              {/* </Link> */}
            </div>
          </div>

          <Switch>
            <Route path='/me' exact component={Me} />
            <Route path='/team/:teamId'>
              <Team teams={teams} />
            </Route>
            <Route path='/doc/:docId' component={Doc}>
            </Route>
            <Route path='/' exact>
              <Redirect to={`/team/${teams[0].team.id}`} />
            </Route>
          </Switch>
      </div>
    )
  }
}
