export const HOMEWORK_STATUS = {
  ASSIGNED: "assigned",
  OPENED: "opened",
  STARTED: "started",
  SUBMITTED: "submitted",
  REVIEWING: "reviewing",
  REVIEWED: "reviewed",
  REVISION_REQUESTED: "revision_requested",
  CLOSED: "closed",
};

export const HOMEWORK_STATUS_LABELS = {
  [HOMEWORK_STATUS.ASSIGNED]: "Kiadva",
  [HOMEWORK_STATUS.OPENED]: "Elkezdve",
  [HOMEWORK_STATUS.STARTED]: "Elkezdve",
  [HOMEWORK_STATUS.SUBMITTED]: "Beküldve",
  [HOMEWORK_STATUS.REVIEWING]: "Javítás alatt",
  [HOMEWORK_STATUS.REVIEWED]: "Javítva",
  [HOMEWORK_STATUS.REVISION_REQUESTED]: "Újraküldés kérve",
  [HOMEWORK_STATUS.CLOSED]: "Lezárva",
};

const STUDENT_ACTIONABLE_STATUSES = new Set([
  HOMEWORK_STATUS.ASSIGNED,
  HOMEWORK_STATUS.OPENED,
  HOMEWORK_STATUS.STARTED,
  HOMEWORK_STATUS.REVISION_REQUESTED,
]);

const SUBMITTED_STATUSES = new Set([
  HOMEWORK_STATUS.SUBMITTED,
  HOMEWORK_STATUS.REVIEWING,
  HOMEWORK_STATUS.REVIEWED,
  HOMEWORK_STATUS.CLOSED,
]);

export function getHomeworkStatusLabel(status) {
  return HOMEWORK_STATUS_LABELS[status] || HOMEWORK_STATUS_LABELS.assigned;
}

export function getSubmissionStatusLabel(status) {
  return HOMEWORK_STATUS_LABELS[status] || "Beküldve";
}

export function getHomeworkFilterStatus(status) {
  if (
    status === HOMEWORK_STATUS.ASSIGNED ||
    status === HOMEWORK_STATUS.OPENED ||
    status === HOMEWORK_STATUS.STARTED ||
    status === HOMEWORK_STATUS.REVISION_REQUESTED
  ) {
    return "todo";
  }

  if (status === HOMEWORK_STATUS.REVIEWING) {
    return HOMEWORK_STATUS.SUBMITTED;
  }

  return status || HOMEWORK_STATUS.ASSIGNED;
}

export function canStudentWorkOnHomework(status) {
  return STUDENT_ACTIONABLE_STATUSES.has(status || HOMEWORK_STATUS.ASSIGNED);
}

export function isHomeworkSubmitted(status) {
  return SUBMITTED_STATUSES.has(status);
}

export function shouldMarkHomeworkStarted(status) {
  return (
    status === HOMEWORK_STATUS.ASSIGNED ||
    status === HOMEWORK_STATUS.OPENED ||
    status === HOMEWORK_STATUS.REVISION_REQUESTED
  );
}
