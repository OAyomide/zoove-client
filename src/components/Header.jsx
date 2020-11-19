import React from 'react'
import { Cookies } from 'react-cookie'
import { withRouter } from 'react-router-dom'
import { ReactComponent as LogoIcon } from '../assets/svg/logo.svg'
import { ReactComponent as PersonIcon } from '../assets/svg/person.svg'

const cookie = new Cookies()

function Header(props) {
  const token = cookie.get("token")

  const logout = () => {
    cookie.remove("token")
    cookie.remove("platform")
    props.history.push("/auth")
    return
  }


  return (
    <div className="flex flex-row md:mt-10  mx-2">
      <div className="w-1/2 justify-start md:justify-end flex flex-row">
        <LogoIcon />
      </div>

      <div className="w-1/2 justify-end block sm:hidden lg:flex md:flex">
        <button className="mx-16 rounded-lg px-3 bg-zoove_gray-200 ">
          <div className="flex flex-row">
            <PersonIcon className="mr-2 w-4 h-4" />
            <span className="text-sm text-zoove_gray-100" onClick={e => props?.history.push("/auth")}>Login with</span>
          </div></button>
      </div>

      <div className="w-1/2 justify-end  block lg:hidden md:hidden sm:flex ">
        <button>
          <PersonIcon className="mr-2 w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default withRouter(Header)