import { getFeeHistory, getFeeAmountForPeriod } from "@/lib/fee-utils"

async function test() {
  const history = await getFeeHistory()
  console.log('=== TEST HISTORIAL DE CUOTAS ===')
  console.log('Historial configurado:', JSON.stringify(history, null, 2))

  console.log('\n--- PRUEBAS DE TARIFA REGULAR ---')
  console.log('Enero 2026:', getFeeAmountForPeriod(2026, 1, false, history)) // 6000
  console.log('Junio 2026:', getFeeAmountForPeriod(2026, 6, false, history)) // 6000
  console.log('Julio 2026:', getFeeAmountForPeriod(2026, 7, false, history)) // 7000
  console.log('Diciembre 2026:', getFeeAmountForPeriod(2026, 12, false, history)) // 7000

  console.log('\n--- PRUEBAS DE TARIFA PAREJA (50% DESCUENTO) ---')
  console.log('Enero 2026 (Pareja):', getFeeAmountForPeriod(2026, 1, true, history)) // 3000
  console.log('Junio 2026 (Pareja):', getFeeAmountForPeriod(2026, 6, true, history)) // 3000
  console.log('Julio 2026 (Pareja):', getFeeAmountForPeriod(2026, 7, true, history)) // 3500
  console.log('Diciembre 2026 (Pareja):', getFeeAmountForPeriod(2026, 12, true, history)) // 3500
}

test().catch(console.error)
