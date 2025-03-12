import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit"
import { isValidSuiObjectId } from "@mysten/sui/utils"
import { Box, Container, Flex, Heading } from "@radix-ui/themes"
import { useState } from "react"
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import { Counter } from "./Counter"
import { CreateCounter } from "./CreateCounter"
import { BackendStatus } from "./BackendStatus"
import { App2, CandleDataComponent } from "./Plot"

function App() {
  const currentAccount = useCurrentAccount()
  const [counterId, setCounter] = useState(() => {
    const hash = window.location.hash.slice(1)
    return isValidSuiObjectId(hash) ? hash : null
  })

  return (
    <Router>
      <>
        <Flex
          position="sticky"
          px="4"
          py="2"
          justify="between"
          style={{
            borderBottom: "1px solid var(--gray-a2)",
          }}
        >
          <Box>
            <Heading>dApp Starter Template</Heading>
            <Link to="/">Home</Link> | <Link to="/plot">Plot</Link>
          </Box>

          <Box>
            <ConnectButton />
          </Box>
        </Flex>

        <Container>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <BackendStatus />
                  <Container
                    mt="5"
                    pt="2"
                    px="4"
                    style={{ background: "var(--gray-a2)", minHeight: 500 }}
                  >
                    {currentAccount ? (
                      counterId ? (
                        <Counter id={counterId} />
                      ) : (
                        <CreateCounter
                          onCreated={id => {
                            window.location.hash = id
                            setCounter(id)
                          }}
                        />
                      )
                    ) : (
                      <Heading>Please connect your wallet</Heading>
                    )}
                  </Container>
                </>
              }
            />
            <Route
              path="/plot"
              element={
                <>
                  <App2 />

                  <CandleDataComponent />
                </>
              }
            />
          </Routes>
        </Container>
      </>
    </Router>
  )
}

export default App
