import {Router} from "express"
import lolo_Client from "../clients/our_open_ai"
import { CharacterArray } from "../config/server_config"
const api_v1 = Router()

type Res = {
    status:"ok" | "not ok",
    status_code:number
    server_msg:String | "i think there is a problem"
    story:string
    img_url:string
}
type ResQ = {
    status:"ok" | "not ok",
    status_code:number
    server_msg:String | "i think there is a problem"
    answer:string
}

api_v1.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    next()
})

api_v1.get("/refresh", (req, res) => {
    var sesstionErr;
    const firstRes:Res = {
        status:"not ok",
        status_code:400,
        server_msg:"",
        story:"",
        img_url:"",
    }
    req.session.destroy(err => {
        if(err){
            sesstionErr = err
        }
    })
    if(sesstionErr){
        res.status(500)
        firstRes.server_msg = "i think there is a problem"
        firstRes.status_code = res.statusCode
        console.log(sesstionErr)
        return res.json(firstRes)
    }
    return res.json({
        status:"ok",
        status_code:res.statusCode,
        server_msg:"user refreshed",
        story:"",
        img_url:"",
    })
})

api_v1.get('/create_ch', async(req, res) => {
    const {title, characters} = req.body
    const charactersArray:CharacterArray = characters
    const firstRes:Res = {
        status:"not ok",
        status_code:400,
        server_msg:"",
        story:"",
        img_url:"",
    }
    if(!title || !characters || !characters?.length || characters.length == 0){
        firstRes.server_msg = "you need to provide a title and characters"
        return res.json(firstRes)
    }
    const story_obj = await lolo_Client.createStory(title, {characters:charactersArray})
    if(!story_obj.status || story_obj.error){
        res.status(500)
        firstRes.server_msg = "i think there is a problem"
        firstRes.status_code = res.statusCode
        console.log(story_obj.error)
        return res.json(firstRes)
    }
    req.session.last_story = story_obj.story
    req.session.last_title = title
    return res.json({
        status:"ok",
        status_code:res.statusCode,
        server_msg:"i created a story for you",
        story:story_obj.story,
        img_url:story_obj.img_url,
    })
})

api_v1.get('/create', async(req, res) => {
    const {title, characters, about} = (JSON.parse(req.query.data as string) as any)
    const firstRes:Res = {
        status:"not ok",
        status_code:400,
        server_msg:"",
        story:"",
        img_url:"",
    }
    if(!title){
        firstRes.server_msg = "you need to provide a title"
        return res.json(firstRes)
    }
    const story_obj = await lolo_Client.createStory(title, {
        characters:characters,
        about:about
    })
    if(!story_obj.status || story_obj.error){
        res.status(500)
        firstRes.server_msg = "i think there is a problem"
        firstRes.status_code = res.statusCode
        console.log(story_obj.error)
        return res.json(firstRes)
    }
    req.session.last_story = story_obj.story
    req.session.last_title = title
    return res.json({
        status:"ok",
        status_code:res.statusCode,
        server_msg:"i created a story for you",
        story:story_obj.story,
        img_url:story_obj.img_url,
    })
})

api_v1.get('/complete', async(req, res) => {
    const {last_story, last_title} = req.session
    const {about, characters} = req.body
    const firstRes:Res = {
        status:"not ok",
        status_code:400,
        server_msg:"",
        story:"",
        img_url:"",
    }
    if(!last_story || !last_title){
        firstRes.server_msg = "you dont have a story to complete"
        return res.json(firstRes)
    }
    const story_obj = await lolo_Client.completeStory(last_story, last_title, {
        about:about,
        characters:characters
    })
    if(!story_obj.status || story_obj.error){
        res.status(500)
        firstRes.server_msg = "i think there is a problem"
        firstRes.status_code = res.statusCode
        console.log(story_obj.error)
        return res.json(firstRes)
    }
    req.session.last_story = story_obj.story
    return res.json({
        status:"ok",
        status_code:res.statusCode,
        server_msg:"i complete a story for you",
        story:story_obj.story,
        img_url:story_obj.img_url,
    })
})

api_v1.get('/complete_from_body', async(req, res) => {
    const {about, characters,last_story, last_title} = JSON.parse(req.query.data as string)
    console.log(last_story)
    const firstRes:Res = {
        status:"not ok",
        status_code:400,
        server_msg:"",
        story:"",
        img_url:"",
    }
    if(!last_story || !last_title){
        firstRes.server_msg = "you dont have a story to complete"
        return res.json(firstRes)
    }
    const story_obj = await lolo_Client.completeStory(last_story, last_title, {
        about:about,
        characters:characters
    })
    if(!story_obj.status || story_obj.error){
        res.status(500)
        firstRes.server_msg = "i think there is a problem"
        firstRes.status_code = res.statusCode
        console.log(story_obj.error)
        return res.json(firstRes)
    }
    req.session.last_story = story_obj.story
    return res.json({
        status:"ok",
        status_code:res.statusCode,
        server_msg:"i complete a story for you",
        story:story_obj.story,
        img_url:story_obj.img_url,
    })
})
api_v1.get('/end', async(req, res) => {
    const {last_story, last_title, about} = JSON.parse(req.query.data as string)
    const firstRes:Res = {
        status:"not ok",
        status_code:400,
        server_msg:"",
        story:"",
        img_url:"",
    }
    if(!last_story || !last_title){
        firstRes.server_msg = "you dont have a story to end"
        return res.json(firstRes)
    }
    const story_obj = await lolo_Client.endStory(last_story, last_title, {
        about:about
    })
    if(!story_obj.status || story_obj.error){
        res.status(500)
        firstRes.server_msg = "i think there is a problem"
        firstRes.status_code = res.statusCode
        console.log(story_obj.error)
        return res.json(firstRes)
    }
    var sesstionErr;
    req.session.destroy(err => {
        if(err){
            sesstionErr = err
        }
    })
    if(sesstionErr){
        res.status(500)
        firstRes.server_msg = "i think there is a problem"
        firstRes.status_code = res.statusCode
        return res.json(firstRes)
    }
    return res.json({
        status:"ok",
        status_code:res.statusCode,
        server_msg:"i end a story for you",
        story:story_obj.story,
        img_url:story_obj.img_url,
    })
})

api_v1.get('/create_img', async(req, res) => {
    const {title} = req.body
    const firstRes:Res = {
        status:"not ok",
        status_code:400,
        server_msg:"",
        story:"",
        img_url:"",
    }
    if(!title){
        firstRes.server_msg = "you need to provide a title"
        return res.json(firstRes)
    }
    var story_obj
    try{
         story_obj = await lolo_Client.createImg(title)
    }
    catch(err){
        res.status(500)
        firstRes.server_msg = "i think there is a problem"
        firstRes.status_code = res.statusCode
        console.log(err)
        return res.json(firstRes)
    }
    return res.json({
        status:"ok",
        status_code:res.statusCode,
        server_msg:"i created a image for you",
        story:"",
        img_url:story_obj.data.data[0].url,
    })
})

api_v1.get("/ask", async(req, res) => {
    const {question} = req.body
    const firstRes:ResQ = {
        status:"not ok",
        status_code:400,
        server_msg:"",
        answer:""
    }
    if(!question){
        console.log("there is no question")
        firstRes.server_msg = "i think there is a problem"
        return res.json(firstRes)
    }
    var loloAsk:string;
    try{
        loloAsk = await lolo_Client.createChatTalk(question)
    } catch(err){
        res.status(500)
        console.log("there is no question")
        firstRes.server_msg = "i think there is a problem"
        return res.json(firstRes)
    }
    return res.json({
        status:"ok",
        status_code:res.statusCode,
        server_msg:"massge arrived",
        answer:loloAsk
    } as ResQ)
})

export default api_v1