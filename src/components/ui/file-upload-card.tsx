import type React from "react";
import { UploadCloud } from "lucide-react";

export function FileUploadCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-primary/45 bg-primary/5 p-5">
      <div className="flex gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <UploadCloud className="size-5" />
        </span>
        <div>
          <p className="font-bold">{title}</p>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
