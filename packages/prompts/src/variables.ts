const VARIABLE_REGEX = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;

export function extractVariables(template: string): string[] {
  const seen = new Set<string>();
  const variables: string[] = [];

  for (const match of template.matchAll(VARIABLE_REGEX)) {
    const name = match[1];
    if (name === undefined || seen.has(name)) {
      continue;
    }
    seen.add(name);
    variables.push(name);
  }

  return variables;
}

export function substituteVariables(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(
    VARIABLE_REGEX,
    (_, name: string) => values[name] ?? `{{${name}}}`,
  );
}

export function getUnfilledVariables(
  variableNames: string[],
  values: Record<string, string>,
): string[] {
  return variableNames.filter((name) => !values[name]?.trim());
}
