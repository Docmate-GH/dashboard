import { useFormik } from 'formik'
import * as React from 'react'
import { Route, RouteComponentProps, Switch, useHistory, Link, RouteProps } from 'react-router-dom'
import { useQuery } from 'urql'
import { Lock } from '../components/Icon'
import { GetDocById, GetDocByIdParams, GetDocByIdResult, GetPageByDocIdAndSlug, GetPageByDocIdAndSlugParams, GetPageByDocIdAndSlugResult } from '../gql'
import classnames from 'classnames'
import { useImportScript } from '../utils'

export default (props: RouteComponentProps<{ docId: string }>) => {

  const docId = props.match.params.docId

  const [getDocByIdResult] = useQuery<GetDocByIdResult, GetDocByIdParams>({ query: GetDocById, variables: { docId } })
  const history = useHistory()


  if (getDocByIdResult.error) {
    return <div>

    </div>
  }

  if (getDocByIdResult.fetching) {
    return <div>

    </div>
  }

  const doc = getDocByIdResult.data!.doc_by_pk

  return (

    <div className='border-r-2 border-gray-100 flex-1 h-full flex flex-col'>
      <div className='bg-white px-8 py-4 flex justify-between border-b-2 border-gray-100'>
        <div>
          <div>
            <span className='cursor-pointer'><Link to={`/team/${doc.team.id}`}>{doc.team.title}</Link></span> / <span className='font-bold'><Link to={`/doc/${docId}`}>{doc.title}</Link></span>
          </div>

          <div className='text-xs mt-1 text-gray-500'>
            https://docs.docmate.io/{doc.id}
          </div>

        </div>
        <div className='self-center flex'>
          <Link to={`/doc/${docId}/settings`} className='self-center mr-4 cursor-pointer'>
            Settings
          </Link>

          <a className='bg-blueGray-500 text-gray-100 rounded-full px-4 text-sm font-bold py-2 cursor-pointer '>New Page</a>
        </div>
      </div>

      <Switch>
        <Route path='/doc/:docId/settings' exact>
          <Settings doc={doc} />
        </Route>
        <Route path='/doc/:docId'>
          <Pages doc={doc} />
        </Route>

      </Switch>
    </div>
  )
}

function Pages(props: {
  doc: GetDocByIdResult['doc_by_pk']
}) {
  const pages = props.doc.pages
  const history = useHistory()
  return (
    <div className='flex flex-1'>
      <div className='w-64 border-gray-50'>
        <h1 className='px-4 text-sm font-bold uppercase pt-4 text-blueGray-500'>
          Pages
      </h1>
        <nav>
          {pages.map(page => {
            return (
              <Link key={page.id} className={classnames('my-2 mx-2 px-4 py-2 hover:bg-blueGray-50 cursor-pointer animate rounded block', { 'bg-blueGray-50': history.location.pathname.split('/').pop() === page.slug })} to={`/doc/${props.doc.id}/page/${page.slug}`}>{page.title}</Link>
            )
          })}
        </nav>
      </div>

      <div className='flex-1 h-full flex'>
        <Switch>
          <Route path='/doc/:docId/page/:pageSlug' component={Editor} exact>
          </Route>
        </Switch>
      </div>
    </div>
  )
}

function Editor(props: RouteComponentProps<{ docId: string, pageSlug: string }>) {

  // const { fetching: fetchingCM, error: fetchCMError } = useImportScript('//cdn.jsdelivr.net/npm/codemirror@5.56.0/lib/codemirror.js')

  const { docId, pageSlug } = props.match.params

  const [getPageByIdResult] = useQuery<GetPageByDocIdAndSlugResult, GetPageByDocIdAndSlugParams>({ query: GetPageByDocIdAndSlug, variables: { pageSlug, docId } })

  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: getPageByIdResult.data?.page[0].title,
      content: getPageByIdResult.data?.page[0].content
    },
    onSubmit(values) {

    }
  })

  React.useLayoutEffect(() => {

  }, [])

  if (getPageByIdResult.fetching) {
    return <div>

    </div>
  }

  if (getPageByIdResult.error) {
    return <div>

    </div>
  }

  const page = getPageByIdResult.data!.page[0]

  return (
    <div className='p-4 flex flex-col w-full'>
      <input name='title' onChange={form.handleChange} className='outline-none w-full text-2xl font-bold' type="text" placeholder='Title' value={form.values.title} />

      <CM value={form.values.content} />
    </div>
  )
}

declare var CodeMirror
function CM(props: {
  value
}) {

  const $el = React.useRef<HTMLDivElement>(null)
  const cm = React.useRef<any>(null)

  React.useEffect(() => {
    if (cm.current && props.value) {
      console.log(props.value)
      cm.current.setValue(props.value)
    }
  }, [props.value])

  React.useLayoutEffect(() => {
    cm.current = new CodeMirror($el.current, {
      mode: 'markdown',
      lineWrapping: true,
    })
  }, [])

  return (
    <div className='cursor-text flex-1 outline-none h-64 mt-4' ref={$el}></div>
  )
}

function Settings(props: {
  doc: GetDocByIdResult['doc_by_pk']
}) {
  const form = useFormik({
    initialValues: {
      title: props.doc.title,
      highlights: props.doc.code_highlights,
      visibility: props.doc.visibility
    },
    onSubmit() {

    }
  })

  return (
    <div className='p-8'>
      <form>
        <div className='flex flex-col'>
          <label htmlFor="title">Document Title</label>
          <input onChange={form.handleChange} name='title' value={form.values.title} type="text" />
        </div>

        <div className='flex flex-col mt-8'>
          <label htmlFor="highlights">Syntax Highlights</label>
          <input type="text" />
        </div>

        <div className='flex flex-col mt-8'>
          <label htmlFor="visibility">Visibility</label>
          <select name='visibility' value={form.values.visibility} onChange={form.handleChange}>
            <option value="public">Public</option>
            <option value="private">Only team members</option>

          </select>
        </div>


        <div className='mt-8'>
          <a className='btn'>Save</a>
        </div>
      </form>
    </div>
  )
}