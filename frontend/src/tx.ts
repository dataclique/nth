// Map a platform CallSpec (backend/src/tx.rs) onto a programmable
// transaction block. The spec's `result` arguments reference earlier calls
// exactly like PTB result chaining, so the translation is 1:1; the API
// never signs — the connected wallet does.

import { Transaction, type TransactionResult } from "@mysten/sui/transactions"
import type { CallSpec, CallSpecArg } from "./api"

export function specToTransaction(spec: CallSpec): Transaction {
  const transaction = new Transaction()
  const results: TransactionResult[] = []

  for (const call of spec.calls) {
    const mapArg = (argument: CallSpecArg) => {
      switch (argument.kind) {
        case "object":
          return transaction.object(argument.object_id)
        case "clock":
          return transaction.object("0x6")
        case "result": {
          const result = results[argument.call]
          if (!result)
            throw new Error(`spec references missing call ${argument.call}`)
          return result
        }
        case "pure":
          switch (argument.value_type) {
            case "u64":
              return transaction.pure.u64(BigInt(argument.value))
            case "id":
            case "address":
              return transaction.pure.address(argument.value)
            case "bool":
              return transaction.pure.bool(argument.value === "true")
            default:
              throw new Error(`unsupported pure type ${argument.value_type}`)
          }
      }
    }
    const result = transaction.moveCall({
      target: `${call.package}::${call.module}::${call.function}`,
      typeArguments: call.type_arguments,
      arguments: call.arguments.map(mapArg),
    })
    results.push(result)
  }

  return transaction
}
