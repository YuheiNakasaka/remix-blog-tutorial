import { json, type LoaderArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { requireAdmin } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdmin(request);
  return json({});
};

export default function AdminIndex() {
  return (
    <p>
      <Link to="new" className="text-blue-600 underline">
        Create a New Post
      </Link>
    </p>
  );
}
