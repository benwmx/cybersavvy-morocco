import { createFileRoute, redirect } from "@tanstack/react-router";

// Admin moved to its own layout at /admin/translations
export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: () => { throw redirect({ to: "/admin/translations" }); },
  component: () => null,
});
