import torch
from fastapi import FastAPI
from contextlib import asynccontextmanager
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification

ml_models={}

@asynccontextmanager
async def lifespan(app:FastAPI):
    print("Booting up AI microservice Lifecycle")
    print("Loading NLP models into RAM")

    model_name = "distilbert-base-uncased-finetuned-sst-2-english"

    ml_models["tokenizer"] = AutoTokenizer.from_pretrained(model_name)

    ml_models["model"] = AutoModelForSequenceClassification.from_pretrained(model_name)

    print("Model wights loaded successfully into RAM. Ready for inference")

    yield
    #code stops here and stays up until serverr is running
    ml_models.clear()
    print("Servers Shutting Down")

#application Instance Initialization
app = FastAPI(lifespan=lifespan)

class ArticleInput(BaseModel):
    text:str

@app.get("/health")
def health_check():
    return {"status":"healthy"}

@app.post("/analyze")
async def analyze_article(payload: ArticleInput):
    text = payload.text

    # trying to retrieve our loaded assests from RAM

    tokenizer = ml_models["tokenizer"]
    model = ml_models["model"]

    #Text to Numbers (Tokenization)
    inputs = tokenizer(
        text,
        return_tensors = "pt",
        padding = True,
        max_length=512,
        truncation = True,   
    )
    #Neural Network Prdiction (Inference only)
    with torch.no_grad():
        outputs = model(**inputs)

    #Converting logits to Percentages

    logits = outputs.logits
    probabilities = torch.softmax(logits,dim=1).flatten().tolist()

    negative_score = probabilities[0]
    positive_score = probabilities[1]

    #Structuring output JSON
    sentiment = "POSITIVE" if positive_score>negative_score else "NEGATIVE"

    confidence = max(positive_score,negative_score)

    return{
        "sentiment":sentiment,
        "confidence":round(confidence,4),
        "scores":{
            "positives":round(positive_score,4),
            "negative":round(negative_score,4)
        }
    }