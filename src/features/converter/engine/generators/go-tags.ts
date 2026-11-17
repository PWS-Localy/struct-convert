export interface GoTagOptions {
  optional?: boolean;
  jsonName?: string;
  json?: boolean;
  omitempty?: boolean;
}

function escapeTagValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function buildGoTags(
  fieldName: string,
  options: GoTagOptions = {},
): string {
  if (options.json === false) return "";

  const jsonName = escapeTagValue(options.jsonName ?? fieldName);
  const parts = [jsonName];

  if (options.optional || options.omitempty) parts.push("omitempty");

  return `json:"${parts.join(",")}"`;
}

export function formatGoTag(
  fieldName: string,
  options: GoTagOptions = {},
): string {
  const tag = buildGoTags(fieldName, options);
  return tag ? `\`${tag}\`` : "";
}