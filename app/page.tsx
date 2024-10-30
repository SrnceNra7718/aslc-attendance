import AttendanceTable from "@/components/AttendanceTable";
import AttendanceForm from "@/components/AttendanceForm";

export default async function Index() {
  return (
    <>
      <AttendanceForm />
      <AttendanceTable />
    </>
  );
}
