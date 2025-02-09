import AttendanceForm from "@/app/components/AttendanceForm";
import { AttendanceUpdates } from "./components/AttendanceUpdates/AttendanceUpdates";
import { DownloadAttendancePage } from "./components/DownloadAttendance/DownloadAttendancePage";

export default async function Index() {
  return (
    <>
      <AttendanceForm />
    </>
  );
}
