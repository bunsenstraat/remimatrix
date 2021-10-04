import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


//STEP 1:
//create components using React.lazy
const LightTheme = React.lazy(() => import('./themes/theme'));

type Props = {
  children?: React.ReactNode;
};
//STEP 2:
//create a parent component that will load the components conditionally using React.Suspense
const ThemeSelector = ({ children }: Props) => {
  const USE_THEME = function() {
    const q = new URLSearchParams(window.location.search)
    if (q.get('loginToken') && q.get('loginToken') !== '') {
      return true
    }
    return false
  }
  return (
    <>
      <React.Suspense fallback={<></>}>
        {USE_THEME() ? <LightTheme />:<></>}
      </React.Suspense>
      {children}
    </>
  )
}


ReactDOM.render(
  <React.StrictMode>
     <ThemeSelector>
    <App />
    </ThemeSelector>
  </React.StrictMode>,
  document.getElementById('root')
);

console.log("test")
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
