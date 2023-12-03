import { json, type DataFunctionArgs } from "@remix-run/node";
import { prisma } from "~/db.server";

import { invariantResponse } from "~/utils/index.server";

export async function loader({ params }: DataFunctionArgs) {
  console.log("xd");
  return json({}, { status: 200 });
  //   invariantResponse(params.imageId, "Image ID is required", { status: 400 });
  //   const image = await prisma.image.findUnique({
  //     where: { id: params.imageId },
  //     select: {
  //       blob: true,
  //     },
  //   });

  //   console.log(image);

  //   invariantResponse(image?.blob, "Not found", { status: 404 });

  //   return new Response(image.blob, {
  //     headers: {
  //       "content-type": "image/png",
  //       "content-length": Buffer.byteLength(image.blob).toString(),
  //       "content-disposition": `inline; filename="${params.imageId}"`,
  //       "cache-control": "public, max-age=31536000, immutable",
  //     },
  //   });
}
