import { AttendanceUpdates } from "../components/AttendanceUpdates/AttendanceUpdates";
import { DownloadAttendancePage } from "../components/DownloadAttendance/DownloadAttendancePage";
import { Divider } from "@nextui-org/divider";

export default async function Page() {
  return (
    <>
      <AttendanceUpdates />
      <Divider />
      <DownloadAttendancePage />
    </>
  );
}
