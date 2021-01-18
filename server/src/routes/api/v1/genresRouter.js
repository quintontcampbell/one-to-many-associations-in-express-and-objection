import express from "express"

import { Genre } from "../../../models/index.js"

const genresRouter = new express.Router()

genresRouter.get("/", async (req, res) => {
  try {
    const genres = await Genre.query()
    return res.status(200).json({ genres: genres })
  } catch(error){
    console.log(error)
    return res.status(500).json({ errors: error })
  }
})

genresRouter.get("/:id", async (req, res) => {
  const { id } = req.params
  try {
    const genre = await Genre.query().findById(id)
    genre.movies = await genre.$relatedQuery("movies")
    return res.status(200).json({ genre: genre })
  } catch(error){
    return res.status(500).json({ errors: error })
  }
})

export default genresRouter
