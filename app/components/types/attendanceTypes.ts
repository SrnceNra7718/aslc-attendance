// Define the interface for each attendance record
export interface AttendanceRecord {
  date_mm_dd_yyyy: string;
  meeting_type: string;
  deaf: number;
  hearing: number;
  total: number;
}

export interface MonthlyAttendance {
  midWeek: AttendanceRecord[];
  weekend: AttendanceRecord[];
}
