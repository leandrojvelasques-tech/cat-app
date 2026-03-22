// @ts-nocheck
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding Vientos de Tango Historic Podiums...")

  const podiums = [
    {
      year: 2007,
      categories: [
        {
          name: "TANGO ESCENARIO",
          results: [
            { place: 1, dancers: "Rodrigo Almonacid y Natalia Vicente" },
            { place: 2, dancers: "Nazareno Valverdi y Ángeles Galán" },
            { place: 3, dancers: "Hugo Valenzuela y María Dolores Morón" },
          ]
        },
        {
          name: "TANGO DE SALON",
          results: [
            { place: 1, dancers: "Elio Cantoni y Mariana Ocampo" },
            { place: 2, dancers: "Manuel Sotomayor y Analía Mazzola" },
            { place: 3, dancers: "Hugo Valenzuela y María Dolores Morón" },
          ]
        }
      ]
    },
    {
      year: 2008,
      categories: [
        {
          name: "TANGO ESCENARIO",
          results: [
            { place: 1, dancers: "César Aranda y Débora Salas" },
          ]
        },
        {
          name: "TANGO DE SALON",
          results: [
            { place: 1, dancers: "Elio Cantoni y Mariana Ocampo" },
            { place: 2, dancers: "Raúl Arraigada y María Luisa Abrigo" },
            { place: 3, dancers: "Manuel Sotomayor y Stella Maris Herrera" },
          ]
        },
        {
          name: "MILONGA",
          results: [
            { place: 1, dancers: "Raúl Arraigada y María Luisa Abrigo" },
            { place: 2, dancers: "Manuel Sotomayor y Stella Maris Herrera" },
            { place: 3, dancers: "Hugo Sandoval y Alejandra Zúñiga" },
          ]
        }
      ]
    },
    {
      year: 2009,
      categories: [
        {
          name: "TANGO ESCENARIO",
          results: [
            { place: 1, dancers: "Mariano Balois Pardo y M. Agustina Pardo" },
            { place: 2, dancers: "Pedro Olima y Darling Borquez" },
            { place: 3, dancers: "Rubén Iribarren y Mariana Ocampo" },
          ]
        },
        {
          name: "TANGO DE SALON",
          results: [
            { place: 1, dancers: "Facundo de la Cruz Gómez Palavecino y Paola Florencia Sanz" },
            { place: 2, dancers: "Manuel Sotomayor y Stella Maris Herrera" },
            { place: 3, dancers: "Julián Vilardo y Natalia Padilla" },
          ]
        },
        {
          name: "MILONGA",
          results: [
            { place: 1, dancers: "Manuel Sotomayor y Stella Maris Herrera" },
            { place: 2, dancers: "Facundo de la Cruz Gómez Palavecino y Paola Florencia Sanz" },
            { place: 3, dancers: "Julián Vilardo y Julieta Maldonado" },
          ]
        }
      ]
    },
    {
        year: 2010,
        categories: [
          {
            name: "TANGO ESCENARIO",
            results: [
              { place: 1, dancers: "Patricio Arratia y Sofía Drewwniak" },
              { place: 2, dancers: "Jorge Villagra y Daniela García" },
              { place: 3, dancers: "Pedro Olima y Darling Borquez" },
            ]
          },
          {
            name: "TANGO DE SALON",
            results: [
              { place: 1, dancers: "Héctor Tomás Acosta y Adriana Peral" },
              { place: 2, dancers: "Pedro Olima y Érica Quinteros" },
              { place: 3, dancers: "Hugo Sandoval y Valeska Kappes" },
            ]
          },
          {
            name: "MILONGA",
            results: [
              { place: 1, dancers: "Aníbal Millanao y Nadia Ibañez" },
              { place: 2, dancers: "Hugo Sandoval y Érica Quinteros" },
              { place: 2, dancers: "Jorge Darío Moya y Karina Gómez" }, // Empate
              { place: 3, dancers: "Manuel Sotomayor y Lorelei Hernández" },
            ]
          }
        ]
    },
    {
        year: 2011,
        categories: [
          {
            name: "TANGO ESCENARIO",
            results: [
              { place: 1, dancers: "Patricio Arratia y Agustina Pardo" },
              { place: 2, dancers: "Nazareno Valverdi y Silvina Mena" },
              { place: 3, dancers: "Pedro Olima y Marcela Andrada" },
            ]
          },
          {
            name: "TANGO DE SALON",
            results: [
              { place: 1, dancers: "Rubén Iribarren y Mariana Ocampo" },
              { place: 2, dancers: "Pablo Hughes y Natacha Ruppel" },
              { place: 3, dancers: "Víctor Zegarra y Ana María Esmith" },
            ]
          },
          {
            name: "MILONGA",
            results: [
              { place: 1, dancers: "Federico Riquelme y Julieta Maldonado" },
              { place: 2, dancers: "Manuel Sotomayor y Stella Maris Herrera" },
              { place: 3, dancers: "Pablo Hughes y Natacha Ruppel" },
            ]
          }
        ]
    },
    {
        year: 2012,
        categories: [
          {
            name: "TANGO SALON",
            results: [
              { place: 1, dancers: "Federico Riquelme y Mariana Nieva" },
              { place: 2, dancers: "Manuel Sotomayor y Stella Maris Herrera" },
              { place: 3, dancers: "Néstor Acosta y Paola Benavente" },
            ]
          },
          {
            name: "TANGO ESCENARIO",
            results: [
              { place: 1, dancers: "Nazareno Balverdi y Silvina Mena" },
              { place: 2, dancers: "Luis Argamonte y Natalia Couto" },
              { place: 3, dancers: "Cristian Mendoza y Marcela Andrada" },
            ]
          },
          {
            name: "MILONGA",
            results: [
              { place: 1, dancers: "Aníbal Millanao y Julieta Maldonado" },
              { place: 2, dancers: "Manuel Sotomayor y Stella Maris Herrera" },
              { place: 3, dancers: "Jorge Darío Moya y Karina Gómez" },
            ]
          }
        ]
    },
    {
        year: 2013,
        categories: [
          {
            name: "TANGO SALON",
            results: [
              { place: 1, dancers: "Matías Ferreira y Jessica Calfupan" },
              { place: 2, dancers: "Ezequiel Ruiz Ramírez y Andrea Arriagada" },
              { place: 3, dancers: "Iván Rost y Natalia Padilla" },
            ]
          },
          {
            name: "TANGO ESCENARIO",
            results: [
              { place: 1, dancers: "Nazareno Balverdi y Silvina Mena" },
              { place: 2, dancers: "Patricio Arratia y Agustina Pardo" },
              { place: 3, dancers: "Ezequiel Ávila y Marcela Andrada" },
            ]
          },
          {
            name: "MILONGA",
            results: [
              { place: 1, dancers: "Lucas Ramos y Julieta Maldonado" },
              { place: 2, dancers: "Raúl Ehijos y Ximena Santana" },
              { place: 2, dancers: "Matías Ferreira y Jessica Calfupan" },
              { place: 3, dancers: "Pablo Hughes y Natacha Ruppel" },
            ]
          }
        ]
    },
    {
        year: 2014,
        categories: [
          {
            name: "TANGO SALON",
            results: [
              { place: 1, dancers: "Julieta Maldonado y Pablo Hughes" },
              { place: 2, dancers: "Andrea Arriagada y Ezequiel Ruiz Ramírez" },
              { place: 3, dancers: "Paula Pelicón y Elías Abdala" },
            ]
          },
          {
            name: "TANGO ESCENARIO",
            results: [
              { place: 1, dancers: "Silvina Mena y Nazareno Balverdi" },
              { place: 2, dancers: "Paola Couto y Luis Argamonte" },
              { place: 3, dancers: "Natalia Padilla y Pedro Olima" },
            ]
          },
          {
            name: "MILONGA",
            results: [
              { place: 1, dancers: "Lourdes Carrizo y Lucas Ramos" },
              { place: 2, dancers: "Mariana Ocampo y Pablo Hughes" },
              { place: 3, dancers: "Deysi Aguilera y Matías Goyeneche" },
            ]
          },
          {
            name: "TANGO ESCENARIO JUVENIL",
            results: [
              { place: 1, dancers: "Gema Bareilles y Gastón Neira" },
              { place: 2, dancers: "Indira Hiayes y Andrés Zarzosa" },
              { place: 3, dancers: "María Eugenia Saavedra y Gonzalo Díaz" },
            ]
          }
        ]
    },
    {
        year: 2015,
        categories: [
          {
            name: "TANGO SALON",
            results: [
              { place: 1, dancers: "Natacha Ruppel y Pablo Hughes" },
              { place: 2, dancers: "Andrea Arriagada y Ezequiel Ruiz Ramírez" },
              { place: 3, dancers: "Jésica Calfupan y Mauricio Sepúlveda" },
            ]
          },
          {
            name: "TANGO ESCENARIO",
            results: [
              { place: 1, dancers: "Silvina Mena y Nazareno Valverdi" },
              { place: 2, dancers: "Tatiana y Antonio Carrizo" },
              { place: 3, dancers: "Vicky Ixisa y Ezequiel" },
            ]
          },
          {
            name: "MILONGA",
            results: [
              { place: 1, dancers: "Lourdes Carrizo y Lucas Ramos" },
              { place: 2, dancers: "Brenda Soto y Néstor Acosta" },
              { place: 3, dancers: "Jésica Calfupan y Mauricio Sepúlveda" },
            ]
          },
          {
            name: "VALS",
            results: [
              { place: 1, dancers: "Jésica Calfupan y Mauricio Sepúlveda" },
              { place: 2, dancers: "Lourdes Carrizo y Lucas Ramos" },
              { place: 3, dancers: "Camila Elly Meza y Leandro Velasques" },
            ]
          }
        ]
    },
    {
        year: 2016,
        categories: [
          {
            name: "TANGO SALON",
            results: [
              { place: 1, dancers: "Ximena Santana y Raúl Ehijo" },
              { place: 2, dancers: "Victoria Ixtassa y Lucas Ramos" },
              { place: 3, dancers: "Natacha Ruppel y Pablo Hughes" },
            ]
          },
          {
            name: "MILONGA",
            results: [
              { place: 1, dancers: "Victoria Ixtassa y Lucas Ramos" },
              { place: 2, dancers: "Natacha Ruppel y Pablo Hughes" },
              { place: 3, dancers: "Marta Espósito y Luis Bravo" },
            ]
          },
          {
            name: "VALS",
            results: [
              { place: 1, dancers: "Ximena Santana y Raúl Ehijo" },
              { place: 2, dancers: "Victoria Ixtassa y Lucas Ramos" },
              { place: 3, dancers: "Natacha Ruppel y Pablo Hughes" },
            ]
          }
        ]
    },
    {
        year: 2017,
        categories: [
          {
            name: "TANGO PISTA",
            results: [
              { place: 1, dancers: "Cynthia Palacios y Federico Carrizo" },
              { place: 2, dancers: "Victoria Itxassa y Lucas Fernando Ramos" },
              { place: 3, dancers: "Eliana Ibáñez y Matías Goyeneche" },
            ]
          },
          {
            name: "TANGO ESCENARIO",
            results: [
              { place: 1, dancers: "Cynthia Palacios y Federico Carrizo" },
              { place: 2, dancers: "María Victoria Pesci y Javier Roga" },
              { place: 3, dancers: "Silvina Mercedes Mena y Nazareno Valverdi" },
            ]
          },
          {
            name: "MILONGA",
            results: [
              { place: 1, dancers: "Victoria Itxassa y Lucas Fernando Ramos" },
              { place: 2, dancers: "Mariana Carolina Ocampo y Rubén Armando Iribarren" },
              { place: 3, dancers: "Marcela Andrada y Manuel Sotomayor" },
            ]
          },
          {
            name: "VALS",
            results: [
              { place: 1, dancers: "Victoria Itxassa y Lucas Fernando Ramos" },
              { place: 2, dancers: "Mariana Carolina Ocampo y Rubén Armando Iribarren" },
              { place: 3, dancers: "Marta Elena Espósito y Luis Eduardo Bravo" },
            ]
          }
        ]
    },
    {
        year: 2018,
        categories: [
          {
            name: "TANGO PISTA",
            results: [
              { place: 1, dancers: "Mariana Carolina Ocampo y Rubén Armando Iribarren" },
              { place: 2, dancers: "Marcela Andrada y Jheyson José Hurtado Abarca" },
              { place: 3, dancers: "Pamela Villegas y Elías Abdala" },
            ]
          },
          {
            name: "TANGO ESCENARIO",
            results: [
              { place: 1, dancers: "Tatiana Cherey y Agustín Carrasco" },
              { place: 2, dancers: "Bárbara Sánchez y Cristian Ledesma" },
              { place: 3, dancers: "Marcela Andrada y Ezequiel Rearte" },
            ]
          },
          {
            name: "MILONGA",
            results: [
              { place: 1, dancers: "Deysi Aguilera y Matías Goyeneche" },
              { place: 2, dancers: "Micaela Díaz y Aníbal Millanao" },
              { place: 3, dancers: "Marina Machado y Carlos Rivas" },
            ]
          },
          {
            name: "VALS",
            results: [
              { place: 1, dancers: "Deysi Aguilera y Matías Goyeneche" },
              { place: 2, dancers: "Mariana Carolina Ocampo y Rubén Armando Iribarren" },
              { place: 3, dancers: "Marcela Andrada y Jheyson José Hurtado Abarca" },
            ]
          }
        ]
    },
    {
        year: 2019,
        categories: [
          {
            name: "TANGO PISTA",
            results: [
              { place: 1, dancers: "Deysi Aguilera y Matías Goyeneche" },
              { place: 2, dancers: "Yanina Neme Villarroel y Carlos Rivas" },
              { place: 3, dancers: "Bárbara Sánchez y Cristian Ledesma" },
            ]
          },
          {
            name: "TANGO ESCENARIO",
            results: [
              { place: 1, dancers: "Carlos Monllor y Tamara Vargas" },
              { place: 2, dancers: "Tatiana Cherey y Agustín Carrasco" },
              { place: 3, dancers: "Irina Cristoff y Andrés Zarzosa" },
            ]
          },
          {
            name: "MILONGA",
            results: [
              { place: 1, dancers: "Rocío Ramírez y Lucas Ramos" },
              { place: 2, dancers: "Deysi Aguilera y Matías Goyeneche" },
              { place: 3, dancers: "Micela Díaz y Aníbal Millanao" },
            ]
          },
          {
            name: "VALS",
            results: [
              { place: 1, dancers: "Bárbara Sánchez y Cristian Ledesma" },
              { place: 2, dancers: "Deysi Aguilera y Matías Goyeneche" },
              { place: 3, dancers: "Rocío Ramírez y Lucas Ramos" },
            ]
          }
        ]
    }
  ]

  for (const p of podiums) {
    const champ = await prisma.championship.upsert({
      where: { year_name: { year: p.year, name: "Vientos de Tango" } },
      update: {},
      create: { year: p.year, name: "Vientos de Tango" }
    })

    for (const cat of p.categories) {
      for (const res of cat.results) {
        // Split dancers if they have "y"
        const dancers = res.dancers.split(" y ").map(d => d.trim())
        const mainDancer = dancers[0]
        const partnerName = dancers[1] || ""

        // Try to guess first/last name (very simple: first space)
        const nameParts = mainDancer.split(" ")
        const firstName = nameParts[0]
        const lastName = nameParts.slice(1).join(" ")

        await prisma.championshipResult.create({
          data: {
            championshipId: champ.id,
            category: cat.name,
            place: res.place,
            firstName: firstName,
            lastName: lastName || firstName,
            partnerName: partnerName
          }
        })
      }
    }
  }

  console.log("✅ Seeding finished.")
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
