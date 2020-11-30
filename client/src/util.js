export const BASE_URL_SOCKET = `zoove-server.herokuapp.com`
export const BASE_URL = `https://zoove-server.herokuapp.com`
// export const JWT_SECRET = "ijeiuiengeivm29429r3im=egvv4v3tr"

export const isEmpty = (array) => {
    return Array.isArray(array) && (array.length === 0 || array.every(isEmpty))
  }


export function ConvertToMusicDuration(duration) {
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
    return `${hour ? Math.floor(hour) : ''}${Math.floor(minute)}:${pad(seconds,2)}`
  }
export function pad(num, size) {
  let s = Math.floor(num) + '';
  while (s.length < size) {
    s = '0' + s;
  }
  return s;
}