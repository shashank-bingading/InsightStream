interface DataInputZoneProps{
    inputText:string;
    setInputText:(value:string)=>void;
}

const DataInputZone = ({inputText,setInputText}:DataInputZoneProps) => {
  return (
    <div className='bg-surface rounded-xl p-6 border border-text-secondary shadow-md'>
      <div className="flex justify-between items-center mb-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Source Input Data</label>
        {inputText.length}
      </div>
      <textarea
      value={inputText}
        onChange={(e)=>setInputText(e.target.value)}
        placeholder="Paste text here to analyze..."
        className="w-full h-40 bg-main-bg text-text-primary placeholder:text-text-secondary/40 p-4 rounded-lg border border-text-secondary/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition resize-none text-sm font-mono leading-relaxed"/>

    </div>
  )
}

export default DataInputZone
