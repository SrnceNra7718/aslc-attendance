import AttendanceComponent from "@/components/AttendanceComponent";
import AttendanceForm from "@/components/AttendanceForm";

export default async function Index() {
  return (
    <>
      <AttendanceForm />
      <AttendanceComponent />
    </>
  );
}
