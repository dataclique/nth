import { createEffect, onCleanup } from "solid-js"
import {
  CandlestickSeries,
  createChart,
  type IChartApi,
  type UTCTimestamp,
} from "lightweight-charts"
import type { Candle } from "../api"
import { FLOAT_SCALING } from "../scale"

export default function CandleChart(props: { candles: Candle[] | undefined }) {
  let container: HTMLDivElement | undefined
  let chart: IChartApi | undefined

  createEffect(() => {
    const candles = props.candles
    if (!container) return
    chart?.remove()
    chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { color: "#131722" },
        textColor: "#7a8399",
      },
      grid: {
        vertLines: { color: "#232838" },
        horzLines: { color: "#232838" },
      },
    })
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#2ebd85",
      downColor: "#f6465d",
      wickUpColor: "#2ebd85",
      wickDownColor: "#f6465d",
      borderVisible: false,
    })
    series.setData(
      (candles ?? []).map(candle => ({
        time: (candle.open_ms / 1000) as UTCTimestamp,
        open: candle.open / FLOAT_SCALING,
        high: candle.high / FLOAT_SCALING,
        low: candle.low / FLOAT_SCALING,
        close: candle.close / FLOAT_SCALING,
      })),
    )
    chart.timeScale().fitContent()
  })

  onCleanup(() => chart?.remove())

  return <div class="chart-container" ref={container} />
}
