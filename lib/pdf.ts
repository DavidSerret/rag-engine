// pdf-parse ships CJS only; serverExternalPackages handles runtime, require handles TS types
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>

export async function extractAndClean(buffer: Buffer): Promise<string> {
  const { text } = await pdfParse(buffer)

  return text
    .replace(/-\n/g, '')           // guiones de fin de línea: re-une palabras
    .replace(/([^\n])\n([^\n])/g, '$1 $2')  // salto dentro de párrafo → espacio
    .replace(/[ \t]+/g, ' ')       // espacios/tabs múltiples → uno
    .replace(/\n{3,}/g, '\n\n')    // más de dos líneas vacías → dos
    .trim()
}
