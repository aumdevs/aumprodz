import { Badge } from "@/components/ui/badge";

export function StatusBadge({
  children,
  status = "default",
}: {
  children: React.ReactNode;
  status?: "default" | "success" | "warning" | "danger" | "muted";
}) {
  const tone =
    status === "danger"
      ? "danger"
      : status === "warning"
        ? "accent"
        : status === "muted"
          ? "muted"
          : "default";

  return <Badge tone={tone}>{children}</Badge>;
}
