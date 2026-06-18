import { emitToUser } from "../lib/realtime";

export function notifyNewMatch(userId: string, payload: unknown) {
  emitToUser(userId, "new_match", payload);
}

export function notifyBookingConfirmed(userId: string, payload: unknown) {
  emitToUser(userId, "booking_confirmed", payload);
}

export function notifySessionStarted(userId: string, payload: unknown) {
  emitToUser(userId, "session_started", payload);
}
