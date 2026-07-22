import './App.css'
import {useState} from 'react'
import Sidebar from './components/Sidebar'
import DataInputZone from './components/DataInputZone';
import ModelControlPanel from './components/ModelControlPanel';

function App() {
  const [inputText,setInputText] = useState("");
  const [sentiment,setSentiment] = useState(true);
  const [summarise,setSummarise] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  const handleProcess = () => {
    if(!inputText.trim()) return;

    setIsProcessing(true);
    setTimeout(()=>{
      setIsProcessing(false);
      setHasProcessed(true);

    },1200)
  };

  return (
    <div className='min-h-screen bg-main-bg text-text-primary flex'>
    <Sidebar/>
    <main className='flex-1 p-10 max-w-5xl mx-auto'>
    <DataInputZone
    inputText={inputText}
    setInputText={setInputText}/>
    <ModelControlPanel
    sentiment={sentiment}
    setSentiment={setSentiment}
    summarise = {summarise}
    setSummarise={setSummarise}
    onProcess={handleProcess}
    isProcessing={isProcessing}
    isDisabled={!inputText.trim()}/>

    </main>
    </div>
  )
}

export default App
