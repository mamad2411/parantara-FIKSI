/**
 * Image Forensics Utility
 * Detects if an image has been edited or manipulated
 */

import ExifReader from 'exifreader'

export interface ImageForensicsResult {
  isValid: boolean
  isSuspicious: boolean
  suspicionReasons: string[]
  metadata: {
    software?: string
    dateTime?: string
    make?: string
    model?: string
    hasExif: boolean
    hasGPS: boolean
  }
  warnings: string[]
}

/**
 * Analyze image for signs of manipulation
 */
export async function analyzeImage(file: File): Promise<ImageForensicsResult> {
  const result: ImageForensicsResult = {
    isValid: true,
    isSuspicious: false,
    suspicionReasons: [],
    metadata: {
      hasExif: false,
      hasGPS: false,
    },
    warnings: [],
  }

  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Parse EXIF data
    let tags: any
    try {
      tags = ExifReader.load(arrayBuffer)
      result.metadata.hasExif = true
    } catch (error) {
      result.warnings.push('Tidak ada metadata EXIF (mungkin foto screenshot atau diedit)')
      result.isSuspicious = true
      result.suspicionReasons.push('Missing EXIF metadata')
    }

    if (tags) {
      // Check for editing software
      const software = tags.Software?.description || tags.ProcessingSoftware?.description
      if (software) {
        result.metadata.software = software
        
        // List of known photo editing software
        const editingSoftware = [
          'photoshop',
          'gimp',
          'lightroom',
          'snapseed',
          'vsco',
          'picsart',
          'canva',
          'pixlr',
          'fotor',
          'befunky',
          'photoscape',
          'paint.net',
          'affinity',
          'corel',
          'capture one',
        ]
        
        const softwareLower = software.toLowerCase()
        const isEdited = editingSoftware.some(editor => softwareLower.includes(editor))
        
        if (isEdited) {
          result.isSuspicious = true
          result.suspicionReasons.push(`Foto diedit menggunakan: ${software}`)
          result.warnings.push(`Terdeteksi software editing: ${software}`)
        }
      }

      // Check camera make and model
      if (tags.Make?.description) {
        result.metadata.make = tags.Make.description
      }
      if (tags.Model?.description) {
        result.metadata.model = tags.Model.description
      }

      // Check if photo has GPS data (original photos usually have this)
      if (tags.GPSLatitude || tags.GPSLongitude) {
        result.metadata.hasGPS = true
      }

      // Check DateTime
      if (tags.DateTime?.description || tags.DateTimeOriginal?.description) {
        result.metadata.dateTime = tags.DateTime?.description || tags.DateTimeOriginal?.description
      }

      // Check for missing camera info (suspicious for documents)
      if (!tags.Make && !tags.Model && file.type.includes('image/jpeg')) {
        result.warnings.push('Tidak ada informasi kamera (mungkin hasil scan atau screenshot)')
        result.isSuspicious = true
        result.suspicionReasons.push('Missing camera information')
      }

      // Check for modified date vs original date
      if (tags.DateTime?.description && tags.DateTimeOriginal?.description) {
        const modified = new Date(tags.DateTime.description.replace(/:/g, '-').replace(' ', 'T'))
        const original = new Date(tags.DateTimeOriginal.description.replace(/:/g, '-').replace(' ', 'T'))
        
        // If modified date is significantly different from original (more than 1 hour)
        const diffHours = Math.abs(modified.getTime() - original.getTime()) / (1000 * 60 * 60)
        if (diffHours > 1) {
          result.warnings.push('Tanggal modifikasi berbeda dari tanggal asli foto')
          result.isSuspicious = true
          result.suspicionReasons.push('Modified date differs from original')
        }
      }
    }

    // Check file size vs dimensions ratio (edited images often have unusual ratios)
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = objectUrl
    })

    const fileSize = file.size
    const pixels = img.width * img.height
    const bytesPerPixel = fileSize / pixels

    // Typical JPEG: 0.1-0.5 bytes per pixel
    // Heavily compressed or edited: < 0.05 or > 1.0
    if (bytesPerPixel < 0.05) {
      result.warnings.push('Foto terlalu terkompresi (mungkin hasil screenshot atau edit)')
      result.isSuspicious = true
      result.suspicionReasons.push('Unusual compression ratio (too compressed)')
    } else if (bytesPerPixel > 1.5) {
      result.warnings.push('Ukuran file tidak wajar untuk dimensi foto')
      result.isSuspicious = true
      result.suspicionReasons.push('Unusual compression ratio (too large)')
    }

    URL.revokeObjectURL(objectUrl)

    // Check file name patterns (screenshots often have specific patterns)
    const suspiciousPatterns = [
      /screenshot/i,
      /screen_shot/i,
      /screen-shot/i,
      /capture/i,
      /edited/i,
      /modified/i,
      /copy/i,
      /scan/i,
    ]

    const hasSuspiciousName = suspiciousPatterns.some(pattern => pattern.test(file.name))
    if (hasSuspiciousName) {
      result.warnings.push('Nama file mencurigakan (screenshot/edited/scan)')
      result.isSuspicious = true
      result.suspicionReasons.push('Suspicious filename pattern')
    }

  } catch (error) {
    console.error('Error analyzing image:', error)
    result.warnings.push('Gagal menganalisis foto')
  }

  return result
}

/**
 * Validate image for document upload (stricter rules)
 */
export async function validateDocumentImage(file: File): Promise<{
  isValid: boolean
  error?: string
  warnings: string[]
}> {
  const forensics = await analyzeImage(file)

  // For documents, we're more strict
  if (forensics.isSuspicious) {
    return {
      isValid: false,
      error: 'Foto dokumen tidak boleh hasil editan atau screenshot. Mohon upload foto asli dokumen.',
      warnings: forensics.warnings,
    }
  }

  // Warn but allow if only minor issues
  if (forensics.warnings.length > 0) {
    return {
      isValid: true,
      warnings: forensics.warnings,
    }
  }

  return {
    isValid: true,
    warnings: [],
  }
}

/**
 * Check if image is a screenshot
 */
export function isScreenshot(file: File): boolean {
  const screenshotPatterns = [
    /screenshot/i,
    /screen_shot/i,
    /screen-shot/i,
    /capture/i,
    /^IMG-\d{8}-WA\d{4}/, // WhatsApp screenshot pattern
  ]

  return screenshotPatterns.some(pattern => pattern.test(file.name))
}

/**
 * Get human-readable validation message
 */
export function getValidationMessage(forensics: ImageForensicsResult): string {
  if (!forensics.isSuspicious) {
    return 'Foto valid'
  }

  const messages: string[] = []

  if (forensics.suspicionReasons.includes('Missing EXIF metadata')) {
    messages.push('⚠️ Foto tidak memiliki metadata (mungkin screenshot atau hasil edit)')
  }

  if (forensics.metadata.software) {
    messages.push(`⚠️ Foto diedit menggunakan: ${forensics.metadata.software}`)
  }

  if (forensics.suspicionReasons.includes('Missing camera information')) {
    messages.push('⚠️ Tidak ada informasi kamera pada foto')
  }

  if (forensics.suspicionReasons.includes('Suspicious filename pattern')) {
    messages.push('⚠️ Nama file mencurigakan (screenshot/edited/scan)')
  }

  return messages.join('\n')
}
