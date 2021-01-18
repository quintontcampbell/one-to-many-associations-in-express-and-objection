const Model = require("./Model")

class Movie extends Model {
  static get tableName() {
    return "movies"
  }

  static get relationMappings(){
    const Genre = require("./Genre")
    return {
      genre: {
        relation: Model.BelongsToOneRelation,
        modelClass: Genre,
        join: {
          from: "movies.genreId",
          to: "genres.id"
        }
      }
    }
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["title", "year"],
      properties: {
        title: { type: "string", minLength: 1, maxLength: 255 },
        year: { type: "integer", minLength: 4, maxLength: 4 },
        genreId: { type: "integer"}
      }
    }
  }
}

module.exports = Movie
