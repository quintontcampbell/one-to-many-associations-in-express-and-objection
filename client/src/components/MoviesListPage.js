import React, { useState, useEffect } from "react"

import MovieTile from "./MovieTile"

const MoviesListPage = () => {
  const [movies, setMovies] = useState([])

  useEffect(() => {
    async function getMovies() {
      try {
        const response = await fetch('/api/v1/movies')
        if (!response.ok) {
          const errorMessage = `${response.status} (${response.statusText})`
          const error = new Error(errorMessage)
          throw(error)
        }
        const parsedResponse = await response.json()
        setMovies(parsedResponse.movies)
      } catch(err) {
        console.error(`Error in fetch: ${err.message}`)
      }
    }
    getMovies()
  }, [])

  const movieTileComponents = movies.map(movieObject => {
    return(
      <MovieTile
        key={movieObject.id}
        {...movieObject}
      />
    )
  })

  return(
    <div className="callout">
      {movieTileComponents}
    </div>
  )
}

export default MoviesListPage
