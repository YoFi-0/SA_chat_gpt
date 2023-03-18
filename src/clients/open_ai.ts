import {Configuration, OpenAIApi} from "openai"
import {config} from "dotenv"
config()


const client:OpenAIApi = new OpenAIApi(new Configuration({
    apiKey:process.env.OPEN_AI_API_KEY
}));

export default client