import {Router} from "express"
const index = Router()
index.get('/', (req, res) => {
    res.render("ar")
})
index.get('/ar', (req, res) => {
    res.redirect("/")
})
index.get('/en', (req, res) => {
    res.render("en")
})



export default index
