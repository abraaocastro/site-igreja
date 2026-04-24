/**
 * bootstrap-admin.ts — cria o primeiro admin do site PIBAC.
 *
 * Rode UMA vez, logo depois de aplicar a migration 001. Cria um usuário
 * admin com senha temporária e a flag `must_change_password: true`, de
 * modo que no primeiro login ele é forçado a escolher uma senha forte.
 *
 * Pré-requisitos em .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
 *
 * Uso:
 *   npx tsx scripts/bootstrap-admin.ts
 *
 * Opcional — override via flags ou env:
 *   ADMIN_EMAIL=foo@bar.com ADMIN_PASSWORD=... npx tsx scripts/bootstrap-admin.ts
 *
 * Idempotente: se o e-mail já existe, promove pra admin + reaplica a flag.
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// dotenv/config carrega .env por padrão; .env.local é o que a gente usa,
// então tentamos ler manualmente se .env não tem tudo.
try {
  const envLocal = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
  for (const line of envLocal.split('\n')) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (match && !process.env[match[1]]) {
      // Remove aspas envolventes se existirem
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
    }
  }
} catch {
  // .env.local não existe — tudo bem, pode estar no env do shell
}

const DEFAULT_ADMIN_EMAIL = 'dammabelmont@gmail.com'
const DEFAULT_ADMIN_NAME = 'Administrador PIBAC'

function generateTempPassword(): string {
  // Senha temporária previsível-o-suficiente-pra-digitar, mas respeitando
  // os requisitos do checklist (12+ caracteres, mistura de tudo). Como o
  // usuário é obrigado a trocar no primeiro login, não importa que seja
  // "fraca" em termos zxcvbn — importa que ele consiga digitar sem erro.
  const adjectives = ['Azul', 'Verde', 'Forte', 'Alegre', 'Calmo']
  const nouns = ['Sol', 'Rio', 'Mar', 'Leao', 'Raio']
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(10 + Math.random() * 90)
  return `${adj}-${noun}-${num}!temp`
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ausente em .env.local')
    process.exit(1)
  }
  if (!serviceKey) {
    console.error(
      '❌ SUPABASE_SERVICE_ROLE_KEY ausente em .env.local\n' +
        '   Pegue em: Supabase Dashboard → Settings → API → service_role\n' +
        '   ⚠ Nunca commite essa chave. Ela fica no server apenas.'
    )
    process.exit(1)
  }

  const email = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase()
  const name = process.env.ADMIN_NAME || DEFAULT_ADMIN_NAME
  const password = process.env.ADMIN_PASSWORD || generateTempPassword()
  const passwordWasGenerated = !process.env.ADMIN_PASSWORD

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log('🔧 Bootstrap admin PIBAC')
  console.log(`   email: ${email}`)
  console.log(`   nome:  ${name}`)
  console.log('')

  // 1. Tentar listar usuários e achar se esse email já existe
  const { data: existing, error: listErr } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })
  if (listErr) {
    console.error('❌ Erro ao listar usuários:', listErr.message)
    console.error('   Verifique se a migration 001 foi aplicada e a service_role key é válida.')
    process.exit(1)
  }

  const found = existing.users.find((u) => u.email?.toLowerCase() === email)

  let userId: string

  if (found) {
    console.log('ℹ Usuário já existe. Reforçando role=admin + must_change_password.')
    userId = found.id

    // Atualizar metadata pra garantir a flag
    const { error: updErr } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...found.user_metadata,
        nome: name,
        must_change_password: true,
      },
    })
    if (updErr) {
      console.error('❌ Erro ao atualizar metadata:', updErr.message)
      process.exit(1)
    }
  } else {
    console.log('🆕 Criando novo usuário admin…')
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // dispensa confirmação de e-mail
      user_metadata: {
        nome: name,
        must_change_password: true,
      },
    })
    if (createErr || !created.user) {
      console.error('❌ Erro ao criar usuário:', createErr?.message)
      process.exit(1)
    }
    userId = created.user.id
  }

  // 2. Garantir que o profile tenha role=admin (trigger criou com default
  //    'conteudista'; precisamos promover).
  const { error: roleErr } = await supabase
    .from('profiles')
    .update({ role: 'admin', nome: name })
    .eq('id', userId)
  if (roleErr) {
    console.error('❌ Erro ao atualizar role no profile:', roleErr.message)
    console.error('   A tabela profiles existe? Rode supabase/migrations/001_profiles_and_roles.sql')
    process.exit(1)
  }

  console.log('')
  console.log('✅ Admin pronto!')
  console.log('')
  console.log('  ┌─────────────────────────────────────────────────────┐')
  console.log(`  │ email:             ${email.padEnd(32)} │`)
  if (passwordWasGenerated && !found) {
    console.log(`  │ senha temporária:  ${password.padEnd(32)} │`)
  } else if (!found) {
    console.log(`  │ senha temporária:  (definida via ADMIN_PASSWORD)   │`)
  } else {
    console.log('  │ senha:             (mantida — usuário já existia)  │')
  }
  console.log('  └─────────────────────────────────────────────────────┘')
  console.log('')
  console.log('Próximos passos:')
  console.log('  1. npm run dev')
  console.log('  2. Abra http://localhost:3000/login')
  console.log('  3. Entre com o e-mail acima e a senha temporária')
  console.log('  4. Você será redirecionado para /admin/primeiro-acesso')
  console.log('  5. Escolha uma senha forte (gerador disponível na tela)')
  console.log('')
}

main().catch((err) => {
  console.error('❌ Falha inesperada:', err)
  process.exit(1)
})
