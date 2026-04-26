/**
 * AvisoBanner — testes de visibilidade, dispensa e persistência.
 *
 * O componente lê o aviso por padrão de `getChurch()`, mas todos esses
 * testes usam a prop `aviso={...}` pra controlar o estado e isolar do JSON.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AvisoBanner } from '@/components/aviso-banner'
import type { ChurchAviso } from '@/lib/site-data'

const baseAviso: ChurchAviso = {
  ativo: true,
  severidade: 'info',
  mensagem: 'Culto especial neste sábado às 19h.',
  link: null,
  linkTexto: null,
}

beforeEach(() => {
  window.sessionStorage.clear()
  window.localStorage.clear()
})

describe('AvisoBanner', () => {
  it('não renderiza quando aviso.ativo é false', () => {
    render(<AvisoBanner aviso={{ ...baseAviso, ativo: false }} />)
    expect(screen.queryByTestId('aviso-banner')).not.toBeInTheDocument()
  })

  it('não renderiza quando a mensagem está vazia', () => {
    render(<AvisoBanner aviso={{ ...baseAviso, mensagem: '   ' }} />)
    expect(screen.queryByTestId('aviso-banner')).not.toBeInTheDocument()
  })

  it('renderiza a mensagem quando ativo + mensagem presente', () => {
    render(<AvisoBanner aviso={baseAviso} />)
    expect(screen.getByTestId('aviso-banner')).toBeInTheDocument()
    expect(screen.getByTestId('aviso-message')).toHaveTextContent(
      'Culto especial neste sábado às 19h.'
    )
  })

  it('aplica data-severity="info" pra severidade info', () => {
    render(<AvisoBanner aviso={baseAviso} />)
    expect(screen.getByTestId('aviso-banner')).toHaveAttribute('data-severity', 'info')
  })

  it('aplica data-severity="atencao" e o atributo aria-live=polite', () => {
    render(<AvisoBanner aviso={{ ...baseAviso, severidade: 'atencao' }} />)
    const banner = screen.getByTestId('aviso-banner')
    expect(banner).toHaveAttribute('data-severity', 'atencao')
    expect(banner).toHaveAttribute('aria-live', 'polite')
  })

  it('aplica aria-live=assertive quando severidade é urgente', () => {
    render(<AvisoBanner aviso={{ ...baseAviso, severidade: 'urgente' }} />)
    expect(screen.getByTestId('aviso-banner')).toHaveAttribute('aria-live', 'assertive')
  })

  it('renderiza link com texto customizado quando presentes', () => {
    render(
      <AvisoBanner
        aviso={{
          ...baseAviso,
          link: '/eventos',
          linkTexto: 'Ver agenda',
        }}
      />
    )
    const link = screen.getByTestId('aviso-link') as HTMLAnchorElement
    expect(link).toHaveAttribute('href', '/eventos')
    expect(link).toHaveTextContent('Ver agenda')
  })

  it('não passa target=_blank em links internos', () => {
    render(
      <AvisoBanner
        aviso={{ ...baseAviso, link: '/eventos', linkTexto: 'Eventos' }}
      />
    )
    expect(screen.getByTestId('aviso-link')).not.toHaveAttribute('target')
  })

  it('passa target=_blank em links externos (http*)', () => {
    render(
      <AvisoBanner
        aviso={{
          ...baseAviso,
          link: 'https://exemplo.com',
          linkTexto: 'Externo',
        }}
      />
    )
    const link = screen.getByTestId('aviso-link')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
  })

  it('clicar em fechar dispensa o banner e persiste em sessionStorage', () => {
    render(<AvisoBanner aviso={baseAviso} />)
    expect(screen.getByTestId('aviso-banner')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('aviso-dismiss'))

    expect(screen.queryByTestId('aviso-banner')).not.toBeInTheDocument()
    // Existe pelo menos uma chave de dispensa em sessionStorage
    const keys = Object.keys(window.sessionStorage)
    expect(keys.some((k) => k.startsWith('pibac-aviso-dismissed:'))).toBe(true)
  })

  it('mensagem diferente gera chave de dispensa diferente (banner reaparece)', () => {
    const { rerender } = render(<AvisoBanner aviso={baseAviso} />)
    fireEvent.click(screen.getByTestId('aviso-dismiss'))
    expect(screen.queryByTestId('aviso-banner')).not.toBeInTheDocument()

    // Admin troca a mensagem — banner deve reaparecer mesmo na mesma sessão
    rerender(
      <AvisoBanner aviso={{ ...baseAviso, mensagem: 'Mensagem totalmente nova.' }} />
    )
    expect(screen.getByTestId('aviso-banner')).toBeInTheDocument()
    expect(screen.getByTestId('aviso-message')).toHaveTextContent(
      'Mensagem totalmente nova.'
    )
  })

  it('forceOpen ignora dispensa e esconde o botão de fechar (preview)', () => {
    // Pre-dispensa em sessionStorage usando hash da mensagem
    render(<AvisoBanner aviso={baseAviso} forceOpen />)
    expect(screen.getByTestId('aviso-banner')).toBeInTheDocument()
    expect(screen.queryByTestId('aviso-dismiss')).not.toBeInTheDocument()
  })
})
