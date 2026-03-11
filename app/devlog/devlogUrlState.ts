export function parseSelectedTags(search: string): string[] {
  const params = new URLSearchParams(search);
  const tag = params.get("tag");

  return tag ? tag.split(",").filter(Boolean) : [];
}

export function buildNextUrl(pathname: string, search: string, tags: string[]): string {
  const params = new URLSearchParams(search);

  if (tags.length > 0) {
    params.set("tag", tags.join(","));
  } else {
    params.delete("tag");
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
