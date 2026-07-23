interface StreamOutputBoardProps {
    hasProcessed:boolean;
    isProcessing:boolean;
    sentiment:boolean;
    summarise:boolean;
    inputText:string;
}

const StreamOutputBoard = ({hasProcessed,isProcessing,sentiment,summarise,inputText}:StreamOutputBoardProps) => {
  return (
    <div className="mt-8">
      {!hasProcessed && !isProcessing ? (
        <div className="border-2 border-dashed border-text-secondary/20 rounded-md p-6 text-center font-mono">
            Ready to process. Enter text above and click "Execute Pipeline".
        </div>
      ):isProcessing?(<div
      className="bg-surface rounded-2xl p-4 border transition animate-pulse">
        <p>
            Running NLP Models & Analyzing Data...
        </p>
      </div>):(
        <div className="grid grid-cols-1 md: grid-cols-2 gap-6 py-2">
            {sentiment && (
                <div className="bg-surface p-6 rounded-md border shadow-md border-text-secondary/15 flex flex-col justify between">
                    <div>
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary pb-3">
                            Sentiment Analysis
                            </h3>
                            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-500/20">
                            Positive
                            </span>
                        </div>
                        <p className="text-sm text-text-primary leading-relaxed mb-4">

                        </p>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-text-secondary font-mono mb-1">
                        <span className="text-text-primary">
                            Confidence Score
                        </span>
                        <span className="text-text-primary">
                            94%
                        </span>
                        </div>
                    </div>
                </div>
            )}
            {summarise && (
                <div className="bg-surface rounded-xl p-6 border border-text-secondary/15 shadow-md flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-4 ">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                            Key Summary
                            </h3>
                            <span className="bg-accent/10 text-accent text-xs px-2.5 py-1 rounded-full font-medium border border-accent/20">
                            Extracted
                            </span>
                        </div>
                        <p className="text-sm text-text-primary leading-relaxed font-mono">
                            "{inputText.slice(0, 140)}{inputText.length > 140 ? "..." : ""}"
                        </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-text-secondary/10 flex justify-between text-xs text-text-secondary font-mono">
                        <span>
                            Original: {inputText.length} chars
                        </span>
                        <span>
                            Reduced: ~{Math.min(inputText.length, 140)} chars
                        </span>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  )
}

export default StreamOutputBoard
