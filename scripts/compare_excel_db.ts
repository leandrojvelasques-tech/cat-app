import { PrismaClient } from '@prisma/client'
import * as openpyxl from 'fs'
import path from 'path'
import execSync from 'child_process'

const prisma = new PrismaClient()

async function compareExcelAndDb() {
  // Query all DB members
  const dbMembers = await prisma.member.findMany()
  console.log(`DB Members loaded: ${dbMembers.length}`)

  // Create helper lookup maps/sets for fast matching
  const dbNumbers = new Set(dbMembers.map(m => String(m.memberNumber).trim()))
  const dbEmails = new Set(dbMembers.map(m => m.email?.toLowerCase().trim()).filter(Boolean))
  
  // Normalize strings for fuzzy/name matching
  const normalize = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const dbNamesNormalized = dbMembers.map(m => ({
    id: m.id,
    number: m.memberNumber,
    nameStr: normalize(`${m.lastName} ${m.firstName}`),
    reverseNameStr: normalize(`${m.firstName} ${m.lastName}`),
    raw: m
  }))

  return { dbMembers, dbNumbers, dbEmails, dbNamesNormalized, normalize }
}

// We will run a python script to dump the excel data into JSON, then compare in TS or Python directly.
