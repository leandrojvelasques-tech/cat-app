// Datos extraídos del Excel de cuotas 2026 y lista de precios del buffet

export interface MemberPayment {
  name: string        // APELLIDO NOMBRE como figura en el Excel
  memberNumber: string
  // Pagos por mes: [monto, fecha_pago_dd, fecha_pago_mm]
  // null = no pagó ese mes
  payments: {
    month: number // 1-7
    amount: number
    payDay: number
    payMonth: number
  }[]
}

export const MEMBER_PAYMENTS: MemberPayment[] = [
  { name: "ACOSTA NESTOR", memberNumber: "115", payments: [
    { month: 1, amount: 6000, payDay: 18, payMonth: 3 },
    { month: 2, amount: 6000, payDay: 18, payMonth: 3 },
    { month: 3, amount: 6000, payDay: 18, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 18, payMonth: 3 },
  ]},
  { name: "AGUERRI MAGALI CELESTE", memberNumber: "999", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 10, payMonth: 4 },
    { month: 3, amount: 6000, payDay: 10, payMonth: 4 },
    { month: 4, amount: 6000, payDay: 10, payMonth: 4 },
  ]},
  { name: "ALCARAZ VICTOR DAMIAN", memberNumber: "432", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 1, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 5, payMonth: 3 },
  ]},
  { name: "ANDRADA MARCELA", memberNumber: "302", payments: [
    { month: 1, amount: 6000, payDay: 24, payMonth: 2 },
    { month: 2, amount: 6000, payDay: 24, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 4, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 7, payMonth: 4 },
    { month: 5, amount: 6000, payDay: 8, payMonth: 5 },
  ]},
  { name: "BALDINI ALBERTO JAVIER", memberNumber: "338", payments: [
    { month: 1, amount: 6000, payDay: 6, payMonth: 3 },
    { month: 2, amount: 6000, payDay: 6, payMonth: 3 },
    { month: 3, amount: 3000, payDay: 6, payMonth: 3 },
    { month: 4, amount: 3000, payDay: 6, payMonth: 3 },
    { month: 5, amount: 3000, payDay: 6, payMonth: 3 },
  ]},
  { name: "BARRIA ISNELDA", memberNumber: "999", payments: [
    { month: 1, amount: 3000, payDay: 1, payMonth: 1 },
  ]},
  { name: "DAS NEVES GUERREIRO RICARDO", memberNumber: "480", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 1, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 4, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 6, payMonth: 4 },
  ]},
  { name: "DIAZ IRIBARNE LILIANA", memberNumber: "124", payments: [
    { month: 1, amount: 6000, payDay: 16, payMonth: 2 },
    { month: 2, amount: 6000, payDay: 16, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 16, payMonth: 2 },
    { month: 4, amount: 6000, payDay: 10, payMonth: 4 },
    { month: 5, amount: 6000, payDay: 10, payMonth: 4 },
    { month: 6, amount: 6000, payDay: 10, payMonth: 4 },
  ]},
  { name: "DIAZ MARGOT MARIA", memberNumber: "999", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
  ]},
  { name: "ELLY CAMILA", memberNumber: "408", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 1, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 5, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 10, payMonth: 4 },
    { month: 5, amount: 6000, payDay: 5, payMonth: 5 },
  ]},
  { name: "HERNANDEZ LORELEY", memberNumber: "167", payments: [
    { month: 1, amount: 6000, payDay: 8, payMonth: 3 },
    { month: 2, amount: 6000, payDay: 8, payMonth: 3 },
    { month: 3, amount: 6000, payDay: 8, payMonth: 3 },
  ]},
  { name: "HEROLD MARIA ELENA", memberNumber: "149", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 10, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 11, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 17, payMonth: 4 },
  ]},
  { name: "HERRERA ESTELA MARIS", memberNumber: "109", payments: [
    { month: 1, amount: 6000, payDay: 5, payMonth: 3 },
    { month: 2, amount: 6000, payDay: 5, payMonth: 3 },
    { month: 3, amount: 6000, payDay: 5, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 10, payMonth: 4 },
    { month: 5, amount: 6000, payDay: 9, payMonth: 5 },
  ]},
  { name: "LARROCA NORBERTO", memberNumber: "207", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 1, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 1, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 1, payMonth: 4 },
    { month: 5, amount: 4000, payDay: 1, payMonth: 5 },
    { month: 6, amount: 6000, payDay: 6, payMonth: 5 },
    { month: 7, amount: 4000, payDay: 6, payMonth: 5 },
  ]},
  { name: "LOPEZ MIGUEL ALFREDO", memberNumber: "999", payments: [
    { month: 1, amount: 5000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 7000, payDay: 9, payMonth: 2 },
  ]},
  { name: "LOPEZ SERGIO", memberNumber: "449", payments: [
    { month: 1, amount: 6000, payDay: 9, payMonth: 2 },
    { month: 2, amount: 6000, payDay: 9, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 9, payMonth: 2 },
    { month: 4, amount: 6000, payDay: 9, payMonth: 2 },
    { month: 5, amount: 6000, payDay: 9, payMonth: 2 },
    { month: 6, amount: 6000, payDay: 9, payMonth: 2 },
    { month: 7, amount: 6000, payDay: 9, payMonth: 2 },
  ]},
  { name: "LORENZO DIANA", memberNumber: "999", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 1, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 1, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 9, payMonth: 4 },
    { month: 5, amount: 6000, payDay: 9, payMonth: 4 },
    { month: 6, amount: 6000, payDay: 9, payMonth: 4 },
  ]},
  { name: "LUCERO HUMBERTO", memberNumber: "999", payments: [
    { month: 3, amount: 6000, payDay: 7, payMonth: 4 },
  ]},
  { name: "LUNA NORA", memberNumber: "508", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 11, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 6, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 11, payMonth: 4 },
  ]},
  { name: "MARINELLI LAURA", memberNumber: "999", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 16, payMonth: 3 },
    { month: 3, amount: 6000, payDay: 16, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 16, payMonth: 3 },
  ]},
  { name: "MATUS ALICIA", memberNumber: "205", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 1, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 3, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 10, payMonth: 4 },
    { month: 5, amount: 6000, payDay: 7, payMonth: 5 },
  ]},
  { name: "MAYORGA SANCHEZ ANGEL OSCAR", memberNumber: "227", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 1, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 8, payMonth: 3 },
  ]},
  { name: "MOLINA GRACIELA", memberNumber: "35", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
  ]},
  { name: "MORON MARIA DOLORES", memberNumber: "1", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 25, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 25, payMonth: 2 },
    { month: 4, amount: 6000, payDay: 25, payMonth: 2 },
  ]},
  { name: "NIEVA MARIA OFELIA", memberNumber: "999", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 7, payMonth: 3 },
    { month: 3, amount: 6000, payDay: 10, payMonth: 4 },
    { month: 5, amount: 6000, payDay: 7, payMonth: 5 },
  ]},
  { name: "OJEDA GLADYS", memberNumber: "999", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 8, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 7, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 5, payMonth: 4 },
  ]},
  { name: "ORTIZ YANINA PAOLA", memberNumber: "999", payments: [
    { month: 2, amount: 6000, payDay: 5, payMonth: 3 },
  ]},
  { name: "PORTA BEATRIZ", memberNumber: "329", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 1, payMonth: 2 },
  ]},
  { name: "QUINTEROS GERARDO", memberNumber: "999", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 3, amount: 6000, payDay: 4, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 6, payMonth: 4 },
    { month: 5, amount: 6000, payDay: 6, payMonth: 5 },
  ]},
  { name: "RIOS TANIA", memberNumber: "486", payments: [
    { month: 1, amount: 6000, payDay: 5, payMonth: 3 },
    { month: 2, amount: 6000, payDay: 5, payMonth: 3 },
    { month: 3, amount: 6000, payDay: 5, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 9, payMonth: 4 },
  ]},
  { name: "SANCHEZ PILAR", memberNumber: "373", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 1, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 8, payMonth: 3 },
  ]},
  { name: "SANTANDER FLAVIA", memberNumber: "999", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 8, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 6, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 9, payMonth: 4 },
  ]},
  { name: "SIERRA MELISA", memberNumber: "999", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
  ]},
  { name: "SOTOMAYOR MANUEL", memberNumber: "36", payments: [
    { month: 1, amount: 3000, payDay: 5, payMonth: 3 },
    { month: 2, amount: 3000, payDay: 5, payMonth: 3 },
    { month: 3, amount: 3000, payDay: 5, payMonth: 3 },
    { month: 4, amount: 3000, payDay: 10, payMonth: 4 },
    { month: 5, amount: 3000, payDay: 9, payMonth: 5 },
  ]},
  { name: "THOMAS KARINA ELIZABETH", memberNumber: "999", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 1, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 6, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 6, payMonth: 3 },
    { month: 5, amount: 6000, payDay: 6, payMonth: 3 },
  ]},
  { name: "TORRES OSCAR EDUARDO", memberNumber: "193", payments: [
    { month: 1, amount: 3000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 3000, payDay: 10, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 11, payMonth: 3 },
    { month: 4, amount: 3000, payDay: 17, payMonth: 4 },
  ]},
  { name: "URIBE JOSE RUPERTO", memberNumber: "999", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 2000, payDay: 1, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 3, payMonth: 3 },
  ]},
  { name: "VELASQUES LEANDRO", memberNumber: "164", payments: [
    { month: 1, amount: 6000, payDay: 12, payMonth: 3 },
    { month: 2, amount: 6000, payDay: 12, payMonth: 3 },
    { month: 3, amount: 6000, payDay: 12, payMonth: 3 },
  ]},
  { name: "VILLARROEL HEBE", memberNumber: "999", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 1, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 7, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 10, payMonth: 4 },
    { month: 5, amount: 6000, payDay: 8, payMonth: 5 },
  ]},
  { name: "ZEGARRA VICTOR MANUEL", memberNumber: "94", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 1, payMonth: 2 },
    { month: 3, amount: 6000, payDay: 4, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 7, payMonth: 4 },
  ]},
  { name: "ZENI MARIELA", memberNumber: "999", payments: [
    { month: 1, amount: 6000, payDay: 1, payMonth: 1 },
    { month: 2, amount: 6000, payDay: 1, payMonth: 2 },
    { month: 3, amount: 3000, payDay: 1, payMonth: 3 },
  ]},
  { name: "CHAPARRO JORGE ANTONIO", memberNumber: "999", payments: [
    { month: 3, amount: 6000, payDay: 5, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 10, payMonth: 4 },
  ]},
  { name: "D'ANGELO ANTONELLA", memberNumber: "999", payments: [
    { month: 3, amount: 3000, payDay: 5, payMonth: 3 },
    { month: 4, amount: 3000, payDay: 5, payMonth: 3 },
  ]},
  { name: "CEJAS MAIDANA FLORENCIA", memberNumber: "999", payments: [
    { month: 3, amount: 6000, payDay: 2, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 1, payMonth: 4 },
    { month: 5, amount: 6000, payDay: 1, payMonth: 5 },
  ]},
  { name: "VILLALOBOS GRACIELA", memberNumber: "999", payments: [
    { month: 1, amount: 6000, payDay: 6, payMonth: 3 },
    { month: 2, amount: 6000, payDay: 6, payMonth: 3 },
    { month: 3, amount: 6000, payDay: 6, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 10, payMonth: 4 },
    { month: 5, amount: 6000, payDay: 8, payMonth: 5 },
  ]},
  { name: "AYBAR ROBERTO", memberNumber: "999", payments: [
    { month: 3, amount: 6000, payDay: 17, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 8, payMonth: 4 },
  ]},
  { name: "ZURLIS MARIA ROSA", memberNumber: "999", payments: [
    { month: 1, amount: 6000, payDay: 24, payMonth: 3 },
    { month: 2, amount: 6000, payDay: 24, payMonth: 3 },
    { month: 3, amount: 6000, payDay: 24, payMonth: 3 },
    { month: 4, amount: 6000, payDay: 1, payMonth: 5 },
    { month: 5, amount: 6000, payDay: 1, payMonth: 5 },
  ]},
  { name: "TRONCOSO ANTONIO", memberNumber: "999", payments: [
    { month: 4, amount: 6000, payDay: 10, payMonth: 4 },
  ]},
  { name: "HERNANDEZ CARLA", memberNumber: "999", payments: [
    { month: 4, amount: 6000, payDay: 11, payMonth: 4 },
  ]},
]

export const BUFFET_PRODUCTS = [
  { name: "Agua", price: 2500, type: "BEBIDAS_SIN_ALCOHOL" },
  { name: "Saborizada", price: 3000, type: "BEBIDAS_SIN_ALCOHOL" },
  { name: "Gaseosa Lata", price: 3000, type: "BEBIDAS_SIN_ALCOHOL" },
  { name: "Vaso de Gaseosa", price: 3500, type: "BEBIDAS_SIN_ALCOHOL" },
  { name: "Café", price: 3000, type: "BEBIDAS_SIN_ALCOHOL" },
  { name: "Stella S/Alc", price: 4000, type: "BEBIDAS_SIN_ALCOHOL" },
  { name: "Cerveza Rubia", price: 4000, type: "BEBIDAS_CON_ALCOHOL" },
  { name: "Cerveza Negra", price: 4000, type: "BEBIDAS_CON_ALCOHOL" },
  { name: "Gin Tonic 500", price: 6000, type: "BEBIDAS_CON_ALCOHOL" },
  { name: "Gin Tonic 800", price: 8500, type: "BEBIDAS_CON_ALCOHOL" },
  { name: "Campari 500", price: 5000, type: "BEBIDAS_CON_ALCOHOL" },
  { name: "Campari 800", price: 8500, type: "BEBIDAS_CON_ALCOHOL" },
  { name: "Gancia 500", price: 4000, type: "BEBIDAS_CON_ALCOHOL" },
  { name: "Gancia 800", price: 5500, type: "BEBIDAS_CON_ALCOHOL" },
  { name: "Vino Blanco", price: 9000, type: "BEBIDAS_CON_ALCOHOL" },
  { name: "Vino Tinto", price: 9000, type: "BEBIDAS_CON_ALCOHOL" },
  { name: "Vino Tinto Premium", price: 14000, type: "BEBIDAS_CON_ALCOHOL" },
  { name: "Espumante", price: 25000, type: "BEBIDAS_CON_ALCOHOL" },
  { name: "Fernet 500", price: 5000, type: "BEBIDAS_CON_ALCOHOL" },
  { name: "Fernet 800", price: 8500, type: "BEBIDAS_CON_ALCOHOL" },
  { name: "Empanada x1", price: 2500, type: "COMIDA" },
  { name: "Empanada x6", price: 12000, type: "COMIDA" },
  { name: "Empanada x12", price: 24000, type: "COMIDA" },
  { name: "Lemon Pie", price: 4000, type: "COMIDA" },
]
