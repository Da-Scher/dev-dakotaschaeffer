import React from 'react';
import "./index.css";
//import reactLogo from './assets/react.svg'
//import viteLogo from './assets/vite.svg'
//import heroImg from './assets/hero.png'
//import './App.css'
import Header from './components/Header';
import Main from './components/Main';

function App(): React.JSX.Element {
    //const [count, setCount] = useState(0)
    return (
        <div className={"grid grid-cols-[minmax(0, 1fr)_minmax(0, 2fr)_minmax(0, 1fr)] w-full"}>
            <div className={"col-start-2 col-end-3"}>
                <Header />
                <Main />
                <footer>Footer</footer>
            </div>
        </div>
  )
}

export default App
