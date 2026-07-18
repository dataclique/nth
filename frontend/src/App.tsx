import type { ParentProps } from "solid-js"
import { A } from "@solidjs/router"
import WalletButton from "./components/WalletButton"

export default function App(props: ParentProps) {
  return (
    <>
      <header class="app">
        <nav>
          <A class="brand" href="/">
            Nth Market
          </A>
          <A href="/">Markets</A>
        </nav>
        <WalletButton />
      </header>
      <main>{props.children}</main>
    </>
  )
}
