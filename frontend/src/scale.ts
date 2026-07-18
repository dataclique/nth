// On-chain quantities are fixed-point integers scaled by 10^6 (see
// docs/float_scaling.md). Branded types keep scaled values from mixing with
// display numbers; conversion happens here and nowhere else.

export const FLOAT_SCALING = 1_000_000

export type ScaledPrice = number & { readonly __brand: "ScaledPrice" }
export type ScaledSize = number & { readonly __brand: "ScaledSize" }
export type UsdcBaseUnits = number & { readonly __brand: "UsdcBaseUnits" }

export const scaledPrice = (raw: number): ScaledPrice => raw as ScaledPrice
export const scaledSize = (raw: number): ScaledSize => raw as ScaledSize
export const usdcBaseUnits = (raw: number): UsdcBaseUnits =>
  raw as UsdcBaseUnits

const display = (scaled: number, decimals: number): string =>
  (scaled / FLOAT_SCALING).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })

export const formatPrice = (price: ScaledPrice): string => display(price, 6)
export const formatSize = (size: ScaledSize): string => display(size, 6)
export const formatUsdc = (amount: UsdcBaseUnits): string =>
  `${display(amount, 2)} USDC`

/** Parse a user-entered decimal into a scaled integer, `null` on invalid. */
export const parseScaled = (text: string): number | null => {
  const value = Number(text)
  if (!Number.isFinite(value) || value < 0) return null
  return Math.round(value * FLOAT_SCALING)
}
