/** Load DATABASE_URL dari .env project (shell env `file:` override diabaikan utk postgres). */
import { readFileSync } from 'fs'
const envText = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const m = envText.match(/^DATABASE_URL="?([^"\n]+)"?/m)
if (!m || !m[1].startsWith('postgres')) throw new Error('DATABASE_URL postgres tidak ditemukan di .env')
process.env.DATABASE_URL = m[1]
export const PG_URL = m[1]
