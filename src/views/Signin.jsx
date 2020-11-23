import React from 'react'
import { Cookies } from 'react-cookie'
import { ReactComponent as SpotifyLogo } from '../assets/logos/spotify.svg'
import DeezerLogo from '../assets/logos/deezer_dark.png'
import { ReactComponent as LogoIcon } from '../assets/svg/logo.svg'
import { BASE_URL } from '../util'
import { withRouter } from 'react-router-dom'
const cookies = new Cookies()

function SignupRedirect(platform) {
  cookies.set("platform", platform, {
    expires: new Date(Date.now() + 86400e3),
    path: "/",
    // secure: true
  })
  window.location = `${BASE_URL}/${platform}/signup`
}


function Signup(props) {

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-between">
      <LogoIcon className="mt-3 cursor-pointer" onClick={e => props.history.push('/')} />
      <div className="flex flex-col items-center">
        <div className="bg-zoove_gray-200 px-20 rounded-xl flex flex-col pb-5">
          <h1 className="font-bold md:text-3xl text-white text-center my-5">Login with</h1>


          <button className="bg-black text-white font-bold border border-black my-3 px-16 md:px-20 rounded-xl" onClick={e => {
            SignupRedirect('spotify')
          }}>
            <div className="flex flex-row justify-center my-4">
              <SpotifyLogo />
            </div>
          </button>



          <button className="bg-black text-white font-bold border border-black my-3 rounded-xl" onClick={e => {
            SignupRedirect('deezer')
          }}>
            <div className="flex flex-row justify-center my-4">
              <img src={DeezerLogo} alt="" className="" />
            </div>
          </button>
        </div>
      </div>
      <span className="my-5 text-white">😚 zoove {new Date().getFullYear()}</span>
    </div >
  )
}

export default withRouter(Signup)