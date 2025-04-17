interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  return <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>;
}
