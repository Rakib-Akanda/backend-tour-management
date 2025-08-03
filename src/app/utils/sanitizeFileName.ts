export function sanitizeFileName(originalName: string): string {
  // Step 1: Remove last extension from filename (e.g. a.b.c.jpg => a.b.c)
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");

  // Step 2: Extract only the last extension (e.g. a.b.c.jpg => jpg)
  //   const extension = originalName.split(".").pop()?.toLowerCase() || "";

  // Step 3: Sanitize filename (remove spaces, special chars)
  const sanitized = nameWithoutExt
    .toLowerCase()
    .replace(/\s+/g, "-") // replace spaces with dash
    // eslint-disable-next-line no-useless-escape
    .replace(/[^a-z0-9\-\.]/g, "-") // keep alphanumeric, dash, dot
    .replace(/-+/g, "-") // replace multiple dashes with single dash
    .replace(/^-|-$/g, ""); // remove leading/trailing dashes

  // Step 4: Add random + timestamp for uniqueness
  const uniquePrefix = `${Math.random().toString(36).substring(2)}-${Date.now()}`;

  // Step 5: Return final name with single extension
  //   return `${uniquePrefix}-${sanitized}.${extension}`;
  // Cloudinary will auto-assign format based on the MIME type (like image/jpeg, image/png) and serve properly even without .jpg in the public_id.
  return `${uniquePrefix}-${sanitized}`;
}
