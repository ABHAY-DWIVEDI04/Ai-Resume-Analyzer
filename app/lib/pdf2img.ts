// ...existing code...
export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("pdfjs must run in the browser (window is undefined).");
  }
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  // Use the legacy build which works better with Vite and bundlers
  loadPromise = import("pdfjs-dist/legacy/build/pdf.mjs").then((lib) => {
    try {
      lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
    } catch {
      (lib as any).GlobalWorkerOptions = (lib as any).GlobalWorkerOptions || {};
      (lib as any).GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
    }
    pdfjsLib = lib;
    return lib;
  });

  return loadPromise;
}

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  if (typeof window === "undefined") {
    return {
      imageUrl: "",
      file: null,
      error: "Conversion must run in the browser.",
    };
  }

  try {
    const lib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = lib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const scale = 2; // adjust for quality/perf
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));

    if (!ctx) {
      return {
        imageUrl: "",
        file: null,
        error: "Canvas 2D context unavailable.",
      };
    }

    ctx.imageSmoothingEnabled = true;
    try {
      // @ts-ignore
      ctx.imageSmoothingQuality = "high";
    } catch {}

    const renderTask = page.render({ canvasContext: ctx, viewport });
    await renderTask.promise;

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png")
    );

    if (!blob) {
      return {
        imageUrl: "",
        file: null,
        error: "Failed to create image blob from canvas.",
      };
    }

    const originalName = file.name.replace(/\.pdf$/i, "");
    const imageFile = new File([blob], `${originalName}.png`, {
      type: "image/png",
    });
    const imageUrl = URL.createObjectURL(blob);

    return { imageUrl, file: imageFile };
  } catch (err: any) {
    console.error("convertPdfToImage error:", err);
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err?.message ?? String(err)}`,
    };
  }
}
// ...existing code...
