import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import type { Express }  from "express";
import {config} from "dotenv"
import path from "path"
import FileStoreConf from 'session-file-store'
config()
const is_production = process.env.IS_PRODUCTION == "true" ? true : false

var FileStore:FileStoreConf.FileStore

if(is_production){
    FileStore = FileStoreConf(session)
}

export type CharacterArray = {
    name:string,
    characteristic:string,
    gender:"male" | "female"
}[]

export const server_port = isNaN(Number(process.env.SERVER_PORT)) ? 8000 : Number(process.env.SERVER_PORT)
export const jwt_access_key = process.env.JWT_ACCESS_KEY
export const jwt_rf_key = process.env.JWT_RF_KEY

export const setConfig = (app:Express) =>{
    const cookieMaxAge = 1000 * 60 * 60 * 24
    app.set('view engine', 'ejs')
    app.use(express.urlencoded({extended:false}))
    app.use(express.static(path.join(__dirname, "../../public")))
    app.use(express.json())
    app.use(cookieParser(process.env.SESSION_SECRIT))
    app.use(session({
        secret:process.env.SESSION_SECRIT as string,
        resave: false,
        name: "YOFI_SESSTION",
        saveUninitialized: true,
        store: is_production ? new FileStore({
            path:path.join(__dirname, "../../session_store"),
            maxTimeout:cookieMaxAge
        }) : undefined,
        cookie:{
            maxAge:cookieMaxAge,
            httpOnly:true,
        }
    }))
}