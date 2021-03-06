export type SignUpResult = {
  signUp: {
    id: string
  }
}
export const SignUp = `
mutation($email: String!, $password: String!, $password_confirm: String!) {
  signUp(input: {email: $email, password: $password, password_confirm: $password_confirm}) {
    id
  }
}
`

export type SignInResult = {
  signIn: {
    token: string,
    username: string,
    email: string,
    id: string,
    avatar: string
  }
}
export const SignIn = `
mutation($email: String!, $password: String!) {
  signIn(input: { email: $email, password: $password }) {
    token, username, email, id, avatar
  }
}
`
export type GetUserTeamParams = {
  userId: string
}
export type GetUserTeamsResult = {
  users_by_pk: {
    id: string,
    user_teams: {
      team: {
        id: string,
        title: string,
        master: string,
        is_personal: boolean
      }
    }[]
  },
}
export const GetUserTeams = `
query($userId: uuid!) {
  users_by_pk(id: $userId) {
    id, user_teams {
      team {
      id, title, master, is_personal
      }
    }
  }
}
`

export type GetTeamDocsParams = {
  teamId: string
}
export type GetTeamDocsResult = {
  doc: {
    id: string,
    title: string,
    created_at: string,
    visibility: string
  }[]
}
export const GetTeamDocs = `
query($teamId: uuid!) {
  doc(where: {
    team_id: { _eq: $teamId }
  }, order_by: {
    created_at: desc
  }) {
    id, title, created_at, visibility
  }
}
`
export type CreateDocParams = {
  teamId: string,
  title: string,
  visibility: string,
  template: string
}
export type CreateDocResult = {
  insert_doc_one: {
    id: string
  }
}
export const CreateDoc = `
mutation($teamId: uuid!, $title: String!, $visibility: String!, $template: String!) {
  insert_doc_one(object: {
    team_id: $teamId,
    visibility: $visibility,
    title: $title,
    template: $template
  }) {
    id
  }
}
`

export type GetTeamByIdParams = {
  teamId: string
}
export type GetTeamByIdResult = {
  teams_by_pk: {
    title: string,
    id: string,
    is_personal: boolean,
    master: string
    docs: {
      id: string,
      title: string,
      visibility: 'public' | 'private',
      created_at: string
    }[]
  },
}
export const GetTeamById = `
query($teamId: uuid!) {
  teams_by_pk(id: $teamId) {
    title,
    is_personal,
    master,
    id,
    docs {
      id,
      title,
      visibility,
      created_at
    }
  }
}
`
export type GetDocByIdParams = {
  docId: string
}
export type GetDocByIdResult = {
  doc_by_pk: {
    visibility: 'public' | 'private',
    code_highlights: string[]
    id: string
    title: string,
    team: {
      title: string,
      id: string
    },
    directories: {
      title: string,
      id: string,
      pages: {
        slug: string,
        title: string,
        id: string
      }[]
    }[],
    default_page?: string
    template: string
    pages: {
      id: string,
      slug: string,
      title
    }[]
  }
}
export const GetDocById = `
query($docId: uuid!) {
  doc_by_pk(id: $docId) {
    visibility,
    code_highlights,
    template,
    directories(order_by:{
      index: asc
    }) {
      id,
      title,
      pages(
        order_by: [
          {
            index: asc
          },
          {
            created_at: asc
          }
        ]
      ) {
        slug, title, id
      }
    },
    team {
      title, id
    }, default_page, 
    id, title, pages(
      order_by: [
        {
          index: asc
        },
        {
          created_at: asc
        }
      ],
      where: { _or: [ 
        {directory_id: { _is_null: true }}, 
        {directory: { deleted_at: { _is_null: false } }} 
        ] 
      }
    ) {
      slug, title, id
    }
  }
}
`

export type CreatePageParams = {
  object: {
    doc_id: string,
    content?: string,
    title?: string,
    directory_id?: string
    index?: number,
    slug: string,
  }
}
export type CreatePageResult = {
  insert_page_one: {
    id: string,
    slug: string,
    title: string
  }
}
export const CreatePage = `
mutation ($object: page_insert_input!) {
  insert_page_one(object: $object) {
    id, slug, title
  }
}
`

export type UpdateDocParams = {
  docId: string,
  input: {
    title?: string,
    default_page?: string,
    code_highlights?: string[],
    template?: string
    visibility?: 'private' | 'public'
  }
}
export type UpdateDocResult = {
  update_doc_by_pk: {
    id: string
  }
}
export const UpdateDoc = `
mutation ($docId: uuid!, $input: doc_set_input!) {
  update_doc_by_pk(_set: $input, pk_columns: {
    id: $docId
  }) {
    id
  }
}
`

export type CreateTeamParams = {
  title: string
}
export type CreateTeamResult = {
  createTeam: {
    teamId: string
  }
}
export const CreateTeam = `
mutation ($title: String!) {
  createTeam(input: {title: $title}) {
    teamId
  }
}
`


export type GetTeamFullInfoParams = {
  teamId: string
}
export type GetTeamFullInfoResult = {
  teams_by_pk: {
    invite_id: string,
    team_users: {
      user: {
        id: string,
        email: string,
        username: string,
        avatar: string
      }
    }[]
  }
}
export const GetTeamFullInfo = `
query($teamId:uuid!) {
  teams_by_pk(id:$teamId) {
    invite_id,
    team_users {
      user {
        id, email, username, avatar
      }
    }
  }
}
`

export type JoinTeamResult = {
  joinTeam: {
    teamId: string
  }
}
export type JoinTeamParasm = {
  inviteId: string
}
export const JoinTeam = `
mutation($inviteId: uuid!) {
  joinTeam(inviteId: $inviteId) {
    teamId
  }
}
`

export type RemoveMemberReuslt = {
  delete_user_team: {
    affected_rows: number
  }
}
export type RemoveMemberParams = {
  teamId: string,
  userId: string
}
export const RemoveMember = `
mutation($teamId: uuid!, $userId: uuid!) {
  delete_user_team(where:{
    team_id: { _eq: $teamId },
    user_id: { _eq: $userId }
  }) {
    affected_rows
  }
}
`

export type RevokeInviteIdParams = {
  teamId: string
}
export type RevokeInviteIdResult = {
  revokeInviteId: {
    code: string
  }
}
export const RevokeInviteId = `
mutation($teamId: uuid!) {
  revokeInviteId(teamId: $teamId) {
    code
  }
}
`

export type UpdateTeamInfoParams = {
  teamId: string,
  input: {
    title: string
  }
}
export type UpdateTeamInfoResult = {
  update_teams_by_pk: {
    id: string
  }
}
export const UpdateTeamInfo = `
mutation($teamId: uuid!, $input: teams_set_input) {
  update_teams_by_pk(_set: $input, pk_columns: {
    id: $teamId
  }) {
    id
  }
}
`


export type GetPageByDocIdAndSlugParams = {
  docId: string,
  pageSlug: string
}
export type GetPageByDocIdAndSlugResult = {
  page: {
    title: string
    content: string
    id: string
  }[]
}
export const GetPageByDocIdAndSlug = `
query($docId: uuid!, $pageSlug: String!) {
  page(where:{
    slug: {  _eq: $pageSlug},
    doc_id: {_eq: $docId}
  }) {
    content, title, id
  }
}
`

export const batchResortPagesMutation = (ids: Array<string>) => {

  return `
      mutation {
        ${ids.map((id, index) => {
          return `
            update_${index}: update_page_by_pk(pk_columns: {id: "${id}"}, _set:{
              index: ${index}
            }) {
              index
            }
          `
        }).join('\n')}
      }      
      `
}

export const batchResortDirectoriesMutation = (ids: Array<string>) => {

  return `
      mutation {
        ${ids.map((id, index) => {
          return `
            update_${index}: update_directory_by_pk(pk_columns: {id: "${id}"}, _set:{
              index: ${index}
            }) {
              index
            }
          `
        }).join('\n')}
      }      
      `
}


export type EditDirectoryParams = {
  directoryId: string,
  input: {
    title?: string,
    deleted_at?: Date
  }
}
export const EditDirectory = `
mutation ($directoryId: uuid!, $input: directory_set_input!) {
  update_directory_by_pk(pk_columns: {id: $directoryId}, _set: $input) {
    id
  }
}
`


export type UpdatePageByIdParams = {
  pageId: string,
  input: {
    directory_id?: string,
    index?: number
  }
}
export type UpdatePageByIdResult = {
  update_page_by_pk: {
    id: string
  }
}
export const UpdatePageById = `
mutation ($pageId: uuid!, $input: page_set_input) {
  update_page_by_pk(pk_columns: {id: $pageId}, _set: $input) {
    id
  }
}
`

export type EditPageParams = {
  docId: string,
  pageSlug: string,
  input: {
    title?: string,
    content?: string,
  }
}
export type EditPageResult = {
  update_page: {
    affected_rows: number
  }
}
export const EditPage = `
mutation($docId: uuid!, $pageSlug: String! $input: page_set_input!) {
  update_page (where: {
    doc_id: {_eq: $docId},
    slug: {_eq:$pageSlug}
  }, _set: $input){
    affected_rows
  }
}
`

export type DeletePageParams = {
  pageId: string
}
export type DeletePageResult = {
  update_page_by_pk: {
    id: string
  }
}
export const DeletePage = `
mutation($pageId: uuid!) {
  update_page_by_pk (_set:{
    deleted_at: "now()"
  }, pk_columns:{id: $pageId}) {
    id
  }
}
`


export type GetUserInfoParams = {
  userId: string
}
export type GetUserInfoResult = {
  users_by_pk: {
    id: string, username: string, email: string, auth_service?: string
  }
}

export const GetUserInfo = `
query($userId:uuid!) {
	users_by_pk(id: $userId)  {
    id, username, email, auth_service
  }
}
`

export type UpdateUserInfoParams = {
  userId: string,
  input: {
    username: string
  }
}
export type UpdateUserInfoResult = {
  update_users_by_pk: {
    id: string
  }
}
export const UpdateUserInfo = `
mutation($userId:uuid!, $input: users_set_input!) {
  update_users_by_pk(pk_columns:{
    id: $userId
  }, _set: $input) {
    id
  }
}
`

export type CreateDirectoryParams = {
  docId: string,
  title: string
}
export type CreateDirectoryResult = {
  insert_directory_one: {
    id: string
  }
}
export const CreateDirectory = `
mutation($docId: uuid!, $title: String!) {
  insert_directory_one(object: {
    doc_id: $docId,
    title: $title,
  }) {
    id
  }
}
`

export const RemoveDirectory = `
mutation ($directoryId: uuid!) {
  update_directory
}
`