// Utilitários de aleatoriedade controlada
// Funções puras compartilhadas pelos sistemas de jogo (genes, fusão, etc.)

// Retorna um elemento aleatório de um array (uniforme).
export function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Retorna um inteiro aleatório no intervalo fechado [min, max].
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// RNG determinístico a partir de uma string seed.
// Usado para garantir que a mesma fusão produza sempre o mesmo resultado visual
// e o mesmo nome — ver doc 02 (Protocolo de Unicidade) e Passo 9.
export function makeSeededRng(seed: string): () => number {
  let h = 0
  for (const ch of seed) h = (Math.imul(31, h) + ch.charCodeAt(0)) | 0
  return (): number => {
    h = (Math.imul(1664525, h) + 1013904223) | 0
    return (h >>> 0) / 0x100000000
  }
}
