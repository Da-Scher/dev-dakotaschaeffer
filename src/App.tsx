import React from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from './assets/vite.svg'
//import heroImg from './assets/hero.png'
//import './App.css'
import Header from './components/Header';
import Main from './components/Main';

function App(): React.JSX.Element {
    //const [count, setCount] = useState(0)
    return (
        <div className={"grid grid-cols-[1fr_2fr_1fr]"}>
            <div className={"col-start-2 col-end-3"}>
                <Header />
                <Main />
                <footer>Footer</footer>
            </div>
        </div>
  )
}

export default App
