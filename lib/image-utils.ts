/**
 * image-utils — resize e compressão de imagens no client-side.
 *
 * Usa Canvas API pra redimensionar imagens antes do upload pro Supabase
 * Storage, economizando banda e armazenamento.
 *
 * Phase 11.2
 */

/**
 * Redimensiona e comprime uma imagem usando Canvas.
 *
 * @param file — File original do input
 * @param maxWidth — largura máxima em px (altura é proporcional)
 * @param quality — qualidade JPEG/WebP (0-1). Default: 0.82
 * @param format — formato de saída. Default: 'image/webp'
 * @returns File comprimido pronto pra upload
 */
export async function resizeAndCompress(
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.82,
  format: 'image/webp' | 'image/jpeg' = 'image/webp'
): Promise<File> {
  // Se o arquivo já é pequeno (<200KB) e ≤maxWidth, retorna como está
  if (file.size <= 200 * 1024) {
    return file
  }

  const bitmap = await createImageBitmap(file)
  const { width: origW, height: origH } = bitmap

  // Se já é menor que maxWidth, manter dimensões (só comprimir)
  let targetW = origW
  let targetH = origH

  if (origW > maxWidth) {
    const ratio = maxWidth / origW
    targetW = maxWidth
    targetH = Math.round(origH * ratio)
  }

  // Desenhar no canvas
  const canvas = new OffscreenCanvas(targetW, targetH)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    // Fallback: retorna original se OffscreenCanvas não tem contexto
    bitmap.close()
    return file
  }

  ctx.drawImage(bitmap, 0, 0, targetW, targetH)
  bitmap.close()

  // Converter pra blob
  const blob = await canvas.convertToBlob({ type: format, quality })

  // Se a compressão gerou algo maior que o original (raro), retorna original
  if (blob.size >= file.size) {
    return file
  }

  // Gerar novo nome com extensão correta
  const ext = format === 'image/webp' ? '.webp' : '.jpg'
  const baseName = file.name.replace(/\.[^.]+$/, '')
  const newName = `${baseName}${ext}`

  return new File([blob], newName, { type: format })
}

/**
 * Retorna as dimensões de uma imagem File sem renderizar no DOM.
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file)
  const { width, height } = bitmap
  bitmap.close()
  return { width, height }
}
