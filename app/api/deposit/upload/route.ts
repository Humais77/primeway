import { NextResponse } from "next/server";
import { Readable } from "stream";
import { randomUUID } from "crypto";

import { getSession } from "@/src/lib/auth";
import cloudinary from "@/src/lib/cloudinary";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function uploadToCloudinary(
  buffer: Buffer,
  userId: string,
  extension: string
): Promise<{
  secure_url: string;
  public_id: string;
}> {
  return new Promise((resolve, reject) => {
    const publicId = `${userId}-${randomUUID()}`;

    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder: "growvest/deposit-proofs",
          public_id: publicId,
          resource_type: "image",
          format: extension,
          type: "upload",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(
              new Error(
                "Cloudinary did not return an upload result."
              )
            );
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );

    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function POST(request: Request) {
  try {
    /*
     * ------------------------------------------------------------
     * 1. Authenticate user
     * ------------------------------------------------------------
     */

    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * ------------------------------------------------------------
     * 2. Read uploaded file
     * ------------------------------------------------------------
     */

    const formData = await request.formData();

    const file = formData.get("screenshot");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          message: "Screenshot is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ------------------------------------------------------------
     * 3. Validate file type
     * ------------------------------------------------------------
     */

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          message:
            "Only JPG, PNG and WEBP screenshots are allowed.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ------------------------------------------------------------
     * 4. Validate file size
     * ------------------------------------------------------------
     */

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          message:
            "Screenshot must be smaller than 5MB.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ------------------------------------------------------------
     * 5. Determine extension
     * ------------------------------------------------------------
     */

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";

    /*
     * ------------------------------------------------------------
     * 6. Convert File -> Buffer
     * ------------------------------------------------------------
     */

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    /*
     * ------------------------------------------------------------
     * 7. Upload to Cloudinary
     * ------------------------------------------------------------
     */

    const uploaded =
      await uploadToCloudinary(
        buffer,
        session.userId,
        extension
      );

    /*
     * ------------------------------------------------------------
     * 8. Return Cloudinary URL
     *
     * The frontend will send this URL to /api/deposits.
     * The Deposit.proofUrl field will store this URL.
     * ------------------------------------------------------------
     */

    return NextResponse.json({
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
    });
    } catch (error: any) {
    console.error(
      "Deposit screenshot Cloudinary upload error:",
      {
        message: error?.message,
        http_code: error?.http_code,
        name: error?.name,
        error: error?.error,
      }
    );

    return NextResponse.json(
      {
        message:
          error?.error?.message ||
          error?.message ||
          "Unable to upload screenshot.",
      },
      {
        status: 500,
      }
    );
  }
}