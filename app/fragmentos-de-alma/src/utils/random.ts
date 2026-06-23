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
