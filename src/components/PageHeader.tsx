import React from "react";

interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
    </div>
  );
}
