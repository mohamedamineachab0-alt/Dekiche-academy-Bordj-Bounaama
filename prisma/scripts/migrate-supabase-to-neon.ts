import { Client } from 'pg'

const SUPABASE_URL = 'postgresql://postgres.nkrfzuabvnnnzzrovvng:05623880852006@aws-0-eu-west-1.pooler.supabase.com:6543/postgres'
const NEON_URL = 'postgresql://neondb_owner:npg_sKIZfr5jVN0i@ep-bitter-cherry-b5q85yfk.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require'

// Strict topological order (Parents first, children next)
const TABLES = [
  'User',
  'Month',
  'StudyStage',
  'StudyLevel',
  'Schedule',
  'Teacher',
  'StudentProfile',
  'ParentProfile',
  'ParentStudentLink',
  'StudentFriendLink',
  'Subject',
  'Group',
  'Lesson',
  '_LessonSubjects',
  'LessonMaterial',
  'DailyExercise',
  'ExerciseMaterial',
  'Exam',
  'ExamMaterial',
  'StudentSubmission',
  'Quiz',
  'QuizCompletion',
  'StudentMistake',
  'AccessCode',
  'Enrollment',
  'LiveClass',
  'ChatSession',
  'ChatMessage',
  'Notification',
  'ReviewCard',
  'ClassForum',
  'ForumMessage',
  'ParentTicket',
  'TeacherTicket',
  'File',
  'AdminAiInsight',
  'PlatformSetting',
  'Banner',
  'pending_lessons'
]

async function migrate() {
  console.log('🚀 Starting migration from Supabase to Neon...')
  const supa = new Client({ connectionString: SUPABASE_URL, ssl: { rejectUnauthorized: false } })
  const neon = new Client({ connectionString: NEON_URL, ssl: { rejectUnauthorized: false } })

  await supa.connect()
  await neon.connect()
  console.log('✅ Connected to both Supabase and Neon databases.')

  // Truncate tables on Neon in reverse order
  console.log('🧹 Cleaning existing tables in Neon (reverse dependency order)...')
  for (const t of TABLES.slice().reverse()) {
    try {
      await neon.query(`TRUNCATE TABLE "${t}" CASCADE;`)
    } catch {}
  }

  for (const tableName of TABLES) {
    try {
      // Check if table exists on Neon
      const neonCheck = await neon.query(`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
      `, [tableName])

      if (neonCheck.rows.length === 0) {
        console.log(`⚠️  Table "${tableName}" does not exist in Neon. Skipping.`)
        continue
      }

      // Check if table exists on Supabase
      const supaCheck = await supa.query(`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
      `, [tableName])

      if (supaCheck.rows.length === 0) {
        console.log(`ℹ️  Table "${tableName}" does not exist in Supabase. Skipping.`)
        continue
      }

      const neonCols = new Set(neonCheck.rows.map(r => r.column_name))
      const jsonCols = new Set(neonCheck.rows.filter(r => r.data_type === 'json' || r.data_type === 'jsonb').map(r => r.column_name))
      const commonCols = supaCheck.rows.map(r => r.column_name).filter(c => neonCols.has(c))

      if (commonCols.length === 0) {
        console.log(`⚠️  No common columns for table "${tableName}". Skipping.`)
        continue
      }

      // Get count in Supabase
      const countRes = await supa.query(`SELECT count(*) FROM "${tableName}"`)
      const totalRows = parseInt(countRes.rows[0].count, 10)
      console.log(`\n📦 Migrating "${tableName}" (${totalRows} rows)...`)

      if (totalRows === 0) {
        console.log(`   (0 rows, skipping)`)
        continue
      }

      const quotedCols = commonCols.map(c => `"${c}"`).join(', ')
      const selectQuery = `SELECT ${quotedCols} FROM "${tableName}"`

      const BATCH_SIZE = 500
      let offset = 0
      let inserted = 0
      let skipped = 0

      while (offset < totalRows) {
        const batchRes = await supa.query(`${selectQuery} LIMIT ${BATCH_SIZE} OFFSET ${offset}`)
        if (batchRes.rows.length === 0) break

        const rows = batchRes.rows
        const valuePlaceholders: string[] = []
        const params: any[] = []
        let pIndex = 1

        for (const row of rows) {
          const rowPlaceholders: string[] = []
          for (const col of commonCols) {
            rowPlaceholders.push(`$${pIndex++}`)
            let val = row[col]
            if (jsonCols.has(col) && val !== null && val !== undefined) {
              if (typeof val === 'object') {
                val = JSON.stringify(val)
              }
            }
            params.push(val)
          }
          valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`)
        }

        const insertQuery = `
          INSERT INTO "${tableName}" (${quotedCols})
          VALUES ${valuePlaceholders.join(', ')}
        `

        try {
          await neon.query(insertQuery, params)
          inserted += rows.length
        } catch (batchErr: any) {
          // Fallback to row-by-row on batch failure (e.g. FK violation on a single orphan row)
          for (const row of rows) {
            const singleParams: any[] = []
            const singlePlaceholders: string[] = []
            let sIndex = 1
            for (const col of commonCols) {
              singlePlaceholders.push(`$${sIndex++}`)
              let val = row[col]
              if (jsonCols.has(col) && val !== null && val !== undefined) {
                if (typeof val === 'object') {
                  val = JSON.stringify(val)
                }
              }
              singleParams.push(val)
            }
            try {
              await neon.query(`INSERT INTO "${tableName}" (${quotedCols}) VALUES (${singlePlaceholders.join(', ')})`, singleParams)
              inserted++
            } catch (rowErr: any) {
              skipped++
              // console.warn(`   ⚠️ Row skipped in "${tableName}":`, rowErr.message)
            }
          }
        }

        offset += BATCH_SIZE
        process.stdout.write(`   Progress: ${inserted}/${totalRows} rows (${Math.round((inserted / totalRows) * 100)}%)\r`)
      }

      console.log(`\n   ✅ Finished "${tableName}": ${inserted} inserted, ${skipped} skipped.`)
    } catch (err: any) {
      console.error(`❌ Error migrating "${tableName}":`, err.message)
    }
  }

  console.log('\n=============================================')
  console.log('🎉 Migration Completed! Verifying counts...')
  console.log('=============================================')

  for (const tableName of TABLES) {
    try {
      const n = await neon.query(`SELECT count(*) FROM "${tableName}"`)
      console.log(`Table: ${tableName.padEnd(25)} | Neon count: ${n.rows[0].count}`)
    } catch {}
  }

  await supa.end()
  await neon.end()
  console.log('\n✅ All database connections closed successfully.')
}

migrate().catch(e => {
  console.error('Migration failed:', e)
  process.exit(1)
})
