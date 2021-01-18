import React, { useState, useEffect } from "react"

import GenreTile from "./GenreTile"

const GenresListPage = () => {
  const [genres, setGenres] = useState([])

  useEffect(() => {
    async function getGenres() {
      try {
        const response = await fetch('/api/v1/genres')
        if (!response.ok) {
          const errorMessage = `${response.status} (${response.statusText})`
          const error = new Error(errorMessage)
          throw(error)
        }
        const parsedResponse = await response.json()
        setGenres(parsedResponse.genres)
      } catch(err) {
        console.error(`Error in fetch: ${err.message}`)
      }
    }
    getGenres()
  }, [])

  const genreTileComponents = genres.map(genreObject => {
    return(
      <GenreTile
        key={genreObject.id}
        {...genreObject}
      />
    )
  })

  return(
    <div className="callout">
      <h2>My Movie Genres</h2>
      {genreTileComponents}
    </div>
  )
}

export default GenresListPage
