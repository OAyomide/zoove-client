import React from 'react';
import ReactDOM from 'react-dom';
import './assets/main.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import ReactGA from 'react-ga'
// import '../src/assets/fonts/Circular Bold/Circular Bold.ttf'
// import '../src/assets/fonts/Circular Book/Circular Book.ttf'
// import '../src/assets/fonts/Circular Medium/Circular Medium.ttf'


const trackingID = 'UA-178149278-1'
ReactGA.initialize(trackingID)

const history = createBrowserHistory()

history.listen(lx => {
  ReactGA.set({ page: lx.location.pathname })
  ReactGA.pageview(lx.location.pathname)
})
ReactDOM.render(
  <BrowserRouter history>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </BrowserRouter>,
  document.getElementById('root')
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
