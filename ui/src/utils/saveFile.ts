export type SaveResult = 'saved' | 'cancelled' | 'prompted'

export function shouldClearAfterSave(result: SaveResult): boolean {
  return result === 'saved' || result === 'prompted'
}

export async function saveBlob(blob: Blob, filename: string, mime: string): Promise<SaveResult> {
  const picker = (window as Window & { showSaveFilePicker?: ShowSaveFilePicker }).showSaveFilePicker
  if (picker) {
    try {
      const handle = await picker({
        suggestedName: filename,
        types: [{ description: filename, accept: { [mime]: [extensionFor(filename)] } }],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return 'saved'
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return 'cancelled'
      }
    }
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
  return 'prompted'
}

export async function saveText(text: string, filename: string, mime: string): Promise<SaveResult> {
  return saveBlob(new Blob([text], { type: mime }), filename, mime)
}

export async function saveFilesToDirectory(
  files: Array<{ name: string; blob: Blob }>,
): Promise<SaveResult | 'unsupported'> {
  const picker = (window as Window & { showDirectoryPicker?: ShowDirectoryPicker }).showDirectoryPicker
  if (!picker || files.length === 0) return 'unsupported'

  try {
    const dir = await picker()
    for (const file of files) {
      const handle = await dir.getFileHandle(file.name, { create: true })
      const writable = await handle.createWritable()
      await writable.write(file.blob)
      await writable.close()
    }
    return 'saved'
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return 'cancelled'
    }
    return 'unsupported'
  }
}

function extensionFor(filename: string): string {
  const dot = filename.lastIndexOf('.')
  return dot >= 0 ? filename.slice(dot) : ''
}

type ShowSaveFilePicker = (options: {
  suggestedName?: string
  types?: Array<{ description?: string; accept: Record<string, string[]> }>
}) => Promise<FileSystemFileHandle>

type ShowDirectoryPicker = () => Promise<FileSystemDirectoryHandle>
