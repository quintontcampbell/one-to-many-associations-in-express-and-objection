import React from "react"
import { Link } from "react-router-dom"

const GenreTile = ({ id, name }) => {
  return(
    <div className="callout">
      <Link to={`/genres/${id}`}> {name} </Link>
    </div>
  )
}

export default GenreTile
