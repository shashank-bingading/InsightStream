import './App.css'
import {useState} from 'react'
import Sidebar from './components/Sidebar'
import DataInputZone from './components/DataInputZone';
import ModelControlPanel from './components/ModelControlPanel';
import StreamOutputBoard from './components/StreamOutputBoard';
import { AuthProvider, useAuth } from './components/AuthContext';
import Auth from './components/Auth';
import API from './api/api';

function MainApp() {
  const [inputText,setInputText] = useState<string>("");
  const [sentiment,setSentiment] = useState<boolean>(true);
  const [takeaways,setTakeaways] = useState<string[]>([]);
  const [summarise,setSummarise] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hasProcessed, setHasProcessed] = useState<boolean>(false);
  const [sentimentConfidence,setSentimentConfidence] = useState<number>(0);
  const [readTime, setReadTime] = useState<number>(0);


  const {isAuthenticated} = useAuth();

  //if user not logged in
  if(!isAuthenticated){
    return (
      <Auth/>
    )
  }
  const handleProcess = async():Promise<void> => {
    if(!inputText.trim()) return;

    setIsProcessing(true);
    
    try {
      const res = await API.post("/",{url:inputText});

      const a = res.data.data.article;

      //setting states
      setSummarise(a.summary);
      setTakeaways(JSON.parse(a.keyTakeways || "[]"));
      setSentiment(a.sentiment);
      setSentimentConfidence(a.sentimentConfidence);
      setReadTime(a.readTimeMinutes);
      setHasProcessed(true);

    } catch (error) {
      console.error(error);
    }
    finally{
      setIsProcessing(false);
    }
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
    <StreamOutputBoard
    hasProcessed={hasProcessed}
    isProcessing={isProcessing}
    sentiment = {sentiment}
    summarise={summarise}
    article={article}
    />
    </main>
    </div>
  )
}

export default function App(){
  return(
    <AuthProvider>
      <MainApp/>
    </AuthProvider>
  )
}
