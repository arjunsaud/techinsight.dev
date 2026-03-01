export function AdminHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <header>
        <p className="text-2xl font-bold tracking-tight">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>
    </div>
  );
}
