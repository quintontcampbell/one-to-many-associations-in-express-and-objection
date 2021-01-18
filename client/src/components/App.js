import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom"

import GenresListPage from "./GenresListPage"
import GenreShowPage from "./GenresShowPage"
import MoviesListPage from "./MoviesListPage"

import { hot } from "react-hot-loader/root";

import "../assets/scss/main.scss";

const App = props => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={GenresListPage} />
        <Route exact path="/genres" component={GenresListPage} />
        <Route exact path="/genres/:id" component={GenreShowPage} />
        <Route exact path="/movies" component={MoviesListPage} />
      </Switch>
    </BrowserRouter>
  )
}

export default hot(App);
