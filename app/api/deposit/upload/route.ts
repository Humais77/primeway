import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import { getSession } from "@/src/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("screenshot");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          message: "Screenshot is required.",
        },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          message:
            "Only JPG, PNG and WEBP screenshots are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          message:
            "Screenshot must be smaller than 5MB.",
        },
        { status: 400 }
      );
    }

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";

    const directory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "deposits"
    );

    await mkdir(directory, {
      recursive: true,
    });

    const filename = `${session.userId}-${randomUUID()}.${extension}`;

    const filepath = path.join(
      directory,
      filename
    );

    const bytes = await file.arrayBuffer();

    await writeFile(
      filepath,
      Buffer.from(bytes)
    );

    return NextResponse.json({
      url: `/uploads/deposits/${filename}`,
    });
  } catch (error) {
    console.error(
      "Deposit screenshot upload error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to upload screenshot.",
      },
      { status: 500 }
    );
  }
}