In this article we'll explore how to query for related records via associations that we define on our Objection models.

### Learning Goals

- Review the React UI necessary to present related records
- Determine how to setup Knex migrations that facilitate queries for related objects
- Define associations on the model level in order to get access to relation queries
- Understand how relation queries can be used in the context of an Express app

### Getting Started

```no-highlight
et get one-to-many-associations-in-express-and-objection
cd get one-to-many-associations-in-express-and-objection
createdb one-to-many-associations-in-express-and-objection_development
yarn install

cd server
yarn run migrate:latest
yarn run db:seed

cd ..
yarn run dev
```

For this assignment, files and code have already been created for you. Navigating to <http://localhost:3000> should show you the text "My Movie Genres" on the page with two genres listed.

Navigate to `/genres`, `/genres/1` and `/movies`  to familiarize yourself with the current application. These routes render a list of genres, details for a genre including related movies, and a list of movies respectively. Ensure that you familiarize yourself with each of the components in the `client/src/componenents` folder to get a sense of the frontend UI.

### Associated Records

Up until this point, our applications have frequently used only one singular "entity" or "resource". That is, our applications have been mostly concerned with rendering one type of record from our database, e.g. articles, recipes, groceries, unicorns, etc. However, once we've started adding more resources - and subsequently, more tables and models - we will want to be efficient in the way that we query for our records. For instance, given an individual teacher, how would we query for that teacher's related students? Defining **associations** on our models can give us a shorthand for querying related records. In Objection specifically, an associated record is also called a **relation** (not to be confused with "relations" as used to mean tables in SQL databases). In this way, a student would be a **relation** of a teacher.

### Mapping out Relations with ER Diagrams

In this application, we will work with the resources of genres and movies.

![Image of the one-to-many relationship between genres and movies][er-diagram-image]

An **ER Diagram** is an _Entity Relationship Diagram_, which gives us a visual representation of the associations at play in our database. We'll create boxes to indicate each of our tables, and will use _chicken feet_, or [_crow's foot notation_][crows-foot-notation], to show which table has many associated records on the other table.

The ER diagram above displays the relationship between genres and movies. For a given genre, there can be many related movies. However, a given movie in this case can only belong to a single genre. **Note: while technically a movie could be a part of many genres, we will consider a simpler relationship for this lesson**.

In this way, there is a "one-to-many" relationship between genres and movies. A genre has many movies, and a movie belongs to one genre.

### Migrations and Relations

The migrations for this application are mostly standard if familiar with Knex, but we need to ensure that a foreign key is designated on one of the two related tables to properly relate one genre record with one movie record. **In a one-to-many relationship, the resource that there are "many" of will usually be responsible for storing the foreign key.**

We can see how this is articulated in our code by examining the provided migrations. First, we can see that our migration for the "genres" table is a standard migration with no special columns or properties for associated records.

```js
// server/src/db/migrations/20201125161205_createGenres.cjs

exports.up = async (knex) => {
  return knex.schema.createTable("genres", (table) => {
    table.bigIncrements("id")
    table.string("name").notNullable()
    table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now())
    table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now())
  })
}
```

In the below migration for our "movies" table, however, we will note that because this is the migration for the resource that there are "many" of, we have to define a new column for storing the foreign key `genreId`.

```js
// server/src/db/migrations/20201125161213_createMovies

exports.up = async (knex) => {
  return knex.schema.createTable("movies", (table) => {
    table.bigIncrements("id")
    table.string("title").notNullable()
    table.string("year").notNullable()
    table.bigInteger("genreId").unsigned().index().references("genres.id")
    table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now())
    table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now())
  })
}
```

Specifically, we see this at play here:

```js
table.bigInteger("genreId").unsigned().index().references("genres.id")
```

In the line above, we store the id of the genre that a given new movie will belong and relate to. As far as our database is concerned, this is just a number that our "movies" table knows it can use to reference our "genres" table.

Below is a walkthrough of each bit of the syntax used here:

* `bigInteger` is a data type ideal for large numbers. If we have numerous movie records, it will ideal for this column to be able to hold a large number.
* `unsigned` ensures that only positive integers can be stored in this column.
* `index` adds an index on this column. An index is a functionality within our database that can pay special attention to certain columns, so as to speed up queries that deal with large datasets. If there are hundreds of thousands of movie records, then a query searching for a specific `id` will be executed much more quickly. Primary and foreign keys often have an index.
* `references(genres.id)` creates a reference pointing a given movie record to a genre record with the designated key. This ensures that a related `genre` is not deleted while it still has movies that reference that genre. It is a bit of a fail-safe on our database side.

The movie "Short Term 12" is a drama, and if we were to look into our database we would see that the `id` for the genre record for "drama" is `2`. Thus, in order to properly create the "Short Term 12" movie record and relate it to "drama" we would designate its `genreId` as `2`. For example:

```js
await Movie.query().insert({ title: 'Short Term 12', year: 2012, genreId: 2 })
```

With the appropriate foreign key column, our database is setup for queries that rely on the relationship between the `genreId` column on `movies` and the `id` column on `genres`.

### Setting Up Models with Relation Mappings

So far, we have set up our database to have foreign key references between one table and another. However, we don't have any way to quickly and easily get related records using Objection queries at this point!

Our current `Genre` and `Movie` models have been set up for standard Objection queries, but in order to leverage the power of a `relatedQuery`, we will need to define a static `relationMappings` method on each of them.

```js
// server/src/models/Genre.js

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
  // ...
}
```

In thinking about our "one-to-many" relationships, we can also think of them in the frame of reference of "parent-child" relationships, where our "one" side is the parent, and our "many" side is the child. In this example, we can consider the `Genre` model the "parent" model, and define its relation mapping accordingly. Above, we define a static `relationMappings` property for our class that needs to return an object whose keys correspond to specific model-relations. Once we have designated that we wish to create a `movies` relation, the object has the following properties:

* **relation**: the type of relation we wish to define between the model and its relation (here, a `HasManyRelation`).
* **modelClass**: the constructor of the associated model. We will need to import the related model (e.g. `Movie`) using CommonJS in order to load the module properly.
* **join**: defines the database columns through which the models are associated. The **to** and **from** properties must be columns on the appropriate table.

Thanks to our ER diagram, we can setup the `relationMappings` method more efficiently. We define a `HasManyRelation` because our model `Genre` relates to many different movies. We use the `Movie` model for `modelClass`. In `join`, we designate that the relation stems `from` the `genres` tables, and we use the "dot" syntax to point to the `id` column on that table. We do the same for the `to` key of `genreId` on the corresponding `movies` table.

You'll notice that we import the `Movie` model from _within_ our `relationMappings` method instead of at the top of our file. This is very important, as we need to make sure we avoid a _circular reference_ issue between our `Movie` and `Genre` classes.

Now, let's take a look at the inverse side of the relationship:

```js
// server/src/models/Movie.js

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
  //...
}
```

For our `Movies` model, we define the inverse relation; we will need both `relationMappings` in order for our relation queries to work! In this case, we use the `BelongsToOneRelation` to denote that each single movie belongs to a genre. We then establish how the relevant tables relate once more, making sure that we designate the correct columns in the `from` and `to` properties of the `join` object.

Note: on the `Genre` model we defined an association of `movies`, while on the `Movie` model we defined a relation of `genre`. `HasManyRelation` associations should generally be pluralized, while `BelongsToOneRelation` relations should generally be singular in order to be appropriately semantic when used. We can think of this as if we are calling a nested attribute: we might call `genre1.movies` to get all of the movies related to a `genre1` Genre record, and `movie1.genre` to obtain the singular genre that `movie1` is associated with.

With the correct `relationMappings` static methods defined on `Genre` and `Movie`, we can now use Objection to query for associated data more efficiently.

### Relation Queries

Now that we have set up our `relationMappings` in our models, we can use Objection's `relatedQuery`s in our code to get the associated data quickly and easily.

To see how we would use these queries in action, take a look at the below routes which are set up in the `genresRouter`:

```js
// server/src/routes/genresRouter.js

genresRouter.get("/", async (req, res) => {
  try {
    const genres = await Genre.query()
    return res.status(200).json({ genres: genres })
  } catch(error){
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
```

For the index route of `/api/v1/genres`, we're only showing the names of the genre, so we don't actually need access to the related movies. As such, no relation query is needed. Instead, we use the `query()` method to retrieve all of the genre records as objects.

However, for the `/api/v1/genre/:id` show route, we want to show both the name of the genre, as well as the movies that are tied to that genre! In other words, we need to retrieve only those movie records for a specific genre: e.g., for the genre of "comedy" we shouldn't see the movie "Titanic" in the returned list of records. This is where we can leverage the `$relatedQuery` method.

The `$relatedQuery` method can either be called on an _instance_ of a model (as shown above where it is called on our `genre` variable), or directly on a class. When calling on an instance of a genre, all we need to do is designate which relation we are trying to retrieve related records for (in this case `"movies"`).

Zooming in on the relevant code:

```js
// server/src/routes/genresRouter.js

const genre = await Genre.query().findById(id)
genre.movies = await genre.$relatedQuery("movies")
return res.status(200).json({ genre: genre, movies: movies })
```

Here, we first query for the appropriate genre using the `id` from our URL. Then, we query for the related movies for that specific genre using `genre.$relatedQuery("movies")`. `$relatedQuery` knows to look on our model for a `relationMappings` method, and to look for a mapping with a key of `movies`. It then executes the necessary join queries for us, behind the scenes. We store those movies as a nested attribute of our `genre`, so that we will be able to call `genre.movies` on our frontend. Finally, we send the built-out `genre` in our response body You can go to <http://localhost:3000/api/v1/genres/1> to check it out.

The inverse also works:

```js
const movie = await Movie.query().findById(3)
movie.genre = await movie.$relatedQuery("genre")
```

Now that our associations are set up correctly using our `relationMappings`, we can continue to use those associations in `$relatedQuery` calls throughout our app!

It's worth noting that we are beginning to see our controller (`genresRouter`) get muddied up with some business logic in the form of a number of different queries, and creation of our response body. There is a better way to organize this than by plopping it directly into our `genresRouter`, and that is by using a tool called a **Serializer**. We will talk more about this in a future article!

#### A Note on Nested Data

As far as our React frontend is concerned, if it's looking for nested data, it needs to be given a heads up. For example, let's open up `GenreShowPage` to see what we mean.

When we attempt to render all of the `MovieTile`s in this component, we `map()` over our `movies` array:

```js
const movieTileComponents = genre.movies.map(movieObject => {
  return(
    <MovieTile
      key={movieObject.id}
      {...movieObject}
    />
  )
})
```

Due to this functionality, it's extremely important that we set up our initial state properly.

For example, you may think that you could simply set your initial `genre` state up as so:

```js
const [genre, setGenre] = useState({})
```

Here, we're setting `genre` to an initial state of an empty object. This is all well and good until our `map()` function tries to run on initial load: we will get an error telling us that `genre.movies` is undefined, and we can't map over it.

The solution here is to pre-set `genre.movies` to an empty array, so that our React component has a "heads up" that a `movies` array will be provided as a part of the genre:

```js
const [genre, setGenre] = useState({ movies: [] })
```

Now, `genre.movies` will be an empty array on initial load, instead of `undefined`, and we will not encounter an error.

### Why This Matters

While the examples above show a simple use case, our application will need the efficiency of Objection associations as it grows in scale. By using `relationMappings` on our models and `$relatedQuery` calls in our queries, we can use the power of Objection functionality to find associated records in a well-organized and efficient way. This helps our code to be more readable _and_ allows it to run more quickly! The alternative would be to construct far more verbose and involved queries to do the same work.

Our `relationMappings` method will also provide more functionality that we will explore in the future as well!

### In Summary

In order to properly associate models and their records, we need to construct an ER diagram, generate the appropriate Knex migrations given the relationships between our records, and then define the association on the model level with the `relationMappings` method. This association allows us to query methods more easily with `$relatedQuery`.


[crows-foot-notation]: https://www.vertabelo.com/blog/crow-s-foot-notation/
[er-diagram-image]: https://s3.amazonaws.com/horizon-production/images/OneManyRelations.png