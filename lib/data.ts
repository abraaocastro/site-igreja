export const heroBanners = [
  {
    id: '1',
    title: 'Bem-vindo à Primeira Igreja Batista de Capim Grosso',
    subtitle: 'Uma comunidade de fé, amor e esperança. Venha fazer parte da nossa família!',
    imageUrl: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1920&q=80',
    link: '/quem-somos',
    buttonText: 'Conheça-nos',
  },
  {
    id: '2',
    title: 'Culto de Celebração',
    subtitle: 'Domingos às 9h e 19h. Venha adorar conosco!',
    imageUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1920&q=80',
    link: '/eventos',
    buttonText: 'Ver Programação',
  },
  {
    id: '3',
    title: 'Escola Bíblica Dominical',
    subtitle: 'Crescendo juntos no conhecimento da Palavra de Deus',
    imageUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1920&q=80',
    link: '/ministerios',
    buttonText: 'Saiba Mais',
  },
]

export const inlineBanners = [
  {
    id: '1',
    title: 'Campanha de Oração',
    subtitle: '21 dias de jejum e oração pela nossa cidade',
    imageUrl: 'https://images.unsplash.com/photo-1545987796-200677ee1011?w=800&q=80',
    link: '/eventos',
    buttonText: 'Participar',
  },
  {
    id: '2',
    title: 'Encontro de Jovens',
    subtitle: 'Sábados às 19h30 - Não fique de fora!',
    imageUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80',
    link: '/ministerios',
    buttonText: 'Saiba Mais',
  },
  {
    id: '3',
    title: 'Culto de Mulheres',
    subtitle: 'Primeira quarta-feira do mês às 19h',
    imageUrl: 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=800&q=80',
    link: '/ministerios',
    buttonText: 'Ver Detalhes',
  },
]

// Ministérios da PIBAC. `leaderInstagram` é opcional (null quando o líder
// não tem/não divulga o perfil). Nomes reais vieram do questionário v2.0.
export interface Ministerio {
  id: string
  name: string
  description: string
  imageUrl: string
  leader: string
  leaderInstagram: string | null
}

export const ministerios: Ministerio[] = [
  {
    id: '1',
    name: 'Louvor e Adoração',
    description: 'Ministério dedicado à adoração através da música, conduzindo a igreja na presença de Deus.',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
    leader: 'Lucas Barreto',
    leaderInstagram: 'https://www.instagram.com/lucasbarreto_0/',
  },
  {
    id: '2',
    name: 'Infantil',
    description: 'Cuidando e ensinando nossas crianças no caminho do Senhor com amor e dedicação.',
    imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80',
    leader: 'Luana',
    leaderInstagram: null,
  },
  {
    id: '3',
    name: 'Jovens',
    description: 'Conectando a juventude a Cristo através de comunhão, ensino e missões.',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
    leader: 'Carla Emanuele',
    leaderInstagram: 'https://www.instagram.com/carlalpcastro/',
  },
  {
    id: '4',
    name: 'Mulheres',
    description: 'Fortalecendo e capacitando mulheres para servir a Deus e à comunidade.',
    imageUrl: 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=600&q=80',
    leader: 'Sandra Barreto',
    leaderInstagram: null,
  },
  {
    id: '5',
    name: 'Homens',
    description: 'Edificando homens segundo o coração de Deus para liderar suas famílias.',
    imageUrl: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&q=80',
    leader: 'Welder e Vitor',
    leaderInstagram: null,
  },
  {
    id: '6',
    name: 'Missões',
    description: 'Levando o evangelho além fronteiras, alcançando vidas para Cristo.',
    imageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=80',
    leader: 'Dirleide Granja',
    leaderInstagram: null,
  },
]

export const eventos = [
  {
    id: '1',
    title: 'Culto de Domingo',
    description: 'Venha celebrar conosco a cada domingo. Adoração, Palavra e comunhão.',
    date: '2026-04-26',
    time: '09:00',
    location: 'Templo Principal',
    category: 'culto',
    imageUrl: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600&q=80',
  },
  {
    id: '2',
    title: 'Estudo Bíblico',
    description: 'Aprofunde-se na Palavra de Deus. Estudo expositivo do livro de Romanos.',
    date: '2026-04-22',
    time: '19:30',
    location: 'Salão de Estudos',
    category: 'estudo',
    imageUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&q=80',
  },
  {
    id: '3',
    title: 'Batismo',
    description: 'Celebração de batismo. Novos membros declarando publicamente sua fé.',
    date: '2026-05-03',
    time: '18:00',
    location: 'Templo Principal',
    category: 'batismo',
    imageUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&q=80',
  },
  {
    id: '4',
    title: 'Encontro de Casais',
    description: 'Fortalecendo casamentos através da Palavra e comunhão.',
    date: '2026-05-10',
    time: '19:00',
    location: 'Salão Social',
    category: 'encontro',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
  },
  {
    id: '5',
    title: 'Escola de Líderes',
    description: 'Capacitação para líderes de células e ministérios.',
    date: '2026-05-17',
    time: '14:00',
    location: 'Sala de Treinamento',
    category: 'escola',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80',
  },
  {
    id: '6',
    title: 'Conferência de Missões',
    description: 'Anual conferência missionária com palestrantes internacionais.',
    date: '2026-06-15',
    time: '19:00',
    location: 'Templo Principal',
    category: 'evento',
    imageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=80',
  },
]

export const planoLeitura = [
  { dia: 1, livro: 'Gênesis', capitulos: '1-3', tema: 'A Criação' },
  { dia: 2, livro: 'Gênesis', capitulos: '4-7', tema: 'Caim, Abel e Noé' },
  { dia: 3, livro: 'Gênesis', capitulos: '8-11', tema: 'O Dilúvio e a Torre de Babel' },
  { dia: 4, livro: 'Gênesis', capitulos: '12-15', tema: 'Chamado de Abraão' },
  { dia: 5, livro: 'Gênesis', capitulos: '16-19', tema: 'Abraão e Ló' },
  { dia: 6, livro: 'Gênesis', capitulos: '20-23', tema: 'Isaque e Sara' },
  { dia: 7, livro: 'Gênesis', capitulos: '24-27', tema: 'Isaque e Rebeca' },
  { dia: 8, livro: 'Gênesis', capitulos: '28-31', tema: 'Jacó' },
  { dia: 9, livro: 'Gênesis', capitulos: '32-35', tema: 'Jacó se torna Israel' },
  { dia: 10, livro: 'Gênesis', capitulos: '36-39', tema: 'José no Egito' },
  { dia: 11, livro: 'Gênesis', capitulos: '40-43', tema: 'José interpreta sonhos' },
  { dia: 12, livro: 'Gênesis', capitulos: '44-47', tema: 'José revela-se' },
  { dia: 13, livro: 'Gênesis', capitulos: '48-50', tema: 'Bênçãos de Jacó' },
  { dia: 14, livro: 'Êxodo', capitulos: '1-4', tema: 'Nascimento de Moisés' },
  { dia: 15, livro: 'Êxodo', capitulos: '5-8', tema: 'As Pragas' },
  { dia: 16, livro: 'Êxodo', capitulos: '9-12', tema: 'A Páscoa' },
  { dia: 17, livro: 'Êxodo', capitulos: '13-16', tema: 'Travessia do Mar Vermelho' },
  { dia: 18, livro: 'Êxodo', capitulos: '17-20', tema: 'Os Dez Mandamentos' },
  { dia: 19, livro: 'Êxodo', capitulos: '21-24', tema: 'Leis e Ordenanças' },
  { dia: 20, livro: 'Êxodo', capitulos: '25-28', tema: 'O Tabernáculo' },
  { dia: 21, livro: 'Êxodo', capitulos: '29-32', tema: 'O Bezerro de Ouro' },
  { dia: 22, livro: 'Êxodo', capitulos: '33-36', tema: 'Renovação da Aliança' },
  { dia: 23, livro: 'Êxodo', capitulos: '37-40', tema: 'Construção do Tabernáculo' },
  { dia: 24, livro: 'Salmos', capitulos: '1-8', tema: 'Louvor e Adoração' },
  { dia: 25, livro: 'Salmos', capitulos: '9-16', tema: 'Confiança em Deus' },
  { dia: 26, livro: 'Salmos', capitulos: '17-24', tema: 'O Bom Pastor' },
  { dia: 27, livro: 'Salmos', capitulos: '25-32', tema: 'Perdão e Restauração' },
  { dia: 28, livro: 'Salmos', capitulos: '33-40', tema: 'Esperança no Senhor' },
  { dia: 29, livro: 'Provérbios', capitulos: '1-5', tema: 'Sabedoria' },
  { dia: 30, livro: 'Provérbios', capitulos: '6-10', tema: 'Conselhos para a Vida' },
]

export const horariosCultos = [
  { dia: 'Domingo', horario: '09:00', tipo: 'Escola Bíblica Dominical' },
  { dia: 'Domingo', horario: '19:00', tipo: 'Culto de Celebração' },
  { dia: 'Quarta-feira', horario: '19:30', tipo: 'Culto de Oração e Estudo' },
  { dia: 'Sábado', horario: '19:30', tipo: 'Encontro de Jovens' },
]
