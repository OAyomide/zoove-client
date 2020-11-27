import React, { useState, useEffect, useRef } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import Header from '../components/Header'
import { ReactComponent as TaglineIcon } from '../assets/svg/tagline.svg'
import { ReactComponent as ArrowdownIcon } from '../assets/svg/arrow_down.svg'
import SpotifyLogo from '../assets/logos/spotify.svg'
import { ReactComponent as ViewIcon } from '../assets/svg/view.svg'
import { ReactComponent as CopyIcon } from '../assets/svg/copy.svg'
import { ReactComponent as PlayIcon } from '../assets/svg/play.svg'
import { ReactComponent as OpenLinkIcon } from '../assets/svg/open_link.svg'
// import { ReactComponent as OptionsIcon } from '../assets/svg/options.svg'
import DeezerLogo from '../assets/logos/deezer_dark.svg'
import { withRouter } from 'react-router-dom'
import qs from 'query-string'
import { verify } from 'jsonwebtoken'
import { w3cwebsocket } from 'websocket'
import Preview from '@microlink/mql'
import { toast, ToastContainer } from 'react-toastify'
import { BASE_URL_SOCKET, JWT_SECRET } from '../util'
import { Cookies } from 'react-cookie'
import Loader from 'react-loader-spinner'
import 'react-toastify/dist/ReactToastify.css'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import ReactAudio from 'react-audio-player'
// import DeezerImg from '../assets/logos/deezer_dark.png'
// import SpotifyImg from '../assets/logos/spotify.png'


function pad(num, size) {
  let s = Math.floor(num) + '';
  while (s.length < size) {
    s = '0' + s;
  }
  return s;
}



let socket = new w3cwebsocket(`wss://${BASE_URL_SOCKET}/api/v1.1/ws/connect`)
const cookie = new Cookies()
const platform = cookie.get("platform")
const token = cookie.get("token")

function ConvertToMusicDuration(duration) {
  let hour = 0
  let minute = 0
  let seconds = 0

  let toSecs = duration / 1000
  minute = toSecs / 60
  seconds = toSecs % 60
  if (minute >= 60) {
    hour = minute / 60
    minute += minute / 60
  }


  return `${Math.floor(minute)}:${pad(seconds)}`
}


function Home() {



  const [loading, setLoading] = useState(false)
  const [tracks, setTracks] = useState([[]])
  const [srcTrack, setSrcTrack] = useState('')
  const [clicked, setClicked] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [play, setPlay] = useState(false)
  const [active, setActive] = useState(null)
  const [src, setSrc] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isPlaylist, setIsPlaylist] = useState(false)
  const [playlistTitle, setPlaylistTitle] = useState('')
  const [showExportComponent, setShowExportComponent] = useState(false)
  const [addedToPlaylist, setAddedToPlaylist] = useState(false)
  const [exportButtonDisabled, setExportButtonDisabled] = useState(false)
  const [exportedPlaylist, setExportedPlaylist] = useState("")
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false)
  const [playlistMeta, setPlaylistMeta] = useState({})
  const [platformsPlaylist, setPlatformsPlaylist] = useState([])
  const [activePlaylist, setActivePlaylist] = useState('')
  const [platformsTracks, setPlatformsTracks] = useState({})

  let audioRef = useRef()

  const pauseAndPlay = key => {
    if (play && active === key) {
      audioRef.audioEl.current.pause()
      setPlay(!play)
      setActive(key)
      return
    }
    audioRef.audioEl.current.play()
    return
  }

  const isEmpty = (array) => {
    return Array.isArray(array) && (array.length === 0 || array.every(isEmpty))
  }


  useEffect(() => {
    const init = () => {
      try {
        // this block is parsing the redirected url from when a user connects their platform
        // i am encoding in base64 because i dont want to expose things just like that
        // any savvy engineer or person can still decode it.. maybe encode in something better later
        const parsed = qs.parse(window.location.search)
        if (parsed?.kyn) {
          let decode = atob(parsed?.kyn)
          let val = verify(decode, JWT_SECRET)
          if (val) {
            cookie.set('token', decode, {
              path: '/',
              expires: new Date(Date.now() + 86400e3)
            })
            window.location = "/"
          }
        }

        if (token) {
          verify(token, JWT_SECRET)
        }

        socket.onopen = () => {
          console.log(`icefish jj`)
          setSubmitButtonDisabled(false)
          setInterval(() => {
            socket.send(`{"action_type":"ping"}`)
          }, 10000);
        }

        socket.onclose = e => {
          if (e.code === 1006) {
            clearInterval()
            toast(`An error occured while performing socket connection. Please refresh this page.`)
          }
          socket.close(1000, 'Socket connection closed')
        }

        socket.onerror = e => {
          clearInterval()
          socket.close(1000, 'Socket error, closing socket')
        }

        socket.onmessage = event => {
          try {
            const parsed = JSON.parse(event.data)
            // console.log(`Incoming data from server is: `, parsed)
            // console.log(parsed?.payload)
            if (parsed?.playlist_title) {
              const filtered = parsed?.payload?.filter(x => x.filter(v => v?.title).length > 0)
              // console.log(`Filtered result is: `, filtered)
              setTracks(filtered)
              setPlatformsPlaylist(filtered)
              setLoading(false)
              setPlaylistTitle(parsed?.playlist_title)
              setShowExportComponent(true)
              setExportedPlaylist(`Zoove playlist: ${parsed?.playlist_title}`)
              // setPlaylistOwnerMeta(parsed?.owner)
              setPlaylistMeta(parsed?.playlist_meta)
              setIsPlaylist(true)
              setPlatformsTracks(parsed?.platforms)
              return
            }

            if (parsed?.action) {
              if (parsed?.payload) {
                toast('Added to your playlist')
                setAddedToPlaylist(true)
                setLoading(false)
                return
              }
              setLoading(false)
              toast(`Sorry, could not add to platlist. Please try again.`)
              return
            }

            if (parsed?.playlist_title === "" || parsed?.desc) {
              setLoading(false)
              return
            }

            const filtered = parsed?.filter(x => x?.filter(y => y.title).length > 0)
            setTracks(filtered)
            setLoading(false)
            return
          } catch (error) {
            console.log(`Error in componentDidMount`)
            console.log(error)
            setLoading(false)
            setIsError(true)
            setErrorMessage(`An error occured and it's not you, its Zoove. Please try again`)
            setSubmitButtonDisabled(true)
            return
          }
        }
      } catch (error) {
        console.log(`Error with init: `, error)
      }
    }
    init()
  }, [])

  // audioRef.audioEl.current.src = previewURL
  const handlePreviewClick = (previewURL, actv) => {
    // if there is no preview, do nothing of course
    if (!previewURL) {
      return
    }

    audioRef.audioEl.current.src = previewURL
    setPlay(!play)
    setActive(actv)
    pauseAndPlay(actv)
  }
  const CreatePlaylist = async () => {
    try {
      const decode = verify(token, JWT_SECRET)
      // console.log(`Here is the decoded: ${decode}`)
      // this.setState({ loading: true, exportButtonDisable: true })
      setLoading(true)
      setExportButtonDisabled(true)
      if (isEmpty(tracks)) {
        setLoading(false)
        return
      }

      if (!token) {
        toast("Please connect your streaming platform to export this playlist to your profile.")
        setLoading(false)
        return
      }

      const sk = []
      for (let single of tracks) {
        const singlePlatform = single[0]?.platform
        const allTracks = single.map(x => x?.id)
        sk.push({ platform: singlePlatform, tracks: allTracks })
      }

      const payload = sk[0]?.platform === platform ? sk[0] : sk[1]
      if (decode) {
        if (decode?.PlatformID) {
          let socketData = {
            action_type: "create_playlist",
            userid: decode?.PlatformID,
            payload: { ...payload, title: exportedPlaylist }
          }
          // console.log(`Sent to the backend is: ${JSON.stringify(socketData, null, 2)}`)
          socket.send(JSON.stringify(socketData))
        }
      }
    } catch (error) {
      console.log(`Error creating playlist`)
      setLoading(false)
      return
    }
  }

  const FetchData = async () => {
    try {
      setLoading(true)
      setShowExportComponent(false)
      setAddedToPlaylist(false)
      setIsPlaylist(false)
      setPlaylistMeta({})
      setPlatformsTracks({})
      setTracks([[]])
      let trackURL = srcTrack
      let socketData = {
        action_type: "track",
        url: trackURL
      }
      let isShortedURL = trackURL.indexOf("deezer.page.link") !== -1 ? true : false
      let isShortedSpotify = trackURL.indexOf("link.tospotify.com") !== -1 ? true : false
      if (isShortedURL) {
        try {
          const linkPreview = await Preview(trackURL)
    
          if (linkPreview?.data?.url?.includes('playlist')) {
            socketData.action_type = "playlist"
          }
          socketData.url = encodeURIComponent(linkPreview?.data?.url)
        } catch (error) {
          console.log(`Error getting preview`)
        }
      } else if (isShortedSpotify) {
        try {
          const linkPreview = await Preview(trackURL)
          socketData.url = encodeURIComponent(linkPreview?.data?.url)
          socketData.action_type = "playlist"
        } catch (error) {
          console.log(`Error getting spotfuiy preview url`)
        }
      }

      let isPlaylist = srcTrack.indexOf("playlist") !== -1 ? true : false
      if (isPlaylist) {
        socketData.action_type = "playlist"
        socketData.url = encodeURIComponent(trackURL)
        // setIsPlaylist(true)
      }

      if (socket.readyState === 3) {
        console.log(`icefish jj`)
        setLoading(false)
        setErrorMessage(`Socket Error. Please refresh this page :(`)
        setIsError(true)
        setSubmitButtonDisabled(true)
        return
      }

      console.log('Outgoing socket message is: ', socketData)
      socket.send(JSON.stringify(socketData))
    } catch (error) {
      console.log(`Error fetching here`)
      console.log(error)
    }
  }

  useEffect(() => {
    document.title = 'Zoove | Seamlessly share music across streaming services'
  }, [])

  const togglePlaylistDropdown = platform => {
    if (activePlaylist === platform) {
      setActivePlaylist('')
      return
    }
    setActivePlaylist(platform)
    return
  }


  return (
    <div className="text-center text-white flex flex-col justify-between h-screen">
      <div className="xl:mx-64">
        <Header />
        <ToastContainer />
        <div className="flex flex-col">
          <div className="flex flex-row justify-center mt-16 md:mt-24 mb-5">
            <TaglineIcon className="h-10 w-64" />
          </div>
          <span className="font-normal text-base md:mx-10">Find the link to a song on different streaming platforms with one URL.</span>
          <input type="search" name="" id="" placeholder="Paste track, album or playlist URL " className="mt-5 mb-3 px-12 rounded-lg py-4
       bg-zoove_gray-200 text-zoove_gray-300 border-2 border-zoove_gray-300 font-sans text-sm md:mx-12 mx-3" onChange={e => setSrcTrack(e.target.value)} />
          <span className="text-zoove_gray-400 md:font-medium  mx-3 text-xxs md:text-xs text-left md:mx-12">Please note that large playlists might mean longer loading time.</span>
          <button className="bg-zoove_blue-100  place-self-center px-12 py-3 my-5 rounded-lg text-sm" onClick={async e => await FetchData()}>Search</button>
        </div>
        {isEmpty(tracks) ? '' : <div className="text-left md:mx-12 mx-3 flex flex-row mb-5">
          <span className="text-sm mt-1">Your link on streaming platforms</span>
          <ArrowdownIcon className="mx-3" />
        </div>}
        {showExportComponent ? (addedToPlaylist ? <div className="flex flex-col mx-5 rounded-lg bg-gray-1100 mt-5 items-center ">
          <span className="text-center my-5 text-white text-sm">Playlist "{exportedPlaylist}" has been created for you. You can now view from your {platform.charAt(0).toUpperCase() + platform.slice(1)
          } profile.</span></div>
          :
          token ?
            <div className="flex flex-col mx-5 rounded-lg bg-gray-1100 mt-5 items-center ">

              <div className="flex mt-10 sm:mt-5 ml-2 flex-col pb-10 sm:pb-5 bg-gray-1100 rounded ">
                <span className="text-white my-3">Export this playlist to {platform ?? "whatever platform you use."}</span>
                <input type="text" name="playlist-name" id="" placeholder={exportedPlaylist}
                  onChange={e => setExportedPlaylist(e.target.value)}
                  className="text-white bg-transparent border-b-2 border-t-0 border-l-0 border-r-0 focus:border-t-0 focus:outline-none cursor-text my-2" />
                <button className="text-black bg-blue-400 py-1 px-4 border border-blue-400 mb-2 ml-2 mr-5 sm:mr-6 mt-2 rounded md:w-auto md:mr12 lg:w-auto xl:mr-20 xl:w-auto" onClick={async e => await CreatePlaylist()} >Add to playlist</button>
              </div>
            </div> :
            <div className="flex flex-col mx-5 rounded-lg bg-gray-1100 mt-5 items-center ">
              <span className="text-white">Cannot export to platform. Please connect your platform to add playlist.</span>
            </div>
        ) : null}
        {loading ? <div className="text-white text-center mt-10 flex flex-row justify-center">
          <Loader type="Rings" spinnerStyle={{ color: "#9f7aea" }} />
        </div> : (isEmpty(tracks) && !isPlaylist ? (isError ? <span>{errorMessage}</span> : <span>An empty void</span>) : '')}

        {isPlaylist ?
          Object.keys(platformsTracks).map((x, y) => {
            return (
              <div className="flex flex-col border-t-8  border-yellow-700 rounded-lg my-5 md:mx-12 mx-3 bg-zoove_gray-600 pb-5 justify-evenly" key={y}>

                <img src={x === 'spotify' ? SpotifyLogo : DeezerLogo} alt="" className="w-16 h-16 mx-3" />
                <div className="flex flex-row justify-between">
                  <div className="flex flex-row">
                    <img src={playlistMeta?.playlist_cover} alt="" className="w-16 h-16 mx-3 rounded-lg md:h-24 md:w-24" />
                    <div className="flex flex-col text-left mt-2 flex-no-wrap md:mt-6">
                      <span className="text-sm text-pink-1000 md:text-base">{playlistTitle}</span>
                      <span className="w-32 md:w-full whitespace-no-wrap block overflow-hidden text-xs" style={{ textOverflow: 'ellipsis' }}>Playlist by {playlistMeta?.owner?.name}</span>
                    </div>
                  </div>

                  <div className="flex flex-row mt-2">
                    <div className="flex flex-col bg-zoove_gray-500 items-center rounded-lg h-8 mx-1 w-10 md:h-16 md:w-24 cursor-pointer" onClick={e => togglePlaylistDropdown(x)} >
                      <ViewIcon className="my-3 w-4 h-4" />
                      <span className="text-xxs mx-2 lg:flex md:flex md:text-xs sm:hidden">View</span>
                    </div>
                    {playlistMeta?.playlist_url.includes(x) ? <div className="flex flex-col bg-zoove_gray-500 items-center rounded-lg h-8 mx-1 w-10 md:h-16 md:w-24 cursor-pointer">
                      <CopyToClipboard text={playlistMeta?.playlist_url} onCopy={() => toast('Copied to clipboard')}>
                        <CopyIcon className="my-3 w-4 h-4" />
                      </CopyToClipboard>
                      <span className="text-xxs mx-2 lg:flex md:flex md:text-xs sm:hidden">Copy link</span>
                    </div> : ''}
                    {playlistMeta?.playlist_url.includes(x) ? <div className="flex flex-col bg-zoove_gray-500 items-center rounded-lg h-8 mx-1 w-10 md:h-16 md:w-24 cursor-pointer" onClick={e => window.open(playlistMeta?.playlist_url)}>
                      <OpenLinkIcon className="my-3 w-4 h-3 md:w-6 md:h-4" />
                      <span className="text-xxs mx-2 lg:flex md:flex md:text-xs sm:hidden">Open link</span>
                    </div> : ''}

                    {/* {playlistMeta?.playlist_url.includes(x) ? <div className="flex flex-col bg-zoove_gray-500 items-center rounded-lg h-8 mx-1 w-10 md:h-16 md:w-24 cursor-pointer">
                      <PlayIcon className="my-3 w-4 h-3 md:w-6 md:h-4" />
                      <span className="text-xxs mx-2 lg:flex md:flex md:text-xs sm:hidden">Preview</span>
                    </div> : ''} */}
                  </div>


                </div>
                {activePlaylist === x ?
                  platformsTracks[x].map((u, k) => {
                    return (
                      <div className="flex-col flex" key={k + 384344}>
                        <div className="flex flex-row w-full md:hidden">
                          <img src={u?.cover} alt="" className="w-10 h-10 mx-3 rounded-lg md:h-12 md:w-12 ml-8 mt-2" />
                          <div className="flex flex-row justify-between w-full mt-2 overflow-hidden text-left">
                            <div style={{ width: '25%' }}>
                              <span className="mt-3  text-xs whitespace-no-wrap block overflow-hidden" style={{ textOverflow: 'ellipsis', width: '100%' }}>{u?.title}</span>
                            </div>
                            <span className="mt-3 text-xs whitespace-no-wrap block overflow-hidden font-light text-left" style={{ textOverflow: 'ellipsis', width: '25%' }}>{u.artistes?.join(", ")}</span>
                            <span className="mt-3 text-xs whitespace-no-wrap block overflow-hidden  text-right font-light" style={{ textOverflow: 'ellipsis', width: '25%' }}>{ConvertToMusicDuration(u?.duration)}</span>
                            <div className="mt-3 flex flex-col  items-center rounded-lg h-8 w-10 md:h-16 md:w-24" style={{ maxWidth: '25%' }}>
                              <ReactAudio ref={input => { audioRef = input }} />
                              <PlayIcon className="w-4 h-3 md:w-6 md:h-4" onClick={e => handlePreviewClick(u?.preview, k)} />
                            </div>
                          </div>
                        </div>



                        <div className="flex flex-row w-full sm:hidden lg:flex md:flex xl:flex mt-2">
                          <img src={u?.cover} alt="" className="w-10 h-10 mx-3 rounded-lg md:h-12 md:w-12 ml-8 mt-2" />
                          <div className="flex flex-row justify-between w-full mt-2 overflow-hidden text-left">
                            <div style={{ width: '30%' }}>
                              <span className="mt-3  text-xs whitespace-no-wrap block overflow-hidden" style={{ textOverflow: 'ellipsis', width: '100%' }}>{u?.title}</span>
                            </div>
                            <span className="mt-3 text-xs whitespace-no-wrap block overflow-hidden font-light text-left" style={{ textOverflow: 'ellipsis', width: '25%' }}>{u.artistes?.join(", ")}</span>
                            <span className="mt-3 text-xs whitespace-no-wrap block overflow-hidden font-light text-pink-1000 italic" style={{ textOverflow: 'ellipsis', width: '20%' }}>Unavailable</span>
                            <span className="mt-3 text-xs whitespace-no-wrap block overflow-hidden font-light italic" style={{ textOverflow: 'ellipsis', width: '5%' }}>Unavailable</span>
                            <span className="mt-3 text-xs whitespace-no-wrap block overflow-hidden  text-right font-light" style={{ textOverflow: 'ellipsis', width: '8%' }}>{ConvertToMusicDuration(u?.duration)}</span>
                            <div className="flex flex-col  items-center rounded-lg h-8 w-10 md:h-16 md:w-24" style={{ width: '8%' }} onClick={e => handlePreviewClick(u?.preview, k)}>
                              <ReactAudio ref={input => { audioRef = input }} />
                              <PlayIcon className="my-3 w-4 h-3 md:w-6 md:h-4" />
                            </div>
                          </div>
                        </div>


                      </div>
                    )
                  })

                  : ''
                }

              </div>
            )
          })
          : ''}




        {!isPlaylist ? tracks.map((x, y) => {
          return (
            <div key={y + 100}>
              {x.map((i, j) => {
                const previewURL = x[j]?.preview
                return (
                  <div className="flex flex-col border-t-8  border-yellow-700 rounded-lg my-5 md:mx-12 mx-3 bg-zoove_gray-600 pb-5 " key={j}>
                    <img src={x[j]?.platform === 'spotify' ? SpotifyLogo : DeezerLogo} alt="" className="w-16 h-16 mx-3" onClick={e => {
                      window.open(x[j]?.url)
                    }} />
                    <div className="flex flex-row justify-between">
                      <div className="flex flex-row">
                        <img src={x[j]?.cover} alt="" className="w-16 h-16 mx-3 rounded-lg md:h-24 md:w-24" />
                        <div className="flex flex-col text-left mt-2 md:mt-6 flex-no-wrap">
                          <span className="text-sm text-pink-1000 md:text-base">{x[j]?.title}</span>
                          <span className="w-32 md:w-full whitespace-no-wrap block overflow-hidden text-xs" style={{ textOverflow: 'ellipsis' }}>{x[j]?.artistes?.join(", ") ?? ""}</span>
                        </div>
                      </div>
                      <div className="flex flex-row mt-2">
                        <div className="flex flex-col bg-zoove_gray-500 items-center rounded-lg h-8 mx-1 w-10 md:h-16 md:w-24 cursor-pointer">
                          <CopyToClipboard text={x[j]?.url} onCopy={() => toast('Copied to clipboard')}>
                            <CopyIcon className="my-3 w-4 h-4" />
                          </CopyToClipboard>
                          <span className="text-xxs mx-2 lg:flex md:flex md:text-xs sm:hidden">Copy link</span>
                        </div>
                        <div className="flex flex-col bg-zoove_gray-500 items-center rounded-lg h-8 mx-1 w-10 md:h-16 md:w-24 cursor-pointer">
                          <OpenLinkIcon className="my-3 w-4 h-3 md:w-6 md:h-4" />
                          <span className="text-xxs mx-2 lg:flex md:flex md:text-xs sm:hidden" onClick={e => window.open(x[j]?.url)}>Open link</span>
                        </div>
                        <ReactAudio ref={input => { audioRef = input }} />
                        <div className="flex flex-col bg-zoove_gray-500 items-center rounded-lg h-8 mx-1 w-10 md:h-16 md:w-24 cursor-pointer">
                          <PlayIcon className="my-3 w-4 h-3 md:w-6 md:h-4" onClick={e => handlePreviewClick(previewURL, j)} />
                          <span className="text-xxs mx-2 lg:flex md:flex md:text-xs sm:hidden cursor-pointer">Preview</span>
                        </div>


                      </div>
                    </div>
                  </div>
                )
              })}

            </div>
          )
        }) : ''}

      </div>
      <span className="my-5">😚 zoove {new Date().getFullYear()}. <span className="text-yellow-1000 cursor-pointer" onClick={e => { }}><a href="mailto:onigbindeayomide@gmail.com?subject=Hi! I want to talk to you about zoove">Contact/Report issues</a></span></span>
    </div>
  )
}

export default withRouter(Home)