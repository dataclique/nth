/* @refresh reload */
import { render } from "solid-js/web"
import { Route, Router } from "@solidjs/router"
import App from "./App"
import Markets from "./pages/Markets"
import Market from "./pages/Market"

const root = document.getElementById("root")
if (root) {
  render(
    () => (
      <Router root={App}>
        <Route path="/" component={Markets} />
        <Route path="/markets/:id" component={Market} />
      </Router>
    ),
    root,
  )
}
