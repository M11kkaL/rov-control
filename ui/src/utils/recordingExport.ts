import type { Telemetry } from '../types'
import { saveBlob, saveFilesToDirectory, saveText, shouldClearAfterSave, type SaveResult } from './saveFile'

export function messageForSaveResult(result: SaveResult, success: string): string {
  if (result === 'saved') return success
  if (result === 'cancelled') return 'Save cancelled'
  return 'Choose save location in dialog'
}

export async function saveTelemetryFrames(
  frames: Telemetry[],
  body: string | null,
  stamp: string,
): Promise<SaveResult | null> {
  if (!body || frames.length === 0) return null
  return saveText(body, `rov-telemetry-${stamp}.jsonl`, 'application/jsonl')
}

export async function saveVideoBlob(video: Blob, stamp: string): Promise<SaveResult> {
  return saveBlob(video, `rov-video-${stamp}.webm`, video.type || 'video/webm')
}

export async function saveRecordingBundle(
  frames: Telemetry[],
  telemetryBody: string | null,
  video: Blob | null,
): Promise<{ results: Array<'telemetry' | 'video'>; cancelled: boolean; message: string }> {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const hasTelemetry = frames.length > 0 && telemetryBody !== null
  const hasVideo = video !== null

  if (!hasTelemetry && !hasVideo) {
    return { results: [], cancelled: false, message: 'Nothing to save' }
  }

  if (hasTelemetry && hasVideo && telemetryBody) {
    const dirResult = await saveFilesToDirectory([
      {
        name: `rov-telemetry-${stamp}.jsonl`,
        blob: new Blob([telemetryBody], { type: 'application/jsonl' }),
      },
      { name: `rov-video-${stamp}.webm`, blob: video },
    ])

    if (dirResult === 'saved') {
      return { results: ['telemetry', 'video'], cancelled: false, message: 'Telemetry and video saved' }
    }
    if (dirResult === 'cancelled') {
      return { results: [], cancelled: true, message: 'Save cancelled' }
    }
  }

  const results: Array<'telemetry' | 'video'> = []

  if (hasTelemetry && telemetryBody) {
    const teleResult = await saveTelemetryFrames(frames, telemetryBody, stamp)
    if (!teleResult) {
      return { results, cancelled: false, message: 'Nothing to save' }
    }
    if (teleResult === 'cancelled') {
      return { results, cancelled: true, message: 'Save cancelled' }
    }
    results.push('telemetry')
  }

  if (hasVideo && video) {
    const videoResult = await saveVideoBlob(video, stamp)
    if (videoResult === 'cancelled') {
      const partial = results.length > 0 ? 'Telemetry saved — video cancelled' : 'Save cancelled'
      return { results, cancelled: true, message: partial }
    }
    results.push('video')
  }

  if (results.length === 2) return { results, cancelled: false, message: 'Telemetry and video saved' }
  if (results.includes('telemetry')) return { results, cancelled: false, message: 'Telemetry saved' }
  return { results, cancelled: false, message: 'Video saved' }
}

export { shouldClearAfterSave }
