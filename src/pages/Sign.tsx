import * as React from 'react'

export default () => {
  return (
    <div className='h-full flex bg-gray-50 flex-col justify-center' >
      <div className='bg-white mx-auto rounded-lg shadow-xl p-8' style={{ width: '24rem' }}>
        <h1 className='mb-8 font-bold text-center text-lg'>
          Welcome to Docmate
        </h1>
        <SSO />
      </div>
    </div>
  )
}

function SSO() {
  return (
    <div className='flex justify-center'>
      <button className='border-2 border-gray-900 rounded-full px-4 py-2 flex hover:bg-gray-100 animate'>
        <img className='w-8 h-8' src={require('../assets/github.png')} alt="" />
        <a href={`/login/github`} className='self-center ml-4'>
          Continue with Github
        </a>
      </button>
    </div>
  )
}