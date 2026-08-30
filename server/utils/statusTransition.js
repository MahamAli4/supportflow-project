/**
 * Allowed status transitions for SupportFlow tickets:
 * New -> Assigned | In Progress
 * Assigned -> In Progress | Resolved
 * In Progress -> Resolved
 * Resolved -> Locked (no status changes permitted out of Resolved)
 */

const ALLOWED_TRANSITIONS = {
  New: ['Assigned', 'In Progress'],
  Assigned: ['In Progress', 'Resolved'],
  'In Progress': ['Resolved'],
  Resolved: [], // Locked state
};

/**
 * Validates if transitioning from currentStatus to nextStatus is allowed.
 * @param {string} currentStatus 
 * @param {string} nextStatus 
 * @returns {boolean}
 */
const isValidStatusTransition = (currentStatus, nextStatus) => {
  if (!currentStatus || !nextStatus) return false;
  if (currentStatus === nextStatus) return true; // Idempotent same-state check

  const allowedNextStates = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowedNextStates.includes(nextStatus);
};

/**
 * Checks if a ticket is in a locked resolved state.
 * @param {string} status 
 * @returns {boolean}
 */
const isTicketLocked = (status) => {
  return status === 'Resolved';
};

module.exports = {
  ALLOWED_TRANSITIONS,
  isValidStatusTransition,
  isTicketLocked,
};
