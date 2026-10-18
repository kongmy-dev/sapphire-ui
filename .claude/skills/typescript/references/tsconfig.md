# tsconfig

One `tsconfig.base.json` at the root, extended by every config. `typecheck` runs
`tsc -b` over all of them, so every tracked `.ts` and `.tsx` file is checked.

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "Preserve",
    "moduleResolution": "bundler",
    "moduleDetection": "force",
    "types": ["bun"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "noEmit": true
  }
}
```

The package build overrides `noEmit` and sets `declaration` in its own config;
nothing else overrides a strictness flag.

| Flag | Why |
|---|---|
| `strict` | Default in TypeScript 6; stated so the file reads the same everywhere. |
| `noUncheckedIndexedAccess` | `arr[0]` and `record[key]` are `T \| undefined`. Handle the `undefined`; never `!`. |
| `exactOptionalPropertyTypes` | `{ a?: string }` stops accepting `{ a: undefined }`, so "absent" and "cleared" stay distinct. A public prop narrowed by it goes to the owner first. |
| `noImplicitOverride` | A custom element's `connectedCallback` says `override`, so a renamed base method breaks the build. |
| `noFallthroughCasesInSwitch` | A missing `return` or `break` is an error. |
| `verbatimModuleSyntax` | Type-only imports say `import type`; what you write is what is emitted. |
| `erasableSyntaxOnly` | Bans `enum`, value namespaces and parameter properties: the compiler behind P-7. |
| `isolatedModules`, `moduleDetection: "force"` | Every file compiles on its own, as Bun and Vite compile it. |
| `module: "Preserve"`, `moduleResolution: "bundler"` | The bundler resolves; `tsc` checks. |
| `types: ["bun"]` | TypeScript 6 defaults `types` to `[]`; without it `bun:test` stops resolving. |
| `skipLibCheck` | Third-party `.d.ts` errors aren't ours to fix. |

Unused locals and parameters are Biome's job (`noUnusedVariables`,
`noUnusedImports`, `noUnusedFunctionParameters`): it reports and fixes them in
the same pass as everything else.

Options TypeScript 6 deprecates (`target: ES5`, `outFile`, `module: UMD`) are
not used and not silenced with `ignoreDeprecations`.
