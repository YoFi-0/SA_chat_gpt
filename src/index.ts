import client from "./clients/open_ai"
import express from "express"
import lolo_Client from "./clients/our_open_ai";
import { translate } from "./clients/translate";
import { jwt_access_key, server_port, setConfig } from "./config/server_config";
import indexRoute from "./routes/index"
import api_v1_Route from "./routes/api_v1"

const server = express();

declare module 'express-session' {
    interface SessionData {
        last_story:string,
        last_title:string
    }
}


setConfig(server)

server.use("/", indexRoute)
server.use("/api/v1", api_v1_Route)

server.listen(server_port, async() => {
    if(!jwt_access_key || !jwt_access_key){
        throw Error("jwt keys is undefined")
    }
    (async() => {
        try{
            const completion = await client.createCompletion({
                model: "text-davinci-003",
                prompt: "Hello world !",
              });
              console.log("open ai lib is running")
        } catch(err:any){
            console.log("open ai lib err")
            console.log(err.response.data.error)
        }
    })();
    (async() =>{
        try{
            const req = await lolo_Client.createChat("Hello world !")
            console.log("lolo open ai is running")
        } catch(err:any){
            console.log("lolo open ai lib err")
            console.log(err.response.data)
        }
    })();
    console.log("server is running in port " + server_port)
        // const story = await lolo_Client.createStory("قصة رمزية عن المال و الصحة و الشباب في ميتم برمودا")
    // console.log(story)
    // const cmplet = await lolo_Client.completeStory(story.story)
    // console.log(cmplet)
    // const cmplet2 = await lolo_Client.completeStory(cmplet.story)
    // console.log(cmplet2)
    // const end = await lolo_Client.endStory(cmplet2.story)
    // console.log(end)
});


