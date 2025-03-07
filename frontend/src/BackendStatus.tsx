import { useEffect, useState } from "react"
import { Box, Text, Flex, Spinner } from "@radix-ui/themes"
import { BACKEND_BASE_URL } from "./networkConfig"

export function BackendStatus() {
  const [data, setData] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        setLoading(true)
        const response = await fetch(BACKEND_BASE_URL)

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const text = await response.text()
        setData(text)
        setError(null)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        )
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBackendData()
  }, [])

  return (
    <Box
      my="4"
      p="4"
      style={{ background: "var(--gray-a3)", borderRadius: "8px" }}
    >
      <Text size="2" weight="bold" mb="2">
        Backend Status:
      </Text>
      <Flex align="center" gap="2">
        {loading ? (
          <>
            <Spinner size="1" />
            <Text>Loading backend data...</Text>
          </>
        ) : error ? (
          <Text color="red">{`Error: ${error}`}</Text>
        ) : (
          <Text>{data}</Text>
        )}
      </Flex>
    </Box>
  )
}
