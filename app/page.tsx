import React from 'react'
import { SignIn } from './components/sign_in'

const Home = () => {
  return (
    <div>
      <div className="flex items-center justify-center h-screen">
        <SignIn />
      </div>
    </div>
  )
}

export default Home