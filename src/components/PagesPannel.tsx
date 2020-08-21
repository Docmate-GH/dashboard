import * as React from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import classnames from 'classnames'

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
  isDragDisabled
}: {
  isDragDisabled?: boolean,
  directoryName: string
  directoryId: string,
  children?: any,
  index: number
}) {
  return (
    <Draggable isDragDisabled={isDragDisabled} draggableId={directoryId} index={index}>
      {(pannelProvided, pannelSnapshot) => {
        return <div className='px-2 bg-gray-50 py-2 mb-4' ref={pannelProvided.innerRef} {...pannelProvided.dragHandleProps} {...pannelProvided.draggableProps}>
          <h1 className='text-blueGray-500 mb-2 tracking-wide text-sm ml-2'>{directoryName}</h1>
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
          <div className='bg-white block mb-2 p-2 text-sm' ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps} >
            {title}
          </div>
        )
      }}
    </Draggable>
  )
}