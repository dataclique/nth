import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit"
import { Box, Container, Flex, Heading } from "@radix-ui/themes"
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import { BackendStatus } from "./BackendStatus"
import Plot from "./Plot"
import { MarginAccountManager } from "./MarginAccountManager"

function App() {
  const currentAccount = useCurrentAccount()

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
            <Heading>Strike Finance</Heading>
            <Link to="/">Home</Link> | <Link to="/portfolio">Portfolio</Link> |{" "}
            <Link to="/plot">Plot</Link>
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
                      <MarginAccountManager />
                    ) : (
                      <Heading>Please connect your wallet</Heading>
                    )}
                  </Container>
                </>
              }
            />
            <Route
              path="/portfolio"
              element={
                <Container
                  mt="5"
                  pt="2"
                  px="4"
                  style={{ background: "var(--gray-a2)", minHeight: 500 }}
                >
                  <MarginAccountManager />
                </Container>
              }
            />
            <Route path="/plot" element={<Plot />} />
          </Routes>
        </Container>
      </>
    </Router>
  )
}

export default App
