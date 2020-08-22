import { useFormik } from 'formik'
import * as React from 'react'
import { Route, RouteComponentProps, Switch, useHistory, Link, RouteProps, Redirect, Prompt } from 'react-router-dom'
import { useMutation, useQuery } from 'urql'
import { Lock, PlusIcon, SaveIcon, SettingsIcon, TrashIcon } from '../components/Icon'
import { batchResortDirectoriesMutation, batchResortPagesMutation, CreateDirectory, CreateDirectoryParams, CreateDirectoryResult, CreatePage, CreatePageParams, CreatePageResult, DeletePage, DeletePageParams, DeletePageResult, EditDirectory, EditDirectoryParams, EditPage, EditPageParams, EditPageResult, GetDocById, GetDocByIdParams, GetDocByIdResult, GetPageByDocIdAndSlug, GetPageByDocIdAndSlugParams, GetPageByDocIdAndSlugResult, UpdateDoc, UpdateDocParams, UpdateDocResult, UpdatePageById, UpdatePageByIdParams, UpdatePageByIdResult } from '../gql'
import classnames from 'classnames'
import { highlights, SaveStatus, setFieldValue, useImportScript } from '../utils'
import biu from 'biu.js'
import Select from 'react-select'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { client, httpClient } from '../client'
import { nanoid } from 'nanoid'
import { DraggablePage, DroppableDirectory, DirectoryDroppablePannel } from '../components/PagesPannel'
declare var process

export default (props: RouteComponentProps<{ docId: string }>) => {

  const docId = props.match.params.docId

  const [getDocByIdResult, getDocById] = useQuery<GetDocByIdResult, GetDocByIdParams>({ query: GetDocById, variables: { docId } })

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

  const openDocUrl = process.env.DOC_DOMAIN ? `${process.env.DOC_DOMAIN}/${doc.id}` : `${location.protocol}/${location.host}/docs/${doc.id}`

  return (

    <>
      <div className='border-gray-100 flex-1 h-full flex flex-col'>
        <div className='bg-white px-4 py-4 flex justify-between border-b border-gray-100'>
          <div>
            <div>
              <span className='cursor-pointer'><Link to={`/team/${doc.team.id}`}>{doc.team.title}</Link></span> / <span className='font-bold'><Link to={`/doc/${docId}`}>{doc.title}</Link></span>
            </div>

            <div className='text-xs mt-1 text-gray-500'>
              <a href={openDocUrl} target="_blank">{openDocUrl}</a>
            </div>

          </div>

          <div className='self-center'>
            <button onClick={_ => history.push(`/doc/${doc.id}/settings`)} className='flex rounded-full text-sm tracking-wide py-1 px-4 text-blueGray-500 border-2 border-blueGray-500 font-bold hover:bg-blueGray-500 hover:text-white animate'>
              {/* <SettingsIcon/> */}
              Settings
            </button>
          </div>

        </div>

        <div className='flex flex-1'>

          <div className='flex-1 h-full flex bg-white'>
            <Switch>
              <Route path='/doc/:docId/settings' exact>
                <Settings doc={doc} />
              </Route>
              <Route path='/doc/:docId'>
                <Doc doc={doc} refresh={getDocById} />
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
    </>
  )
}

function Doc({
  doc,
  refresh
}: {
  refresh: () => void
  doc: GetDocByIdResult['doc_by_pk']
}) {
  const [createDirectoryResult, createDirecotry] = useMutation<CreateDirectoryResult, CreateDirectoryParams>(CreateDirectory)

  const [reOrderedCache, setReorderedCache] = React.useState<null | {
    directories: GetDocByIdResult['doc_by_pk']['directories'],
    pages: GetDocByIdResult['doc_by_pk']['pages']
  }>(null)

  const history = useHistory()

  doc.directories = reOrderedCache ? reOrderedCache.directories : doc.directories
  doc.pages = reOrderedCache ? reOrderedCache.pages : doc.pages

  async function newDragend(result: DropResult) {

    if (!result.destination) {
      return
    }

    if (
      result.destination.droppableId === result.source.droppableId &&
      result.destination.index === result.source.index
    ) {
      return
    }

    if (result.type === 'page') {
      const targetDirectoryId = result.destination.droppableId
      const pageId = result.draggableId
      const originDirectoryId = result.source.droppableId
      const originIndex = result.source.index
      const targetIndex = result.destination.index

      const pagesCopy = [...doc.pages]
      const directoriesCopy = [...doc.directories]

      const targetDirectory = directoriesCopy.find(item => item.id === targetDirectoryId)!
      const originDirectory = directoriesCopy.find(item => item.id === originDirectoryId)!

      let originPage: GetDocByIdResult['doc_by_pk']['directories'][0]['pages'][0]

      if (targetDirectoryId === originDirectoryId) {
        // only exchange index
        originPage = targetDirectory.pages.find(item => item.id === pageId)!
        targetDirectory.pages.splice(originIndex, 1)
        targetDirectory.pages.splice(targetIndex, 0, originPage)

        setReorderedCache({
          directories: directoriesCopy,
          pages: pagesCopy
        })

        const resortResult = await client.mutation(batchResortPagesMutation(targetDirectory.pages.map(page => page.id))).toPromise()

        if (!resortResult.error) {
          biu('Saved')
          setReorderedCache(null)
        }
      } else {
        // remove from origin
        if (originDirectoryId === '__DOCMATE__') {
          // move from unorganized directories
          pagesCopy.splice(originIndex, 1)
          originPage = doc.pages.find(item => item.id === pageId)!
        } else {
          originPage = originDirectory.pages.splice(originIndex, 1)[0]
        }

        // append to target
        targetDirectory.pages.splice(targetIndex, 0, originPage)


        setReorderedCache({
          directories: directoriesCopy,
          pages: pagesCopy
        })

        // change parent directory id
        const updateResult = await client.mutation<UpdatePageByIdResult, UpdatePageByIdParams>(UpdatePageById, {
          pageId,
          input: {
            directory_id: targetDirectory.id
          }
        }).toPromise()

        // resort target and resort pages' index
        const resortOriginResult = await client.mutation(batchResortPagesMutation(originDirectory.pages.map(page => page.id))).toPromise()
        const resortTargetResult = await client.mutation(batchResortPagesMutation(targetDirectory.pages.map(page => page.id))).toPromise()

        if (!resortOriginResult.error && !resortTargetResult.error && !updateResult.error) {
          biu('Pages order saved')

          setReorderedCache(null)
        }
      }

    } else if (result.type === 'directory') {
      const directoriesCopy = [...doc.directories]
      const originIndex = result.source.index
      const targetIndex = result.destination.index

      const moved = directoriesCopy.splice(originIndex, 1)[0]
      directoriesCopy.splice(targetIndex, 0, moved)

      setReorderedCache({
        directories: directoriesCopy,
        pages: doc.pages
      })

      console.log(batchResortDirectoriesMutation(directoriesCopy.map(directory => directory.id)))
      const resortResult = await client.mutation(batchResortDirectoriesMutation(directoriesCopy.map(directory => directory.id))).toPromise()

      if (!resortResult.error) {
        biu('Directories order saved')
        setReorderedCache(null)
      }

    }
  }

  async function onEditDirectory(directoryId: string, input: EditDirectoryParams['input']) {
    const result = await client.mutation<{}, EditDirectoryParams>(EditDirectory, {
      directoryId,
      input
    }).toPromise()

    if (!result.error) {
      biu('Update success')
    }
  }


  async function onCrateNewDirectory() {
    const title = window.prompt('Directory title')
    if (title) {
      try {
        const res = await client.mutation<CreateDirectoryResult, CreateDirectoryParams>(CreateDirectory, {
          title,
          docId: doc.id
        }).toPromise()

        if (!res.error) {
          refresh()
        }
      } catch (e) {
        console.log(e)
      }
    }
  }

  async function onClickRemoveDirectory(directoryId: string) {
    if (window.confirm('Are you sure to delete this directory?')) {
      const result = await client.mutation<{}, EditDirectoryParams>(EditDirectory, {
        directoryId,
        input: {
          deleted_at: new Date()
        }
      }).toPromise()
      if (!result.error) {
        biu('Delete success')
      }
    }
  }

  async function onCreateNewPage(directoryId: string) {
    const result = await client.mutation<CreatePageResult, CreatePageParams>(CreatePage, {
      object: {
        doc_id: doc.id,
        content: '',
        slug: nanoid(8),
        directory_id: directoryId
      }
    }).toPromise()

    history.push(`/doc/${doc.id}/page/${result.data!.insert_page_one.slug}`)
    refresh()
  }

  return (
    <>
      <div className='w-64 border-gray-50 pl-2 pr-2 bg-white'>
        <div className='mb-4 mt-4'>
          <button onClick={onCrateNewDirectory} className='flex justify-center py-2 hover:bg-blueGray-700 animate rounded text-sm bg-blueGray-500 text-white font-bold w-full'><PlusIcon />
            <span className='ml-1'>Add Directory</span>
          </button>
        </div>

        <div style={{ overflow: 'scroll' }}>
          <DragDropContext onDragEnd={newDragend}>
            <DirectoryDroppablePannel>

              {doc.pages.length > 0 && <div className='px-2 bg-gray-50 py-2 mb-4'>
                <h1 className='text-blueGray-500 mb-2 tracking-wide text-sm ml-2'>Unorganized Pages</h1>
                <Droppable isDropDisabled={true} droppableId='__DOCMATE__' type='page'>
                  {(provided, snapshot) => {
                    return (
                      <div ref={provided.innerRef} className={classnames('w-full rounded', { 'bg-red-50': snapshot.isDraggingOver })} style={{ minHeight: '8rem' }} {...provided.droppableProps}>
                        {doc.pages.map((page, pageIndex) => {
                          return <DraggablePage key={page.id} index={pageIndex} pageId={page.id} title={<Link className='hover:text-blueGray-500' to={`/doc/${doc.id}/page/${page.slug}`} >{page.title}</Link>} />
                        })}
                        {provided.placeholder}
                      </div>
                    )
                  }}
                </Droppable>
              </div>}

              {doc.directories.map((directory, index) => {
                return (
                  <DroppableDirectory onClickEdit={() => {
                    const newTitle = window.prompt('Rename the directory title to', directory.title)
                    if (newTitle) {
                      onEditDirectory(directory.id, {
                        title: newTitle
                      })
                    }
                  }} onClickPlus={() => {
                    onCreateNewPage(directory.id)
                  }} onClickRemove={() => {
                    onClickRemoveDirectory(directory.id)
                  }} key={directory.id} index={index} directoryName={directory.title} directoryId={directory.id}>
                    {directory.pages.map((page, pageIndex) => {
                      return <DraggablePage key={page.id} index={pageIndex} pageId={page.id} title={<Link className='hover:text-blueGray-500' to={`/doc/${doc.id}/page/${page.slug}`} >{page.title}</Link>} />
                    })}
                  </DroppableDirectory>
                )
              })}
            </DirectoryDroppablePannel>
          </DragDropContext>
        </div>
      </div>

      <div className='flex-1 flex'>
        <Route path='/doc/:docId/page/:pageSlug' render={props => <Editor {...props} refresh={refresh} />} exact>
        </Route>
      </div>
    </>

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

function Editor(props: RouteComponentProps<{ docId: string, pageSlug: string }> & { refresh: () => void }) {

  const { docId, pageSlug } = props.match.params

  const [saveStatus, setSaveStatus] = React.useState(SaveStatus.SAVED)

  const history = useHistory()

  const [getPageByIdResult, getPageById] = useQuery<GetPageByDocIdAndSlugResult, GetPageByDocIdAndSlugParams>({ query: GetPageByDocIdAndSlug, variables: { pageSlug, docId } })
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

  React.useEffect(() => {
    setSaveStatus(SaveStatus.SAVED)
    // todo close tab guard
  }, [pageSlug])

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
      <Prompt when={saveStatus === SaveStatus.UNSAVE} message={(location, action) => {
        console.log(action)
        return 'Are you sure you want to leave without saving?'
      }} />

      <div className='p-4 flex flex-col w-full'>
        <input name='title' onChange={form.handleChange} className='outline-none w-full text-2xl font-bold' type="text" placeholder='Title' value={form.values.title} />

        <CM id={page.id} onChange={(value, changeObj) => {
          form.setFieldValue('content', value)
          if (changeObj.origin !== 'setValue') {
            setSaveStatus(SaveStatus.UNSAVE)
          }
        }} value={page.content} />



        <div className='w-16  border-gray-100 mt-2 flex'>
          <a onClick={form.submitForm} className='px-4 py-1 block bg-blueGray-500 rounded-full mr-2 text-sm font-bold tracking-wide cursor-pointer hover:bg-blueGray-900 animate mt-2 flex justify-center text-white'>
            Save
          </a>

          <a onClick={_ => onClickDelete()} className='px-4 py-1 block rounded-full mr-2 text-sm font-bold tracking-wide block bg-red-500 rounded cursor-pointer hover:bg-red-900 animate mt-2 flex justify-center text-gray-100'>
            Delete
          </a>
        </div>
      </div>
    </>
  )
}

let imageIndex = 0
declare var CodeMirror
const CM = React.forwardRef((props: {
  id: string,
  value,
  onChange: (value: string, changeObject) => void
}, ref) => {

  const $el = React.useRef<HTMLDivElement>(null)
  const cm = React.useRef<any>(null)

  React.useEffect(() => {
    if (cm.current) {
      cm.current.setValue(props.value);
      cm.current.clearHistory();
    }
  }, [props.id])

  React.useLayoutEffect(() => {
    cm.current = new CodeMirror($el.current, {
      mode: 'markdown',
      lineWrapping: true,
      value: props.value || '',
    })
    cm.current.on('change', (c, change) => {
      props.onChange(c.getValue(), change)
    })

    cm.current.on('paste', async (cm, e) => {
      const file = e.clipboardData.files[0]
      if (file && file.type.match('image/')) {
        e.preventDefault()
        // upload image

        const formData = new FormData()
        formData.append('image', file)

        const appendText = (content: string) => {
          cm.doc.replaceRange(content, cm.doc.sel.ranges[0].anchor)
        }

        const placeHolder = `{{ uploading... #${imageIndex++} }}`

        try {
          appendText(placeHolder)

          const res = await httpClient.post('/api/v1/upload', formData)
          const content = cm.getValue()
          cm.setValue(content.replace(placeHolder, res.data.markdown))
        } catch (e) {
          if (e.response.data.code === 'NOT_PRO_MEMBER') {
            // TODO: not pro member

          }
          const content = cm.getValue()
          cm.setValue(content.replace(placeHolder, ''))
        }
      }
    })
  }, [])

  return (
    <div className='cursor-text outline-none mt-4 border border-gray-100' ref={$el}></div>
  )
})

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
    <div className='px-4 py-4 w-full'>
      <h1 className='font-bold mb-4'>Settings</h1>
      <form>
        <div className='flex flex-col w-64'>
          <label htmlFor="title">Document Title</label>
          <input onChange={form.handleChange} name='title' value={form.values.title} type="text" />
        </div>

        <div className='flex flex-col mt-8 w-64'>
          <label htmlFor="title">Home Page</label>
          <select name="defaultPage" value={form.values.defaultPage} onChange={form.handleChange}>
            {props.doc.directories.map(directory => {
              return (
                <optgroup key={directory.id} label={directory.title}>
                  {directory.pages.map(page => {
                    return (
                      <option value={page.slug} key={page.id}>{page.title}</option>
                    )
                  })}
                </optgroup>
              )
            })}
          </select>
        </div>

        <div className='flex flex-col mt-8'>
          <label htmlFor="highlights">Syntax Highlights</label>
          <Select onChange={setFieldValue(form, 'highlights')} isMulti value={form.values.highlights} options={highlights} />
        </div>

        <div className='flex flex-col mt-8 w-64'>
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