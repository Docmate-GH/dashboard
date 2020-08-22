import * as React from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import classnames from 'classnames'
import { DocumentAddIcon, PencilIcon, PlusIcon, PlusOnlyIcon, TrashIcon } from './Icon'

export function DirectoryDroppablePannel({
  children
}) {
  return (
    <Droppable droppableId='droppable-pannel' direction='vertical' type='directory'>
      {provided => {
        return (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {children}
            {provided.placeholder}
          </div>
        )
      }}
    </Droppable>
  )
}

export function DroppableDirectory({
  directoryId,
  directoryName,
  children,
  index,
  onClickPlus,
  onClickEdit,
  onClickRemove,
  isDragDisabled
}: {
  isDragDisabled?: boolean,
  directoryName: string
  directoryId: string,
  children?: any,
  index: number,
  onClickPlus: () => void
  onClickEdit: () => void,
  onClickRemove: () => void,
}) {
  return (
    <Draggable isDragDisabled={isDragDisabled} draggableId={directoryId} index={index}>
      {(pannelProvided, pannelSnapshot) => {
        return <div className='px-2 bg-gray-50 py-2 mb-4 border-t-4 rounded border-blueGray-50' ref={pannelProvided.innerRef} {...pannelProvided.dragHandleProps} {...pannelProvided.draggableProps}>
          <h1 className='text-blueGray-500 mb-2 tracking-wide text-sm font-bold ml-2 flex justify-between'>
            <div className='flex hover:text-blueGray-700 cursor-pointer' onClick={onClickEdit}>
              <PencilIcon className='w-5 h-5' />
              <span className='ml-1 self-center'>
                {directoryName}
              </span>
            </div>

            <div className='flex'>
              {children.length === 0 && <div onClick={onClickRemove} className='cursor-pointer text-red-900 hover:text-red-200 animate self-center'>
                <TrashIcon />
              </div>}

              <div onClick={onClickPlus} className='cursor-pointer text-blueGray-400 hover:text-blueGray-700 animate self-center'>
                <DocumentAddIcon className='self-center' />
              </div>

            </div>
          </h1>
          <Droppable droppableId={directoryId} type='page'>
            {(provided, snapshot) => {
              return (
                <div ref={provided.innerRef} className={classnames('w-full rounded', { 'bg-green-50': snapshot.isDraggingOver })} style={{ minHeight: '8rem' }} {...provided.droppableProps}>
                  {children}
                  {provided.placeholder}
                </div>
              )
            }}
          </Droppable>
        </div>
      }}
    </Draggable>
  )
}

export function DraggablePage({
  pageId,
  index,
  title,
  draggable
}: {
  index: number,
  pageId: string,
  draggable?: boolean,
  title: string | React.ReactElement
}) {
  return (
    <Draggable isDragDisabled={draggable} draggableId={pageId} index={index}>
      {(provided, snapshot) => {
        return (
          <div className='bg-white block mb-2 p-2 text-sm ruonded' ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps} >
            {title}
          </div>
        )
      }}
    </Draggable>
  )
}