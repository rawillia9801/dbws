"use client";

import { useActionState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { submitInquiry, type InquiryState } from "@/app/start/actions";

const initialState: InquiryState = { status: "idle", message: "" };

type InquiryFormProps = {
  requestedService: "general" | "website-personalization" | "custom-website" | "business-voice";
  requestedServiceLabel: string;
};

export function InquiryForm({ requestedService, requestedServiceLabel }: InquiryFormProps) {
  const [state, action, pending] = useActionState(submitInquiry, initialState);
  const hasSpecificService = requestedService !== "general";

  return (
    <form className="inquiry-form" action={action}>
      <h2>{hasSpecificService ? `Request ${requestedServiceLabel}` : "Tell us about your program"}</h2>
      <p className="form-intro">
        {hasSpecificService
          ? `${requestedServiceLabel} is completely optional. Your standard $89 setup + $20/month website service works without this add-on.`
          : "Use this form for general website questions or optional launch help. The standard website service already includes everything required to build, launch, host, and operate your site."}
      </p>
      <input type="hidden" name="requestedService" value={requestedService} />
      <div className="form-grid">
        <div className="field">
          <label htmlFor="name">Your name</label>
          <input id="name" name="name" autoComplete="name" required maxLength={100} />
        </div>
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} />
        </div>
        <div className="field">
          <label htmlFor="kennelName">Kennel or program name</label>
          <input id="kennelName" name="kennelName" autoComplete="organization" maxLength={140} />
        </div>
        <div className="field">
          <label htmlFor="breed">Breed</label>
          <input id="breed" name="breed" required maxLength={120} />
        </div>
        <div className="field field-full">
          <label htmlFor="website">Current website, if you have one</label>
          <input id="website" name="website" inputMode="url" placeholder="https://" maxLength={240} />
        </div>
        <div className="field field-full">
          <label htmlFor="timeline">When would you like to launch?</label>
          <select id="timeline" name="timeline" defaultValue="exploring" required>
            <option value="as-soon-as-possible">As soon as possible</option>
            <option value="one-to-two-months">Within one to two months</option>
            <option value="three-plus-months">Three months or later</option>
            <option value="exploring">I am exploring my options</option>
          </select>
        </div>
        <div className="field field-full">
          <label htmlFor="goals">{hasSpecificService ? "What should we know about this request?" : "What do you want your new website to accomplish?"}</label>
          <textarea
            id="goals"
            name="goals"
            required
            minLength={10}
            maxLength={2000}
            placeholder={hasSpecificService
              ? `Tell us what you would like included with ${requestedServiceLabel}.`
              : "Tell us about your dogs, puppies, current challenges, and the pages or features you need."}
          />
        </div>
        <div className="honeypot" aria-hidden="true">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" tabIndex={-1} autoComplete="off" />
        </div>
      </div>
      <div className="form-footer">
        <p className={`form-status ${state.status}`} role="status" aria-live="polite">{state.message}</p>
        <button className="button button-primary" type="submit" disabled={pending}>
          {pending ? <><LoaderCircle size={18} className="spin" /> Sending…</> : <>{hasSpecificService ? "Send Optional Service Request" : "Send My Request"} <ArrowRight size={18} /></>}
        </button>
      </div>
    </form>
  );
}
