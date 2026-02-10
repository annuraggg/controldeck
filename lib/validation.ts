const SERVICE_NAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

export function isValidServiceName(name: unknown): name is string {
  return typeof name === "string" && SERVICE_NAME_PATTERN.test(name);
}
