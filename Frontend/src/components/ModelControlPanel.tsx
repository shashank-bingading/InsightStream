interface ModelControlPanelProps {
    sentiment:boolean;
    setSentiment:(value:boolean)=>void;
    summarise:boolean;
    setSummarise:(value:boolean)=>void;
    onProcess: ()=>void;
    isProcessing:boolean;
    isDisabled:boolean;
}

const ModelControlPanel = ({sentiment,setSentiment,summarise,setSummarise,onProcess,isProcessing,isDisabled}:ModelControlPanelProps) => {
  return (
    <div className="flex justify-between sm:flex-wrap items-center mt-6 bg-surface rounded-2xl border border-accent shadow  p-3">
      <div className="flex items-center gap-6 ">

        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        Pipelines:
        </span>

        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-text-primary">
            <input 
            className="accent-accent cursor-pointer"
            type="checkbox"
            checked={sentiment}
            onChange={(e)=>setSentiment(e.target.checked)}
            />
            Sentiment
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-text-primary">
            <input
             className="accent-accent cursor-pointer"
            type="checkbox"
            checked={summarise}
            onChange={(e)=>setSummarise(e.target.checked)}/>
            Summarise
        </label>
        
        
      </div>
      <button
        onClick={onProcess}
        disabled={isDisabled || isProcessing}
        className="px-6 py-2.5 rounded-lg font-medium text-sm transition bg-accent text-main-bg hover:brightness-110 active:scale-95 disabled:opacity-50
        disabled:cursor-not-allowed"
        >{isProcessing ? "Analyzing..." : "Execute Pipeline"
            }</button>
    </div>
  )
}

export default ModelControlPanel
