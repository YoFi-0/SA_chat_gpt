import axios from "axios"
import type {Method} from "axios"
import {config} from "dotenv"
config()

interface Translator_config  {
    api_key:string
}
interface TranslatorReq {
    headers?:any,
    body?:any
}



export const  translate = async(text:string) => {
    const translatorApi =  await axios({
        url:`https://api.mymemory.translated.net/get?q=${text}&langpair=ar-SA|en-US`,
        method:"GET",
    })
    return (translatorApi.data.responseData.translatedText as string).replace(/[\'\"\,\.\-\_\?\’\,\/\؟]/g, "")
}

