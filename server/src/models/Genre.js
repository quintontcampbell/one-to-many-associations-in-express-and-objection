const Model = require("./Model")

class Genre extends Model {
  static get tableName() {
    return "genres"
  }

  static get relationMappings() {
    const Movie = require("./Movie")

    return {
      movies: {
        relation: Model.HasManyRelation,
        modelClass: Movie,
        join: {
          from: "genres.id",
          to: "movies.genreId"
        }
      }
    }
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", minLength: 1, maxLength: 20 },
      }
    }
  }
}

module.exports = Genre
