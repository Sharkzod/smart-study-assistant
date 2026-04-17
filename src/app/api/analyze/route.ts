import { NextRequest, NextResponse } from "next/server";
import { analyzeText } from "@/lib/analyzer";
import mammoth from "mammoth";

async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<string> {
  // Dynamic import to avoid worker bundling issues
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Disable the worker to avoid file-not-found errors in Next.js
  pdfjsLib.GlobalWorkerOptions.workerSrc = "";

  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) })
    .promise;

  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items
      .filter((item) => "str" in item)
      .map((item) => (item as { str: string }).str);
    pages.push(strings.join(" "));
  }

  return pages.join("\n\n");
}

async function extractTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) {
    return extractPdfText(arrayBuffer);
  }

  if (name.endsWith(".docx")) {
    const buffer = Buffer.from(arrayBuffer);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (name.endsWith(".doc")) {
    throw new Error(
      "Legacy .doc format is not supported. Please convert to .docx first."
    );
  }

  // Plain text / markdown
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString("utf-8");
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let text: string;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const pastedText = formData.get("text") as string | null;

      if (file && file.size > 0) {
        text = await extractTextFromFile(file);
      } else if (pastedText) {
        text = pastedText;
      } else {
        return NextResponse.json(
          { error: "Please provide a file or text to analyze." },
          { status: 400 }
        );
      }
    } else {
      const body = await request.json();
      text = body.text;
    }

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Please provide text to analyze." },
        { status: 400 }
      );
    }

    const trimmed = text.trim();
    if (trimmed.length < 50) {
      return NextResponse.json(
        {
          error:
            "Please provide at least 50 characters of text for meaningful analysis.",
        },
        { status: 400 }
      );
    }

    const result = analyzeText(trimmed);
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to analyze. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
