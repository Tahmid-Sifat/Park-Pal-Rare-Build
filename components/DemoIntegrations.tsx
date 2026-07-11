import { CalendarDays, Check, Circle, Cloud, CreditCard, ExternalLink, FileCheck2, Mail, ShieldCheck } from "lucide-react";
import { AutomationAction } from "@/lib/demo/automation";

const iconFor = (name: string) => name.includes("Calendar") ? CalendarDays : name.includes("Email") ? Mail : name.includes("portal") || name.includes("Portal") ? ExternalLink : name.includes("Payment") ? CreditCard : name.includes("storage") ? Cloud : name.includes("checker") || name.includes("directory") ? ShieldCheck : FileCheck2;

export function ConnectedTools({ tools, permission }: { tools: string[]; permission?: string }) {
  return <section className="connections"><div className="section-label">ParkPal connections</div><div className="connection-grid">{tools.map((name) => { const Icon=iconFor(name); const needs=permission===name; return <div className={needs?"needs-permission":"connected"} key={name}><Icon/><span><strong>{name}</strong><small>{needs?"Permission needed":"Connected"}</small></span>{needs?<Circle/>:<Check/>}</div> })}</div></section>
}

export function AutomationTimeline({ actions, current }: { actions: AutomationAction[]; current: number }) {
  return <div className="automation-timeline">{actions.map((action,index)=>{ const state=index<current?"complete":index===current?"active":"waiting"; const Icon=iconFor(action.tool); return <div className={state} key={action.title}><span className="automation-node">{state==="complete"?<Check/>:<Icon/>}</span><section><strong>{action.title}</strong><p>{action.detail}</p><small>{action.tool} · {state==="complete"?"Completed":state==="active"?"In progress":"Waiting"}</small></section></div>})}</div>
}
