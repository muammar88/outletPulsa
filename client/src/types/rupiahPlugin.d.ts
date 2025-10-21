// src/types/rupiahPlugin.d.ts
declare module '@/plugins/rupiahPlugin' {
  const plugin: {
    install: (app: import('vue').App) => void
  }
  export default plugin
}
