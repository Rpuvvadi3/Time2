import { type EventInput } from '@fullcalendar/core'

let eventGuid = 1000 // Start from 1000 to avoid conflicts with database IDs

// Empty initial events - events are loaded from the database
export const INITIAL_EVENTS: EventInput[] = []

export function createEventId() {
  return String(eventGuid++)
}
