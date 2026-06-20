function formatCategory(category: string): string {
  return category
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="badge-purple">
      {formatCategory(category ?? "_")}
    </span>
  );
}
