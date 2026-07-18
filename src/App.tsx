import React from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from './assets/vite.svg'
//import heroImg from './assets/hero.png'
import './App.css'
import Header from './components/Header';
import Main from './components/Main';

function App(): React.JSX.Element {
  //const [count, setCount] = useState(0)

  return (
    <>
      <Header />
      <Main />
      <footer>Footer</footer>
    </>
  )
}

export default App
