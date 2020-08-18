import * as React from 'react'
import { render } from 'react-dom'
import classnames from 'classnames'
import { ArrowDownIcon, ArrowRightIcon, SettingsIcon, TeamIcon, UserIcon } from '../components/Icon'
import Team from './Team'
import { useQuery } from 'urql'
import { GetUserTeamParams, GetUserTeams, GetUserTeamsResult } from '../gql'
import { userService } from '../service'
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom'
import Doc from './Doc'

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
      <div className={classnames('flex justify-between mb-4 cursor-pointer hover:text-blueGray-500', { 'text-gray-500': !isSelected })} onClick={_ => setIsSelected(!isSelected)}>
        <div className={classnames('flex')}>
          {props.icon && props.icon}
          <span className='ml-2'>{props.title}</span>
        </div>
        {props.arrow === false ? null : isSelected ? <ArrowDownIcon /> : <ArrowRightIcon />}
      </div>

      {isSelected && props.children}
    </div>
  )
}

export default ({
  children,
}) => {
  // @ts-expect-error
  const [getUserTeamsResult, getUserTeams] = useQuery<GetUserTeamsResult, GetUserTeamParams>({ query: GetUserTeams, variables: { userId: userService.getUserInfo()?.id }, pause: !userService.isLogin() })

  if (getUserTeamsResult.fetching) {
    return <div></div>
  }

  if (getUserTeamsResult.data) {
    const teams = getUserTeamsResult.data.users_by_pk.user_teams

    return (
      <div className='container mx-auto flex h-screen text-blueGray-900'>
        <div className='w-64 border-r-2 border-gray-100'>
          <div className='p-6 box-border'>
            <h1 className='logo text-2xl text-blueGray-900'>Docmate</h1>
            <h1>Cloud</h1>
          </div>

          <nav className='p-6 flex flex-col justify-between'>
            <div>
              <NavItem defaultSelected={true} icon={<TeamIcon />} title='Teams'>
                {teams.map(team => {
                  const selected = false
                  return (
                    <Link key={team.team.id}
                      className={classnames('mb-2 pl-4 py-2 rounded block text-gray-500 hover:text-blueGray-900 hover:bg-blueGray-50 cursor-pointer transition-all duration-200', { 'bg-blueGray-50': selected, 'text-blueGray-900': selected })}
                      to={`/team/${team.team.id}`}>
                      {team.team.title}
                    </Link>
                  )
                })}
              </NavItem>

              <NavItem arrow={false} icon={<SettingsIcon />} title='Settings'>
              </NavItem>
            </div>

            <div>
              <div className='flex text-gray-500'>
                <UserIcon />
                <span className='ml-2'>Account</span>
              </div>
            </div>
          </nav>
        </div>

        <Switch>
          <Route path='/team/:teamId'>
            <Team teams={teams} />
          </Route>
          <Route path='/doc/:docId' component={Doc}>
          </Route>
        </Switch>
      </div>
    )
  }
}
