// Image Forensics Library for detecting manipulated/edited images
// @ts-nocheck
import EXIF from 'exif-js'

interface ForensicsResult {
  isAuthentic: boolean
  confidence: number
  reasons: string[]
  metadata: any
}

export class ImageForensics {
  /**
   * Analyze image for signs of manipulation
   */
  static async analyzeImage(file: File): Promise<ForensicsResult> {
    const results: ForensicsResult = {
      isAuthentic: true,
      confidence: 100,
      reasons: [],
      metadata: {}
    }

    // 1. Check EXIF metadata
    const exifData = await this.extractEXIF(file)
    results.metadata = exifData

    // Check for editing software in metadata
    if (exifData.Software) {
      const editingSoftware = [
        'photoshop', 'gimp', 'paint.net', 'pixlr', 'canva', 
        'lightroom', 'snapseed', 'vsco', 'picsart', 'photoscape'
      ]
      const software = exifData.Software.toLowerCase()
      
      if (editingSoftware.some(s => software.includes(s))) {
        results.isAuthentic = false
        results.confidence -= 40
        results.reasons.push(`Terdeteksi software editing: ${exifData.Software}`)
      }
    }

    // Check if EXIF data is stripped (suspicious)
    if (!exifData.Make && !exifData.Model && !exifData.DateTime) {
      results.confidence -= 20
      results.reasons.push('Metadata EXIF hilang atau dihapus (mencurigakan)')
    }

    // 2. Perform Error Level Analysis (ELA)
    const elaResult = await this.performELA(file)
    if (!elaResult.passed) {
      results.isAuthentic = false
      results.confidence -= 30
      results.reasons.push(elaResult.reason)
    }

    // 3. Check for copy-paste patterns
    const copyPasteResult = await this.detectCopyPaste(file)
    if (!copyPasteResult.passed) {
      results.isAuthentic = false
      results.confidence -= 25
      results.reasons.push(copyPasteResult.reason)
    }

    // Final decision
    results.isAuthentic = results.confidence >= 50

    return results
  }

  /**
   * Extract EXIF metadata from image
   */
  private static extractEXIF(file: File): Promise<any> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          EXIF.getData(img as any, function(this: any) {
            const exifData = {
              Make: EXIF.getTag(this, 'Make'),
              Model: EXIF.getTag(this, 'Model'),
              DateTime: EXIF.getTag(this, 'DateTime'),
              Software: EXIF.getTag(this, 'Software'),
              Orientation: EXIF.getTag(this, 'Orientation'),
              XResolution: EXIF.getTag(this, 'XResolution'),
              YResolution: EXIF.getTag(this, 'YResolution'),
              ColorSpace: EXIF.getTag(this, 'ColorSpace'),
            }
            resolve(exifData)
          })
        }
        img.onerror = () => resolve({})
        img.src = e.target?.result as string
      }
      reader.onerror = () => resolve({})
      reader.readAsDataURL(file)
    })
  }

  /**
   * Error Level Analysis - detects JPEG compression inconsistencies
   */
  private static async performELA(file: File): Promise<{ passed: boolean; reason: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            resolve({ passed: true, reason: '' })
            return
          }

          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          // Analyze compression artifacts
          let highVarianceRegions = 0
          let lowVarianceRegions = 0
          const blockSize = 8 // JPEG uses 8x8 blocks

          for (let y = 0; y < canvas.height - blockSize; y += blockSize) {
            for (let x = 0; x < canvas.width - blockSize; x += blockSize) {
              let blockVariance = 0
              
              for (let by = 0; by < blockSize; by++) {
                for (let bx = 0; bx < blockSize; bx++) {
                  const idx = ((y + by) * canvas.width + (x + bx)) * 4
                  const nextIdx = ((y + by) * canvas.width + (x + bx + 1)) * 4
                  
                  if (nextIdx < data.length) {
                    const diff = Math.abs(data[idx] - data[nextIdx]) +
                                Math.abs(data[idx + 1] - data[nextIdx + 1]) +
                                Math.abs(data[idx + 2] - data[nextIdx + 2])
                    blockVariance += diff
                  }
                }
              }

              if (blockVariance > 500) highVarianceRegions++
              else if (blockVariance < 50) lowVarianceRegions++
            }
          }

          const totalBlocks = ((canvas.height / blockSize) * (canvas.width / blockSize))
          const varianceRatio = highVarianceRegions / totalBlocks

          // Edited images often have inconsistent compression levels
          if (varianceRatio > 0.4 || (lowVarianceRegions / totalBlocks) > 0.5) {
            resolve({
              passed: false,
              reason: 'Terdeteksi inkonsistensi kompresi JPEG (tanda editing)'
            })
          } else {
            resolve({ passed: true, reason: '' })
          }
        }
        img.onerror = () => resolve({ passed: true, reason: '' })
        img.src = e.target?.result as string
      }
      reader.onerror = () => resolve({ passed: true, reason: '' })
      reader.readAsDataURL(file)
    })
  }

  /**
   * Detect copy-paste patterns (cloning)
   */
  private static async detectCopyPaste(file: File): Promise<{ passed: boolean; reason: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            resolve({ passed: true, reason: '' })
            return
          }

          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          // Sample random blocks and check for duplicates
          const blockSize = 16
          const samples = 100
          const blocks: string[] = []
          let duplicates = 0

          for (let i = 0; i < samples; i++) {
            const x = Math.floor(Math.random() * (canvas.width - blockSize))
            const y = Math.floor(Math.random() * (canvas.height - blockSize))
            
            let blockHash = ''
            for (let by = 0; by < blockSize; by += 4) {
              for (let bx = 0; bx < blockSize; bx += 4) {
                const idx = ((y + by) * canvas.width + (x + bx)) * 4
                blockHash += `${data[idx]},${data[idx + 1]},${data[idx + 2]};`
              }
            }

            if (blocks.includes(blockHash)) {
              duplicates++
            } else {
              blocks.push(blockHash)
            }
          }

          // Too many duplicate blocks suggests cloning/copy-paste
          if (duplicates > samples * 0.15) {
            resolve({
              passed: false,
              reason: 'Terdeteksi pola duplikasi (copy-paste/cloning)'
            })
          } else {
            resolve({ passed: true, reason: '' })
          }
        }
        img.onerror = () => resolve({ passed: true, reason: '' })
        img.src = e.target?.result as string
      }
      reader.onerror = () => resolve({ passed: true, reason: '' })
      reader.readAsDataURL(file)
    })
  }

  /**
   * Quick validation for document authenticity
   */
  static async validateDocument(file: File): Promise<{ isValid: boolean; message: string }> {
    const result = await this.analyzeImage(file)
    
    if (!result.isAuthentic) {
      return {
        isValid: false,
        message: `Dokumen terdeteksi telah dimanipulasi. ${result.reasons.join('. ')}. Confidence: ${result.confidence}%`
      }
    }

    return {
      isValid: true,
      message: 'Dokumen terverifikasi sebagai asli'
    }
  }
}
