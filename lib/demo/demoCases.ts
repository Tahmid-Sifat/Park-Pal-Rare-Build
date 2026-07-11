export type DemoRoute = "scam" | "pay" | "appeal";

export type DemoCase = {
  id: DemoRoute;
  title: string;
  noticeType: string;
  issuer: string;
  referenceNumber: string;
  vehicleRegistration: string;
  issueDate: string;
  eventDate: string;
  location: string;
  amount: string;
  discountedAmount?: string;
  paymentDeadline?: string;
  appealDeadline?: string;
  classification: string;
  findings: string[];
  recommendedAction: string;
  portalName?: string;
  portalUrl?: string;
  confirmation: string;
};

export const demoFileMap: Record<string, DemoRoute> = {
  "parkpal-scam-demo.jpg": "scam",
  "parkpal-scam-demo.png": "scam",
  "parkpal-valid-demo.jpg": "pay",
  "parkpal-valid-demo.pdf": "pay",
  "parkpal-appeal-demo.jpg": "appeal",
  "parkpal-appeal-demo.pdf": "appeal",
};

export const demoCases: Record<DemoRoute, DemoCase> = {
  scam: {
    id: "scam", title: "Suspicious notice", noticeType: "Payment request", issuer: "City Parking Services UK",
    referenceNumber: "CPS-884102", vehicleRegistration: "Not shown", issueDate: "10 July 2026", eventDate: "Not shown",
    location: "Not shown", amount: "£120", classification: "Could not be verified",
    findings: ["Payment link does not match the named issuer", "Vehicle details are missing", "No valid appeal process is shown"],
    recommendedAction: "Do not use the payment link. Verify the notice independently.",
    confirmation: "You avoided a potentially unsafe payment route. No payment or personal information was shared."
  },
  pay: {
    id: "pay", title: "Valid notice to pay", noticeType: "Council penalty charge notice", issuer: "Riverton Borough Council",
    referenceNumber: "RVN-246801", vehicleRegistration: "AB12 CDE", issueDate: "8 July 2026", eventDate: "7 July 2026",
    location: "Market Street, Riverton", amount: "£70", discountedAmount: "£35", paymentDeadline: "5 August 2026",
    appealDeadline: "22 July 2026", classification: "Appears valid",
    findings: ["Issuer and reference format match", "Vehicle and location details are consistent", "No strong challenge ground was found"],
    recommendedAction: "Pay the discounted amount by 22 July 2026.", portalName: "Riverton Council payments",
    portalUrl: "payments.riverton.gov.uk/pcn", confirmation: "Payment route prepared and confirmation saved."
  },
  appeal: {
    id: "appeal", title: "Notice that may be challenged", noticeType: "Private parking charge", issuer: "Northstar Parking",
    referenceNumber: "NSP-731955", vehicleRegistration: "AB12 CDE", issueDate: "9 July 2026", eventDate: "5 July 2026",
    location: "Station Approach Car Park", amount: "£100", discountedAmount: "£60", appealDeadline: "6 August 2026",
    classification: "Possible challenge", findings: ["Parking was paid for during the stated time", "Payment record and notice appear to conflict", "A wider signage photo would be helpful"],
    recommendedAction: "Build an evidence-led appeal before 6 August 2026.", portalName: "Northstar Appeals",
    portalUrl: "appeals.northstar-parking.demo", confirmation: "Appeal submitted. Follow-up reminders have been saved."
  }
};

export function matchDemoFile(name: string): DemoRoute | null {
  return demoFileMap[name.toLowerCase()] ?? null;
}
