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

    chart.timeScale().applyOptions({
      timeVisible: true, // Enables hours and minutes on the x-axis
      secondsVisible: false, // Optional: hides seconds if not needed
    })

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

      const newCandle = {
        time: Math.floor(new Date(result.time).getTime() / 1000),
        open: result.open,
        high: result.high,
        low: result.low,
        close: result.close,
      }

      console.log(newCandle)
      console.log(result.symbol)

      // Check if the candle already exists in the data
      const isDuplicate = data.some(candle => candle.time === newCandle.time)
      if (!isDuplicate) {
        setData(prevData => {
          const newData = [...prevData, newCandle].sort(
            (a, b) => a.time - b.time,
          )
          return newData
        })
        setRealtimeUpdates(prevUpdates => [...prevUpdates, newCandle])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  // Use useEffect to poll the server every 2 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 1000) // Fetch data every 2 seconds

    return () => clearInterval(interval) // Cleanup interval on component unmount
  }, [data]) // Add data as a dependency to avoid stale state

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
