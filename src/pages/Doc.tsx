import { useFormik } from 'formik'
import * as React from 'react'
import { Route, RouteComponentProps, Switch, useHistory, Link, RouteProps, Redirect } from 'react-router-dom'
import { useMutation, useQuery } from 'urql'
import { Lock, PlusIcon, SaveIcon, TrashIcon } from '../components/Icon'
import { batchResortMutation, CreatePage, CreatePageResult, DeletePage, DeletePageParams, DeletePageResult, EditPage, EditPageParams, EditPageResult, GetDocById, GetDocByIdParams, GetDocByIdResult, GetPageByDocIdAndSlug, GetPageByDocIdAndSlugParams, GetPageByDocIdAndSlugResult, UpdateDoc, UpdateDocParams, UpdateDocResult } from '../gql'
import classnames from 'classnames'
import { highlights, setFieldValue, useImportScript } from '../utils'
import biu from 'biu.js'
import Select from 'react-select'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { client } from '../client'
import { nanoid } from 'nanoid'
export default (props: RouteComponentProps<{ docId: string }>) => {

  const docId = props.match.params.docId

  const [getDocByIdResult] = useQuery<GetDocByIdResult, GetDocByIdParams>({ query: GetDocById, variables: { docId } })
  const [reOrderedPage, setReorderedPage] = React.useState(null as null | GetDocByIdResult['doc_by_pk']['pages'])
  const [createPageResult, createPage] = useMutation<CreatePageResult>(CreatePage)


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

  async function onDragEnd(result) {
    if (!result.destination) {
      return
    }

    if (
      result.destination.droppableId === result.source.droppableId &&
      result.destination.index === result.source.index
    ) {
      return
    }

    const pages = Array.from(doc.pages)
    const p = pages.find(page => page.id === result.draggableId)
    pages.splice(result.source.index, 1)
    pages.splice(result.destination.index, 0, p!)

    const resortMutation = batchResortMutation(pages.map(page => page.id))

    setReorderedPage(pages)

    const resortResult = await client.mutation(resortMutation).toPromise()

    if (resortResult.error) {
      // TODO: resort error
    }
  }

  async function onCreateNewPage() {
    const res = await createPage({
      object: {
        doc_id: docId,
        slug: nanoid(8),
        content: ''
      }
    })
    if (res.data) {
      history.push(`/doc/${docId}/page/${res.data.insert_page_one.slug}`)
    }
  }

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
      </div>

      <div className='flex flex-1'>
        <div className='w-64 border-gray-50 pl-2'>
          <h1 className='px-4 text-sm font-bold uppercase pt-4 text-blueGray-500'>
            Document
          </h1>

          <Link className={classnames('text-sm m-2 px-4 py-2 hover:bg-blueGray-50 cursor-pointer animate rounded block', { 'bg-blueGray-50': history.location.pathname.split('/').pop() === 'settings' })} to={`/doc/${doc.id}/settings`}>Settings</Link>

          <h1 className='px-4 text-sm font-bold uppercase pt-4 text-blueGray-500 flex justify-between'>
            Pages

            <a className='cursor-pointer' onClick={onCreateNewPage}><PlusIcon /></a>
          </h1>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={doc.id}>
              {provided => {
                return (
                  <>
                    <nav ref={provided.innerRef} {...provided.droppableProps}>
                      {doc.pages.map((page, index) => {
                        return (
                          <>
                            <Draggable key={page.id} draggableId={page.id} index={index}>
                              {provided => {
                                return <Link {...provided.dragHandleProps} {...provided.draggableProps} ref={provided.innerRef} key={page.id} className={classnames('text-sm m-2 px-4 py-2 hover:bg-blueGray-50 cursor-pointer animate rounded block', { 'bg-blueGray-50': history.location.pathname.split('/').pop() === page.slug })} to={`/doc/${doc.id}/page/${page.slug}`}>{page.title}</Link>
                              }}
                            </Draggable>
                          </>
                        )
                      })}
                      {provided.placeholder}
                    </nav>
                  </>
                )
              }}
            </Droppable>
          </DragDropContext>
        </div>

        <div className='flex-1 h-full flex'>
          <Switch>
            <Route path='/doc/:docId/settings' exact>
              <Settings doc={doc} />
            </Route>
            <Route path='/doc/:docId/page/:pageSlug' component={Editor} exact>
            </Route>
            <Route path='/doc/:docId' exact>
              <Redirect to={`/doc/${doc.id}/settings`} />
            </Route>
          </Switch>
        </div>

      </div>
      {/* 
      <Switch>
        <Route path='/doc/:docId/settings' exact>
          <Settings doc={doc} />
        </Route>

      </Switch> */}
    </div>
  )
}

// function Pages(props: {
//   doc: GetDocByIdResult['doc_by_pk']
// }) {
//   const pages = props.doc.pages
//   const history = useHistory()
//   return (

//   )
// }

function Editor(props: RouteComponentProps<{ docId: string, pageSlug: string }>) {

  const { docId, pageSlug } = props.match.params

  const history = useHistory()

  const [getPageByIdResult] = useQuery<GetPageByDocIdAndSlugResult, GetPageByDocIdAndSlugParams>({ query: GetPageByDocIdAndSlug, variables: { pageSlug, docId } })
  const [editPageResult, editPage] = useMutation<EditPageResult, EditPageParams>(EditPage)
  const [deletePageResult, deletePage] = useMutation<DeletePageResult, DeletePageParams>(DeletePage)


  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: getPageByIdResult.data?.page[0].title,
      content: getPageByIdResult.data?.page[0].content
    },
    async onSubmit(values) {
      // TODO: verify
      try {
        await editPage({
          docId, pageSlug, input: {
            title: values.title!,
            content: values.content!
          }
        })
        biu('Save', { type: 'success' })
        location.reload()
      } catch (e) {
        biu('Error', { type: 'danger' })
      }
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

  async function onClickDelete() {
    if (window.confirm('Are you sure delete this page?')) {
      const res = await deletePage({
        pageId: page.id
      })
      history.push(`/doc/${docId}`)
    }
  }

  return (
    <>
      <div className='p-4 flex flex-col w-full'>
        <input name='title' onChange={form.handleChange} className='outline-none w-full text-2xl font-bold' type="text" placeholder='Title' value={form.values.title} />

        <CM value={form.values.content} />
      </div>

      <div className='w-16 border-l-2 border-gray-100'>
        <a onClick={form.submitForm} className='block bg-blueGray-500 w-10 h-10 mx-auto rounded cursor-pointer hover:bg-blueGray-700 animate mt-2 flex justify-center text-gray-100'>
          <SaveIcon />
        </a>

        <a onClick={_ => onClickDelete()} className='block bg-red-700 w-10 h-10 mx-auto rounded cursor-pointer hover:bg-red-900 animate mt-2 flex justify-center text-gray-100'>
          <TrashIcon />
        </a>
      </div>
    </>
  )
}

declare var CodeMirror
function CM(props: {
  value
}) {

  const $el = React.useRef<HTMLDivElement>(null)
  const cm = React.useRef<any>(null)

  React.useEffect(() => {
    if (cm.current) {
      cm.current.setValue(props.value || '')
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

const description = {
  docute: <span><a className='underline' href="https://docute.org" target="_blank">Docute</a> is a Vue-based document generator. It allows you to write Vue component in Markdown. </span>,
  docsify: <span><a className='underline' href="https://docsify.js.org" target="_blank">Docsify</a> is a lightweight document site generator. It has a lots of community plugins and themes.</span>
}

function Settings(props: {
  doc: GetDocByIdResult['doc_by_pk']
}) {

  const [udpateDocResult, updateDoc] = useMutation<UpdateDocResult, UpdateDocParams>(UpdateDoc)

  const form = useFormik({
    initialValues: {
      title: props.doc.title,
      highlights: props.doc.code_highlights.map(o => ({ label: o, value: o })),
      visibility: props.doc.visibility,
      template: props.doc.template,
      defaultPage: props.doc.default_page
    },
    async onSubmit(values) {
      try {
        await updateDoc({
          docId: props.doc.id,
          input: {
            visibility: values.visibility,
            code_highlights: values.highlights.map(o => o.value),
            title: values.title,
            template: values.template,
            default_page: values.defaultPage
          }
        })
        biu('Save', { type: 'success' })
      } catch (e) {
        biu('Error', { type: 'danger' })
      }
    }
  })

  return (
    <div className='px-8 py-4 w-full'>
      <form>
        <div className='flex flex-col'>
          <label htmlFor="title">Document Title</label>
          <input onChange={form.handleChange} name='title' value={form.values.title} type="text" />
        </div>

        <div className='flex flex-col mt-8'>
          <label htmlFor="title">Home Page</label>
          <select name="defaultPage" value={form.values.defaultPage} onChange={form.handleChange}>
            {props.doc.pages.map(page => {
              return (
                <option value={page.slug} key={page.id}>{page.title}</option>
              )
            })}
          </select>
        </div>

        <div className='flex flex-col mt-8'>
          <label htmlFor="highlights">Syntax Highlights</label>
          <Select onChange={setFieldValue(form, 'highlights')} isMulti value={form.values.highlights} options={highlights} />
        </div>

        <div className='flex flex-col mt-8'>
          <label htmlFor="visibility">Visibility</label>
          <select name='visibility' value={form.values.visibility} onChange={form.handleChange}>
            <option value="public">Public</option>
            <option value="private">Only team members</option>

          </select>
        </div>

        <div className='flex flex-col mt-8'>
          <label htmlFor="template">Template</label>
          <div className='flex -mx-2'>

            <div onClick={_ => form.setFieldValue('template', 'docute')} className={classnames('mx-2 inline-block border border-gray-200 hover:bg-blueGray-50 w-40 p-4 rounded-lg flex justify-center animate cursor-pointer', { 'bg-blueGray-50 border-none': form.values.template === 'docute' })}>
              <div className='text-center'>
                {/* <img className='w-12 h-12' src={require('../assets/docute.png')} alt="" /> */}
                <span style={{ zoom: 2 }}>📚</span>
                <h1 className='text-sm'>Docute</h1>
              </div>
            </div>
            <div onClick={_ => form.setFieldValue('template', 'docsify')} className={classnames('mx-2 inline-block border border-gray-200 hover:bg-blueGray-50 w-40 p-4 rounded-lg flex justify-center animate cursor-pointer', { 'bg-blueGray-50 border-none': form.values.template === 'docsify' })}>
              <div className=''>
                <img className='w-12 h-12 mx-auto block' src={require('../assets/docsify.svg')} alt="" />

                <div>
                  <h1 className='text-center text-sm'>Docsify</h1>
                </div>
              </div>
            </div>

          </div>

          <div className='text-xs text-gray-500 mt-4'>
            {description[form.values.template]}
          </div>

        </div>


        <div className='mt-8'>
          <button disabled={udpateDocResult.fetching} className='btn' onClick={form.submitForm}>Save</button>
        </div>
      </form>
    </div>
  )
}