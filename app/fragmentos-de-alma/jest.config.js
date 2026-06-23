/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // Alias @/* → src/* (espelha tsconfig.json paths)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Sistemas de jogo (src/systems/) e utilitários são lógica pura — testá-los
  // por arquivo *.test.ts colocado ao lado da implementação.
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
}
