import { Suspense } from "react";
import { UploadNotice } from "@/components/UploadNotice";

export default function UploadPage() {
  return (
    <Suspense>
      <UploadNotice />
    </Suspense>
  );
}
