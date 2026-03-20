export function interpolate(template: string, vars: Record<string, string | number>): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    const token = `{${k}}`;
    while (out.includes(token)) {
      out = out.replace(token, String(v));
    }
  }
  return out;
}
