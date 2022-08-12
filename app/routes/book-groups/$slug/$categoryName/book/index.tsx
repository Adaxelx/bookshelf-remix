import { useCatch } from "@remix-run/react";
import { ErrorFallback } from "~/components";

export async function loader() {
  throw new Response(`Page not found. Check /book/new or /book/edit`, {
    status: 404,
  });
}

export default function Book() {
  return null;
}

export function CatchBoundary() {
  const caught = useCatch();
  return <ErrorFallback>{caught.data}</ErrorFallback>;
}
