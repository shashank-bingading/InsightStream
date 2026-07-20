import './App.css'
import {useState} from 'react'
import Sidebar from './components/Sidebar'

function App() {
  const [inputText,setInputText] = useState("");
  const [sentiment,setSentiment] = useState(true);
  const [summarise,setSummarise] = useState(true);


  return (
    <div className='min-h-screen bg-main-bg text-text-primary flex'>
    <Sidebar/>
    <main className='flex-1 p-10 max-w-5xl mx-auto'>

    </main>
    </div>
  )
}

export default App
