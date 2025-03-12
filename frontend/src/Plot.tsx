import { CandlestickSeries, createChart, ColorType } from "lightweight-charts"
import { useEffect, useRef, useState } from "react"

export const ChartComponent = props => {
  const {
    data,
    colors: {
      backgroundColor = "white",
      lineColor = "#2962FF",
      textColor = "black",
      upColor = "#26a69a", // Green color for bullish candles
      downColor = "#ef5350", // Red color for bearish candles
      wickUpColor = "#26a69a", // Green color for bullish wicks
      wickDownColor = "#ef5350", // Red color for bearish wicks
      borderUpColor = "#26a69a", // Green color for bullish borders
      borderDownColor = "#ef5350", // Red color for bearish borders
    } = {},
  } = props

  const chartContainerRef = useRef()

  useEffect(() => {
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth })
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
    })
    chart.timeScale().fitContent()

    const newSeries = chart.addSeries(CandlestickSeries, {
      upColor,
      downColor,
      wickUpColor,
      wickDownColor,
      borderUpColor,
      borderDownColor,
    })

    // Set initial data
    newSeries.setData(data)

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      chart.remove()
    }
  }, [
    data,
    backgroundColor,
    textColor,
    upColor,
    downColor,
    wickUpColor,
    wickDownColor,
    borderUpColor,
    borderDownColor,
  ])

  return <div ref={chartContainerRef} />
}

export const CandleDataComponent = () => {
  const [data, setData] = useState([]) // State to store the fetched data
  const [realtimeUpdates, setRealtimeUpdates] = useState([]) // State to store real-time updates

  // Function to fetch data from the server
  const fetchData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/candles")
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      const result = await response.json() // Parse the response as JSON

      console.log(result)

      const newCandle = {
        time: result.time.split("T")[0],
        open: result.open,
        high: result.high,
        low: result.low,
        close: result.close,
      }

      setData(prevData => [...prevData, newCandle])
      setRealtimeUpdates(prevUpdates => [...prevUpdates, newCandle]) // Add to real-time updates
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  // Use useEffect to poll the server every 2 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 1000) // Fetch data every 2 seconds

    return () => clearInterval(interval) // Cleanup interval on component unmount
  }, [])

  // Simulate real-time updates
  useEffect(() => {
    const chart = createChart(document.createElement("div")) // Dummy chart for series
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    })

    const intervalID = setInterval(() => {
      if (realtimeUpdates.length > 0) {
        const update = realtimeUpdates[realtimeUpdates.length - 1] // Get the latest update
        series.update(update) // Update the chart with the latest data
      }
    }, 100)

    return () => {
      clearInterval(intervalID)
      chart.remove()
    }
  }, [realtimeUpdates])

  return (
    <div>
      <h1>Candle Data</h1>
      <ChartComponent data={data} />
    </div>
  )
}

export function App2(props) {
  return <CandleDataComponent {...props} />
}
