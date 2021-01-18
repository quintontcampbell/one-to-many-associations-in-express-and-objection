import express from "express"
import clientRouter from "./clientRouter.js"
const rootRouter = new express.Router()

import genresRouter from "./api/v1/genresRouter.js"
import moviesRouter from "./api/v1/moviesRouter.js"

rootRouter.use("/api/v1/genres", genresRouter)
rootRouter.use("/api/v1/movies", moviesRouter)
rootRouter.use("/", clientRouter)


export default rootRouter
