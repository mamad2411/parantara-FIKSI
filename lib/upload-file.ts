/**
 * Upload a File to /api/upload, store as base64 in Postgres.
 * Returns the file URL (/api/files/[id]) or null on failure.
 */
export async function uploadFile(file: File, uploadedBy?: string): Promise<string | null> {
  try {
    const fd = new FormData()
    fd.append('file', file)
    if (uploadedBy) fd.append('uploadedBy', uploadedBy)

    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!res.ok) return null
    const json = await res.json()
    return json.url as string
  } catch {
    return null
  }
}

/**
 * Upload all File fields in formData, replace with URLs.
 * Non-File values are passed through as-is.
 */
export async function uploadAllFiles(
  formData: Record<string, any>,
  uploadedBy?: string,
  onProgress?: (uploaded: number, total: number) => void
): Promise<Record<string, any>> {
  const fileFields = Object.entries(formData).filter(([, v]) => v instanceof File)
  const total = fileFields.length
  let uploaded = 0

  const result = { ...formData }

  for (const [key, file] of fileFields) {
    const url = await uploadFile(file as File, uploadedBy)
    result[key] = url ?? (file as File).name // fallback to filename if upload fails
    uploaded++
    onProgress?.(uploaded, total)
  }

  return result
}
