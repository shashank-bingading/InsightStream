import axios from "axios"

interface SummaryOutput{
    summary:string,
    keyTakeaways:string[],
    readTimeMinutes:number,
}

const ai = process.env.FASTAPI_SERVICE_URL || "http://127.0.0.1:8000";

export const generateSummary = async(content: string):Promise<SummaryOutput>=>{
    try {
        //sending url and payload and expecting a response
        const response = await axios.post(`${ai}/generate-notes`,{
            text: content,
        });
        //Extracting properties
        const bulletPoints: string[] = response.data.bullet_points || [];
        const rawText:string = response.data.raw_text || "";
        // Split on whitespace to get total word count
        const wordCount = content.trim().split(/\s+/).length;

        // Calculate reading time (minimum 1 minute guard)
        const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

        return {
            summary:rawText,
            keyTakeaways:bulletPoints,
            readTimeMinutes:readTimeMinutes,
        };
    } catch (error:any) {
        console.error("[Python ML Microservice Error]:",error?.response?.data || error.message);
        throw new Error(
      `Failed to communicate with ML microservice: ${
        error.response?.data?.detail || error.message
      }`
    );
    }
}