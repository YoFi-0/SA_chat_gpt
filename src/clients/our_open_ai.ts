import axios from "axios"
import type {Method} from "axios"
import {config} from "dotenv"
import { translate } from "./translate"
import { CharacterArray } from "../config/server_config"
config()

interface Lolo_config  {
    api_key:string
}

interface LoloReq {
    headers?:any,
    body?:any
}

interface CreateStory {
    error:any,
    status:boolean,
    story:string,
    img_url:string
}



class Lolo_Open_Ai {
    private api_key:string
    constructor({api_key}:Lolo_config){
        this.api_key = api_key
    }

    private async req(path:string, method:Method, options?:LoloReq){
       return await axios({
            // url:`https://experimental.willow.vectara.io/v1${path}`,
            url:`https://api.openai.com/v1${path}`,
            method:method,
            data:options?.body,
            headers:{
                ...options?.headers,
                // "x-api-key": this.api_key,
                // "customer-id":"2898479364",
                "Authorization":` Bearer ${this.api_key}`,
                "Content-Type":"application/json"
            }
        })
    }
    public async createChat(msg:string){
        const route = "/chat/completions"
        return await this.req(route, "POST", {
            body:{
                model: "gpt-3.5-turbo",
                messages: [{"role": "user", "content":msg}]
            }
        })
    }
    public async createImg(img:string){
        const route = "/images/generations"
        return await this.req(route, "POST", {
            body:{
                prompt: `about ${img}`,
                n: 1,
                size: "1024x1024"
            }
        })
    }
    public async createImg_ch(img:string, characters:CharacterArray){
        const route = "/images/generations"
        const charactersString = characters.map((cracter, i) => {
            return `${i}. character name: ${cracter.name} and character traits: ${cracter.characteristic} and character gender: ${cracter.gender}`
        }).join("\n")
        return await this.req(route, "POST", {
            body:{
                prompt: `about ${img} and add this character (${charactersString}) with it`,
                n: 1,
                size: "1024x1024"
            }
        })
    }

    private async mainStory({
        ar_string,
        en_string,
        the_story,
        title,
        about,
        characters
    }:{ar_string:string, en_string:string, about?:string, the_story?:string, title:string, characters?:CharacterArray}){
        const ar_reg = /[ء-ي]/
        const qustion = ar_reg.test(the_story || title) ? ar_string : en_string
        const story = await this.createChat(qustion)
        const addToStory = about ? await this.createChat(
            ar_reg.test(the_story || title) ? `اضف ل هذه القصه ${story.data.choices[0].message.content} هذا المحتوى ${about}` :
            `add to this story ${story.data.choices[0].message.content} this content ${about}`
        ) : story
        if(about){
            var storyArray = (story.data.choices[0].message.content as string).split("\n")
             .concat((addToStory.data.choices[0].message.content as string).split("\n"))
        } else {
            var storyArray = (story.data.choices[0].message.content as string).split("\n")
        }
        
        const imgtitle = storyArray.filter(line => line != "")[1]
        const finalTitle:string = ar_reg.test(imgtitle) ? await translate(imgtitle) : imgtitle
        const img_url = characters ? await this.createImg_ch(ar_reg.test(title) ? await translate(title) : title, characters) : await this.createImg(ar_reg.test(title) ? await translate(title) : title)
        return {
            ar_reg:ar_reg,
            qustion:qustion,
            story:story,
            storyArray:storyArray,
            imgtitle:imgtitle,
            finalTitle:finalTitle,
            img_url:img_url
        }
    }


    
    // إضافة شخصية في وسط ال تكملة 
    // اضافة تعديل السكشن مع البوت
    // اضافة تعديل السكشن من المستخدم في الفونت اند

    public async createStory(title:string, options?:{characters?:CharacterArray, about?:string}):Promise<CreateStory>{
        try{
            const rest_ar = options?.characters?.length != 0 ? options?.characters!.map((cracter, i) => {
                return `:إسم الشخصية .${i}${cracter.name} :و صفات الشخصية ${cracter.characteristic} و جنس الشخصيه: ${cracter.gender}`
            }).join("\n") : ""
            const rest_en = options?.characters?.length != 0 ? options?.characters!.map((cracter, i) => {
                return `${i}. character name: ${cracter.name} and character traits: ${cracter.characteristic} and character gender: ${cracter.gender}`
            }).join("\n") : ""
            const {img_url, storyArray} = await this.mainStory({
                ar_string: options?.characters?.length != 0  ? `أنشئ قصة قصيرة عن ${title} و اضف إليها الشخصيات الأتيه (${rest_ar}) لكن لا تنهيها` : `أنشئ قصة قصيرة عن ${title} لكن لا تنهيها`,
                en_string: options?.characters?.length != 0 ? `create a short story about ${title} and add this characters with it (${rest_en}) but don't end it` :`create a short story about ${title} but don't end it`,
                title:title,
                characters:options?.characters,
                about:options?.about
            })
            return {
                error:null,
                status:true,
                story:storyArray.filter((line, i) => i != storyArray.length - 1).join(""),
                img_url:img_url.data.data[0].url
            }
        } catch(err:any){
             return {
                error:err.response.data,
                status:false,
                story:"",
                img_url:""
            }
        }
    }
    public async completeStory(the_story:string, title:string, options?:{characters?:CharacterArray, about?:string}):Promise<CreateStory>{
        try{
            const {img_url, storyArray} = await this.mainStory({
                ar_string:`اكمل القصة (${the_story}) في اقسام متصلة اخرى`,
                en_string:`complete the story (${the_story}) in other connected sections`,
                the_story:the_story,
                title:title,
                characters:options?.characters,
                about:options?.about
            })
            return {
                error:null,
                status:true,
                story:storyArray.filter((line, i) => i != storyArray.length - 1).join(""),
                img_url:img_url.data.data[0].url
            }
        } catch(err:any){
             return {
                error:err.response.data.error,
                status:false,
                story:"",
                img_url:""
            }
        }
    }
    public async endStory(the_story:string, title:string, options?:{about?:string}):Promise<CreateStory>{
        try{
            const {img_url, storyArray} = await this.mainStory({
                ar_string:`قم بإنهاء القصة (${the_story}) في اقسام متصلة اخرى`,
                en_string:`end the story (${the_story}) in other connected sections`,
                the_story:the_story,
                title:title,
                about:options?.about
            })
            return {
                error:null,
                status:true,
                story:storyArray.filter(_=> true).join(""),
                img_url:img_url.data.data[0].url
            }
        } catch(err:any){
             return {
                error:err.response.data.error,
                status:false,
                story:"",
                img_url:""
            }
        }
    }
    public async createChatTalk(msg:string){
        const route = "/chat/completions"
        const res = await this.req(route, "POST", {
            body:{
                model: "gpt-3.5-turbo",
                messages: [{"role": "user", "content":msg}]
            }
        })
        const regxpNoCharcaters = /\w/g
        return (res.data.choices[0].message.content as string).replace(/[\"\'\\\{\\[\]\(\)\}]/g, "")
    }
}

const lolo_Client = new Lolo_Open_Ai({
    api_key:process.env.OPEN_AI_API_KEY as string
})

export default lolo_Client