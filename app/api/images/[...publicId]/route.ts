import { NextResponse } from "next/server";

import cloudinary from "@/src/lib/cloudinary";

type Params = {
  params: Promise<{
    publicId: string[];
  }>;
};

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { publicId } = await params;

    if (!publicId || publicId.length === 0) {
      return NextResponse.json(
        {
          message: "Image public ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const cloudinaryPublicId = publicId.join("/");

    const imageUrl = cloudinary.url(cloudinaryPublicId, {
      secure: true,
      resource_type: "image",
    });

    /*
     * Fetch the actual image bytes from Cloudinary.
     */
    const cloudinaryResponse = await fetch(imageUrl);

    if (!cloudinaryResponse.ok) {
      console.error(
        "Cloudinary fetch failed:",
        cloudinaryResponse.status,
        cloudinaryResponse.statusText,
        imageUrl
      );

      return NextResponse.json(
        {
          message: "Image not found.",
        },
        {
          status: cloudinaryResponse.status,
        }
      );
    }

    const contentType =
      cloudinaryResponse.headers.get("content-type") ||
      "image/png";

    /*
     * Verify we actually got an image back.
     */
    if (!contentType.startsWith("image/")) {
      console.error(
        "Cloudinary returned non-image content:",
        contentType,
        imageUrl
      );

      return NextResponse.json(
        {
          message: "Invalid image response.",
        },
        {
          status: 502,
        }
      );
    }

    const imageBuffer = await cloudinaryResponse.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error(
      "Cloudinary image fetch error:",
      error
    );

    return NextResponse.json(
      {
        message: "Unable to load image.",
      },
      {
        status: 500,
      }
    );
  }
}