export const driverPricing = {
  feeRate: 0.2,
  headline: "No win, no ParkPal fee.",
  includes: ["Free notice scan", "Free initial assessment", "Free evidence checklist", "No upfront appeal fee"],
};

export const fleetPlans = [
  { name: "Starter", price: "£299", cadence: "/ month", audience: "Up to approximately 50 vehicles", volume: "Up to 100 cases per month", features: ["Deadline automation", "Evidence requests", "Appeal drafting", "Email and calendar connections", "Basic reporting"] },
  { name: "Growth", price: "£799", cadence: "/ month", audience: "Approximately 51–250 vehicles", volume: "Up to 500 cases per month", featured: true, features: ["Multiple team members", "Automated appeal workflows", "Payment and escalation tracking", "Advanced reporting", "Multi-depot support", "Priority support"] },
  { name: "Enterprise", price: "From £1,500", cadence: "/ month", audience: "More than 250 vehicles", volume: "Custom notice volume", features: ["Fleet-system integrations", "Custom approval workflows", "Single sign-on and audit logs", "Custom templates", "Priority onboarding", "Dedicated support"] },
];

export const pricingDetails = {
  overage: "£1–£3 per additional processed notice or appeal, depending on plan and volume.",
  onboarding: "£500–£2,000 for enterprise setup, integrations and workflow configuration.",
  pilot: "Eligible fleets can start with a limited 14-day or 30-day pilot.",
};
