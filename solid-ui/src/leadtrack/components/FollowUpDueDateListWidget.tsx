import { useEffect, useState } from "react";
import "./follow-up-list.css";

type FollowUpDueDateListWidgetProps = {
  rowData: Record<string, unknown>;
  fieldMetadata: { name: string };
};

type DayChangeListener = () => void;

const dayChangeListeners = new Set<DayChangeListener>();
let dayChangeTimer: number | null = null;

const scheduleDayChange = () => {
  if (dayChangeListeners.size === 0 || dayChangeTimer !== null) return;

  const now = new Date();
  const nextDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    50,
  );

  dayChangeTimer = window.setTimeout(() => {
    dayChangeTimer = null;
    dayChangeListeners.forEach((listener) => listener());
    scheduleDayChange();
  }, Math.max(1000, nextDay.getTime() - now.getTime()));
};

const subscribeToDayChange = (listener: DayChangeListener) => {
  dayChangeListeners.add(listener);
  scheduleDayChange();

  return () => {
    dayChangeListeners.delete(listener);
    if (dayChangeListeners.size === 0 && dayChangeTimer !== null) {
      window.clearTimeout(dayChangeTimer);
      dayChangeTimer = null;
    }
  };
};

const formatDateTime = (value: unknown) => {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
};

const isBeforeToday = (date: Date) => {
  const today = new Date();
  const dueDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return dueDay < todayDay;
};

export default function FollowUpDueDateListWidget({
  rowData,
  fieldMetadata,
}: FollowUpDueDateListWidgetProps) {
  const [, refreshDay] = useState(0);
  const value = rowData?.[fieldMetadata.name];
  const dueDate = value ? new Date(String(value)) : null;

  useEffect(() => {
    return subscribeToDayChange(() => refreshDay((day) => day + 1));
  }, []);

  const isOverdue =
    dueDate !== null &&
    !Number.isNaN(dueDate.getTime()) &&
    isBeforeToday(dueDate) &&
    rowData?.isCompleted !== true;

  return (
    <time
      className={isOverdue ? "follow-up-overdue-marker" : undefined}
      dateTime={value ? String(value) : undefined}
      title={isOverdue ? "Overdue follow-up" : undefined}
    >
      {formatDateTime(value)}
    </time>
  );
}
