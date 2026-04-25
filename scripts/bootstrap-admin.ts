/**
 * bootstrap-admin.ts — cria/redefine o admin padrão do site PIBAC.
 *
 * Rode logo depois de aplicar a migration 001. Cria (ou recria) um usuário
 * admin com a senha PADRÃO e a flag `must_change_password: true`, de modo
 * que no primeiro login ele é forçado a escolher uma senha forte.
 *
 * 🔑 LOGIN PADRÃO:
 *   email: dammabelmont@gmail.com
 *   senha: PibacAdmin@2026
 *
 * Pré-requisitos em .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
 *
 * Uso:
 *   npm run bootstrap:admin
 *   # ou
 *   npx tsx scripts/bootstrap-admin.ts
 *
 * Opcional — override via env:
 *   ADMIN_EMAIL=foo@bar.com ADMIN_PASSWORD=... npm run bootstrap:admin
 *
 * Idempotente: se o e-mail já existe, RESETA a senha pra padrão + promove
 * pra admin + reaplica a flag must_change_password.
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// dotenv/config carrega .env por padrão; .env.local é o que a gente usa,
// então tentamos ler manualmente se .env não tem tudo.
try {
  const envLocal = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
  // \r/\n: arquivos salvos no Windows costumam vir com CRLF. O regex `(.*)$`
  // não capta o `\r` final (`.` não casa com line terminators no JS), então
  // tiramos o `\r` antes de processar.
  for (const rawLine of envLocal.split('\n')) {
    const line = rawLine.replace(/\r$/, '')
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
// Senha padrão FIXA para o primeiro acesso. Atende ao checklist (12+ chars,
// upper, lower, número, símbolo) e é fácil de digitar. Como o usuário é
// FORÇADO a trocar no primeiro login (must_change_password=true), o fato
// dela ser conhecida não é problema — ela vive ~30 segundos por conta.
// Override possível via env: ADMIN_PASSWORD=...
const DEFAULT_ADMIN_PASSWORD = 'PibacAdmin@2026'

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
  const password = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD
  const usingDefaultPassword = !process.env.ADMIN_PASSWORD

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
    console.log('ℹ Usuário já existe. Resetando senha pra padrão + role=admin + must_change_password.')
    userId = found.id

    // Atualizar metadata + senha. Como rodar o bootstrap é uma operação
    // explícita ("me devolve o login padrão"), faz sentido resetar a senha
    // mesmo que o usuário já exista — caso contrário a "senha padrão"
    // exibida no console não seria realmente válida.
    const { error: updErr } = await supabase.auth.admin.updateUserById(userId, {
      password,
      user_metadata: {
        ...found.user_metadata,
        nome: name,
        must_change_password: true,
      },
    })
    if (updErr) {
      console.error('❌ Erro ao atualizar usuário:', updErr.message)
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

  // 2. Garantir que o profile exista E tenha role=admin.
  //    Usamos upsert (em vez de update) porque o usuário pode ter sido
  //    criado ANTES da trigger handle_new_user existir (caso típico:
  //    bootstrap rodou, falhou no update, depois aplicou-se a migration).
  //    Nesse cenário não existe linha em profiles pra esse id e o update
  //    silenciosamente afetaria 0 linhas.
  const { error: roleErr } = await supabase
    .from('profiles')
    .upsert(
      { id: userId, email, nome: name, role: 'admin' },
      { onConflict: 'id' }
    )
  if (roleErr) {
    console.error('❌ Erro ao gravar profile:', roleErr.message)
    console.error('   A tabela profiles existe? Rode supabase/migrations/001_profiles_and_roles.sql')
    process.exit(1)
  }

  console.log('')
  console.log('✅ Admin pronto!')
  console.log('')
  console.log('  ┌─────────────────────────────────────────────────────┐')
  console.log(`  │ email:             ${email.padEnd(32)} │`)
  if (usingDefaultPassword) {
    console.log(`  │ senha padrão:      ${password.padEnd(32)} │`)
  } else {
    console.log(`  │ senha:             (definida via ADMIN_PASSWORD)   │`)
  }
  console.log('  └─────────────────────────────────────────────────────┘')
  console.log('')
  console.log('Próximos passos:')
  console.log('  1. npm run dev')
  console.log('  2. Abra http://localhost:3000/login')
  console.log('  3. Entre com o e-mail e a senha acima')
  console.log('  4. Você será redirecionado para /admin/primeiro-acesso')
  console.log('  5. Escolha uma senha forte (gerador disponível na tela)')
  console.log('')
  console.log('💡 Esqueceu a senha depois de trocar? Rode esse script de novo')
  console.log('   pra resetar pra senha padrão e cair no primeiro-acesso.')
  console.log('')
}

main().catch((err) => {
  console.error('❌ Falha inesperada:', err)
  process.exit(1)
})
