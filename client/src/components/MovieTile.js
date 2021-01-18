import React from "react"

const MovieTile = ({ title, year }) => {
  return(
    <div className="callout">
      <h4> {title} </h4>
      <p> {year} </p>
    </div>
  )
}

export default MovieTile
