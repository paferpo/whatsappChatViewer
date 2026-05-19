/* @refresh reload */
import { render } from "solid-js/web";
import 'solid-devtools';

import "./styles/bulma.scss";
import "./styles/whatsapp.scss";
import App from "./App";
import { Route, Router } from "@solidjs/router";
import Home from "./views/Home";
import Viewer from "./views/Viewer";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?"
  );
}

render(() => (
  <Router root={App}>
    <Route path="/" component={Home} />
    <Route path="/viewer" component={Viewer} />
  </Router>
  ), root!
);
