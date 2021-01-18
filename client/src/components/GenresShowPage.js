import React, { useState, useEffect } from "react"

import MovieTile from "./MovieTile"

const GenreShowPage = (props) => {
  const [genre, setGenre] = useState({ movies: [] })

  useEffect(() => {
    const id = props.match.params.id
    async function getGenre() {
    try {
      const response = await fetch(`/api/v1/genres/${id}`)
      if (!response.ok) {
        const errorMessage = `${response.status} (${response.statusText})`
        const error = new Error(errorMessage)
        throw(error)
      }
      const genreData = await response.json()
      setGenre(genreData.genre)
    } catch(err) {
      console.error(`Error in fetch: ${err.message}`)
    }
    }
    getGenre()
  }, [])

  const movieTileComponents = genre.movies.map(movieObject => {
    return(
      <MovieTile
        key={movieObject.id}
        {...movieObject}
      />
    )
  })

  return(
    <div className="callout">
      <h1>{genre.name}</h1>
      {movieTileComponents}
    </div>
  )
}

export default GenreShowPage
