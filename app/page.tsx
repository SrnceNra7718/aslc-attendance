import AttendanceTable from "@/app/components/AttendanceTable";
import AttendanceForm from "@/app/components/AttendanceForm";
import { AttendanceUpdates } from "./components/AttendanceUpdates/AttendanceUpdates";

export default async function Index() {
  return (
    <>
      <AttendanceForm />
      <AttendanceUpdates />
    </>
  );
}
