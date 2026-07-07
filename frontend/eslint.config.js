import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // eslint-plugin-react-hooks 7.x (necessário para suportar eslint 10) trouxe essa
      // regra nova do conjunto do React Compiler, que passou a sinalizar como erro o
      // padrão "fetch dentro de useEffect no mount" usado em praticamente todos os
      // hooks de dados do projeto (useCustomer, useTransactions, useStats, etc.).
      // É um padrão React válido e comum, não um bug — mas migrar todos os hooks pra
      // longe desse padrão é um refactor de arquitetura à parte, fora do escopo de
      // uma atualização de dependências. Rebaixado pra warning até decidirmos abordar.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])
