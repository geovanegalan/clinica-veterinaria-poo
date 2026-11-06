// Códigos ANSI adaptados da paleta Cores.ts para a interface do terminal.
const RESET = "\x1b[0m";
const NEGRITO = "\x1b[1m";
const CIANO = "\x1b[36m";
const VERDE = "\x1b[32m";
const AMARELO = "\x1b[33m";
const VERMELHO = "\x1b[31m";

function formatar(texto: string, estilo: string): string {
  if (!process.stdout.isTTY || process.env.NO_COLOR !== undefined) return texto;
  return `${estilo}${texto}${RESET}`;
}

export const Cores = {
  destaque: (texto: string) => formatar(texto, CIANO),
  discreto: (texto: string) => formatar(texto, "\x1b[90m"),
  titulo: (texto: string) => formatar(texto, NEGRITO + CIANO),
  sucesso: (texto: string) => formatar(texto, VERDE),
  aviso: (texto: string) => formatar(texto, AMARELO),
  erro: (texto: string) => formatar(texto, VERMELHO),
};
