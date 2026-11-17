const GO_INITIALISMS = new Set([
  "API", "ASCII", "CPU", "CSS", "DNS", "EOF", "GUID", "HTML", "HTTP",
  "HTTPS", "ID", "IP", "JSON", "QPS", "RAM", "RPC", "SLA", "SQL",
  "SSH", "TCP", "TLS", "UDP", "UI", "UID", "UUID", "URI", "URL", "UTF8",
  "VM", "XML", "XMPP", "XSRF", "XSS",
]);

const GO_KEYWORDS = new Set([
  "break", "default", "func", "interface", "select", "case", "defer",
  "go", "map", "struct", "chan", "else", "goto", "package", "switch",
  "const", "fallthrough", "if", "range", "type", "continue", "for",
  "import", "return", "var",
]);

function splitWords(input: string): string[] {
  const normalized = input
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Za-z])([0-9])/g, "$1 $2")
    .replace(/([0-9])([A-Za-z])/g, "$1 $2");

  return normalized
    .split(/[^A-Za-z0-9]+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

function capitalizeWord(word: string): string {
  const upper = word.toUpperCase();
  if (GO_INITIALISMS.has(upper)) return upper;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function toGoExportedName(input: string): string {
  const words = splitWords(input);
  let result = words.map(capitalizeWord).join("");

  if (!result) result = "Field";
  if (/^[0-9]/.test(result)) result = `Field${result}`;
  return result;
}

export function toGoFieldName(input: string): string {
  let result = toGoExportedName(input);
  if (GO_KEYWORDS.has(result.toLowerCase())) result += "Field";
  return result;
}

export function toGoTypeName(input: string): string {
  return toGoFieldName(input);
}

export function uniqueGoName(
  candidate: string,
  used: Set<string>,
): string {
  const base = toGoFieldName(candidate);
  if (!used.has(base)) {
    used.add(base);
    return base;
  }

  let suffix = 2;
  while (used.has(`${base}${suffix}`)) suffix += 1;
  const unique = `${base}${suffix}`;
  used.add(unique);
  return unique;
}