/* eslint-disable no-console */
import { connection } from "../boot.js";
import configuration from "../config.js";

import Genre from "../models/Genre.js"
import Movie from "../models/Movie.js"

class Seeder {
  static async seed() {
    console.log("seeding...");
    const comedy = await Genre.query().insert({name: "Comedy"})
    const drama = await Genre.query().insert({name: "Drama"})
    
    await comedy.$relatedQuery('movies').insert({ title: 'Isle of Dogs', year: 2018 })
    await comedy.$relatedQuery('movies').insert({ title: 'What We Do in the Shadows', year: 2014 })

    await drama.$relatedQuery('movies').insert({ title: 'Short Term 12', year: 2013 })
    await drama.$relatedQuery('movies').insert({ title: '50/50', year: 2011 })


    console.log("Done!");
    await connection.destroy();
  }
}

export default Seeder;
