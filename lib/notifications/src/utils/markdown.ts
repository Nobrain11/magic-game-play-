export function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!\\-]/g, '\\$&')
}

export function bold(text: string): string {
  return `*${text}*`
}

export function code(text: string): string {
  return `\`${text}\``
}
