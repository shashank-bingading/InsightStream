import torch
from fastapi import FastAPI
from contextlib import asynccontextmanager
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification,AutoModelForSeq2SeqLM,AutoModel

ml_models={}

@asynccontextmanager
async def lifespan(app:FastAPI):
    print("Booting up AI microservice Lifecycle")
    print("Loading NLP models into RAM")

    model_name = "distilbert-base-uncased-finetuned-sst-2-english"

    ml_models["classifier_tokenizer"] = AutoTokenizer.from_pretrained(model_name)
    ml_models["classifier_model"] = AutoModelForSequenceClassification.from_pretrained(model_name)

    print("Loading Instruction Model (Flan-T5-Base)...")
    notes_model_name = "google/flan-t5-base"
    ml_models["notes_tokenizer"] = AutoTokenizer.from_pretrained(notes_model_name)
    ml_models["notes_model"] = AutoModelForSeq2SeqLM.from_pretrained(notes_model_name)

    print("Loading Embeddng Model (all-MiniLM-L6-v2)...")
    embedding_model_name = "sentence-transformers/all-MiniLM-L6-v2"
    ml_models["embed_tokenizer"] = AutoTokenizer.from_pretrained(embedding_model_name)
    ml_models["embed_model"] = AutoModel.from_pretrained(embedding_model_name)

    print("All Models ready!")
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

    tokenizer = ml_models["classifier_tokenizer"]
    model = ml_models["classifier_model"]

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

@app.post("/generate-notes")
async def generate_notes(payload:ArticleInput):
    text = payload.text

    #now we take tokenizer and model for Flan-T5 model for RAM
    tokenizer = ml_models["notes_tokenizer"]
    model = ml_models["notes_model"]

    #1:master prompt

    prompt = (
        "Identify the 5 most important key takeaways from this text "
        "and present them as a clean, structured list of bullet points:\n\n"
        f"Text: {text}"
    )

    #2. Convert prompt to numbers (Tensors)
    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        max_length=1024,
        truncation= True
    )

    #generating the response
    with torch.no_grad():
        output_ids = model.generate(
            inputs["input_ids"],
            max_length = 200,
            num_beams=4,
            length_penalty=1.0,
            early_stopping=True
        )
    
    #decoding the output tokens
    notes_raw = tokenizer.decode(output_ids[0],skip_special_tokens=True)

    notes_lists = [
        item.strip("*.-").strip()
        for item in notes_raw.split(".")
        if len(item.strip())>5
    ]

    return {
        "raw_text":notes_raw,
        "bullet_points":notes_lists
    }

@app.post("/generate-embeddings")
async def generate_embeddings(payload: ArticleInput):
    text = payload.text

    tokenizer = ml_models["embed_tokenizer"]
    model = ml_models["embed_model"]

    inputs = tokenizer(
        text,
        return_tensors = "pt",
        padding = True,
        truncation = True,
        max_length = 512
    )

    with torch.no_grad():
        outputs = model(**inputs)

    #for the final input from the hidden layer
    token_embeddings = outputs.last_hidden_state
    attention_mask = inputs["attention_mask"]

    #adding a whole dimesion here
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()

    sum_embeddings = torch.sum(token_embeddings * input_mask_expanded,1)

    sum_mask = torch.clamp(input_mask_expanded.sum(1),min=1e-9)

    mean_pooled_vector = (sum_embeddings/ sum_mask).flatten().tolist()

    return {
        "dimensions": len(mean_pooled_vector),
        "embeddings": mean_pooled_vector
    }