import { DemoRoute } from "./demoCases";

export type AutomationState = "waiting" | "active" | "permission" | "complete" | "attention";
export type AutomationAction = { title: string; detail: string; tool: string };

export const scanActions: AutomationAction[] = [
  { title: "File received", detail: "Notice added securely to this demo case", tool: "Camera" },
  { title: "Image quality checked", detail: "Page is clear enough to read", tool: "Document reader" },
  { title: "Notice details read", detail: "Issuer, dates and notice text located", tool: "Notice reader" },
  { title: "Reference found", detail: "Case reference extracted", tool: "Case storage" },
  { title: "Vehicle found", detail: "Registration checked against the notice", tool: "Vehicle details" },
  { title: "Amounts detected", detail: "Charge and discounted amount identified", tool: "Notice reader" },
  { title: "Deadlines detected", detail: "Payment and appeal dates identified", tool: "Calendar" },
  { title: "Issuer domain checked", detail: "Payment destination compared with issuer", tool: "Safe-link checker" },
  { title: "Notice format checked", detail: "Required details and appeal route reviewed", tool: "Knowledge base" },
  { title: "Correct route selected", detail: "ParkPal is ready to guide the next action", tool: "Case tracker" },
];

export const submissionActions: Record<DemoRoute, AutomationAction[]> = {
  scam: [
    { title:"Collecting report details", detail:"Sender, amount and suspicious link added", tool:"Case storage" },
    { title:"Checking official directory", detail:"Named issuer could not be matched", tool:"Operator directory" },
    { title:"Adding notice attachment", detail:"suspicious-notice.jpg", tool:"Cloud storage" },
    { title:"Selecting report recipient", detail:"Correct reporting mailbox selected", tool:"Email" },
    { title:"Sending report", detail:"Demo report sent with your approval", tool:"Email" },
    { title:"Saving confirmation", detail:"Report reference stored in the case", tool:"Case tracker" },
  ],
  pay: [
    { title:"Finding official portal", detail:"Council domain verified", tool:"Payment portal" },
    { title:"Copying notice details", detail:"Reference and vehicle prepared", tool:"Case storage" },
    { title:"Preparing amount", detail:"Discounted amount selected", tool:"Payment provider" },
    { title:"Pre-filling safe fields", detail:"No banking details entered", tool:"Payment portal" },
    { title:"Saving receipt", detail:"Demo confirmation added to the case", tool:"Cloud storage" },
    { title:"Updating reminders", detail:"Calendar events marked complete", tool:"Calendar" },
  ],
  appeal: [
    { title:"Opening appeal channel", detail:"Northstar Appeals selected", tool:"Official portal" },
    { title:"Inserting case details", detail:"Reference and registration added", tool:"Case tracker" },
    { title:"Adding appeal statement", detail:"Confirmed facts only", tool:"Email" },
    { title:"Uploading payment receipt", detail:"parking-receipt-demo.png", tool:"Cloud storage" },
    { title:"Reviewing attachments", detail:"Evidence names and formats checked", tool:"Document reader" },
    { title:"Submitting appeal", detail:"Demo submission sent with approval", tool:"Official portal" },
    { title:"Waiting for confirmation", detail:"Submission receipt requested", tool:"Email" },
    { title:"Confirmation received", detail:"APL-2026-4178", tool:"Email" },
    { title:"Saving receipt", detail:"Confirmation stored with the case", tool:"Cloud storage" },
    { title:"Adding response reminder", detail:"28-day follow-up created", tool:"Calendar" },
    { title:"Updating case timeline", detail:"Waiting for operator decision", tool:"Case tracker" },
  ],
};

export const connections = {
  scam: ["Operator directory", "Safe-link checker", "Email", "Reporting service"],
  pay: ["Calendar", "Email", "Payment portal", "Case storage"],
  appeal: ["Email", "Appeal portal", "Calendar", "Cloud storage", "PDF export", "Case tracker"],
} satisfies Record<DemoRoute, string[]>;
