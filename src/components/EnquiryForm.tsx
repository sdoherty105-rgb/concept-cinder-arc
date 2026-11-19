"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  budgets,
  fieldOrder,
  meetingPlaces,
  projectTypes,
  serviceToType,
  timings,
  validateEnquiry,
  type EnquiryErrors,
  type EnquiryValues,
} from "@/lib/enquiry";

const labels: Record<keyof EnquiryValues, string> = {
  name: "Your name",
  email: "Email",
  phone: "Phone",
  projectType: "Type of project",
  location: "Suburb or site location",
  budget: "Indicative budget",
  timing: "Ideal timing",
  meeting: "Where you'd like to meet",
  message: "About the project",
};

const fieldId = (k: keyof EnquiryValues) => (k === "projectType" ? "enquiry-type-new-home" : `enquiry-${k}`);

/**
 * Demo-only consultation form. It validates in the browser and shows a
 * success state, and it never sends anything: there is no action, no
 * fetch, and method="dialog" makes a no-JavaScript submit a no-op.
 */
export function EnquiryForm() {
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Native validation stays on without JavaScript; once hydrated, the form takes over with
  // accessible inline messages. A ?service= link from the services section preselects the type.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    form.noValidate = true;
    const service = new URLSearchParams(window.location.search).get("service");
    const type = service ? serviceToType[service] : undefined;
    const radio = type ? form.querySelector<HTMLInputElement>(`#enquiry-type-${type}`) : null;
    if (radio) radio.checked = true;
  }, [submittedName]);

  useEffect(() => {
    if (submittedName !== null) successRef.current?.focus();
  }, [submittedName]);

  const read = (form: HTMLFormElement): EnquiryValues => {
    const d = new FormData(form);
    const s = (k: string) => String(d.get(k) ?? "");
    return {
      name: s("name"),
      email: s("email"),
      phone: s("phone"),
      projectType: s("projectType"),
      location: s("location"),
      budget: s("budget"),
      timing: s("timing"),
      meeting: s("meeting"),
      message: s("message"),
    };
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values = read(e.currentTarget);
    const next = validateEnquiry(values);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    // Demo only: the values are discarded here. Nothing is stored or transmitted.
    setSubmittedName(values.name.trim().split(/\s+/)[0]);
  };

  const onFieldBlur = (k: keyof EnquiryValues) => {
    if (!errors[k] || !formRef.current) return;
    const next = validateEnquiry(read(formRef.current));
    setErrors((prev) => {
      const copy = { ...prev };
      if (next[k]) copy[k] = next[k];
      else delete copy[k];
      return copy;
    });
  };

  const reset = () => {
    setSubmittedName(null);
    setErrors({});
  };

  if (submittedName !== null) {
    return (
      <div className="enquiry-success" data-testid="enquiry-success">
        <p className="eyebrow">Demo form</p>
        <h3 ref={successRef} tabIndex={-1}>
          Thank you, {submittedName}. This was a demonstration.
        </h3>
        <p>
          Your enquiry was checked in your browser and then discarded. <strong>Nothing was sent or stored</strong>,
          and no data left this page.
        </p>
        <p>
          On a live Cinder Arc site this is where you would be told when to expect a reply and how the first
          consultation works.
        </p>
        <button type="button" className="button button-quiet" onClick={reset}>
          Start a new enquiry
        </button>
      </div>
    );
  }

  const errorKeys = fieldOrder.filter((k) => errors[k]);
  const describe = (k: keyof EnquiryValues, hint?: string) =>
    [hint, errors[k] ? `${fieldId(k)}-error` : undefined].filter(Boolean).join(" ") || undefined;
  const err = (k: keyof EnquiryValues) =>
    errors[k] ? (
      <p className="field-error" id={`${fieldId(k)}-error`}>
        <span aria-hidden="true">!</span> {errors[k]}
      </p>
    ) : null;

  return (
    <form
      ref={formRef}
      className="enquiry-form"
      method="dialog"
      onSubmit={onSubmit}
      aria-describedby="enquiry-demo-note"
      data-testid="enquiry-form"
    >
      <p className="enquiry-demo-note" id="enquiry-demo-note">
        <span className="tag">Demo</span>
        This form is a demonstration. It checks your entries in the browser and never sends them anywhere.
      </p>

      {errorKeys.length > 0 ? (
        <div className="error-summary" ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby="error-summary-title">
          <h3 id="error-summary-title">Please check {errorKeys.length === 1 ? "one detail" : `${errorKeys.length} details`}</h3>
          <ul>
            {errorKeys.map((k) => (
              <li key={k}>
                <a href={`#${fieldId(k)}`}>
                  {labels[k]}: {errors[k]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="field-row">
        <div className="field">
          <label htmlFor="enquiry-name">
            {labels.name} <span className="req">(required)</span>
          </label>
          <input
            id="enquiry-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describe("name")}
            onBlur={() => onFieldBlur("name")}
          />
          {err("name")}
        </div>
        <div className="field">
          <label htmlFor="enquiry-email">
            {labels.email} <span className="req">(required)</span>
          </label>
          <input
            id="enquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describe("email")}
            onBlur={() => onFieldBlur("email")}
          />
          {err("email")}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="enquiry-phone">
            {labels.phone} <span className="opt">(optional)</span>
          </label>
          <input
            id="enquiry-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={describe("phone")}
            onBlur={() => onFieldBlur("phone")}
          />
          {err("phone")}
        </div>
        <div className="field">
          <label htmlFor="enquiry-location">
            {labels.location} <span className="opt">(optional)</span>
          </label>
          <input id="enquiry-location" name="location" type="text" autoComplete="address-level2" />
        </div>
      </div>

      <fieldset
        className="field choice-group"
        aria-invalid={errors.projectType ? true : undefined}
        aria-describedby={errors.projectType ? `${fieldId("projectType")}-error` : undefined}
      >
        <legend>
          {labels.projectType} <span className="req">(required)</span>
        </legend>
        <div className="choices">
          {projectTypes.map((t) => (
            <label className="choice" key={t.value} htmlFor={`enquiry-type-${t.value}`}>
              <input
                type="radio"
                id={`enquiry-type-${t.value}`}
                name="projectType"
                value={t.value}
                required
                onChange={() => {
                  if (errors.projectType)
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.projectType;
                      return copy;
                    });
                }}
              />
              <span>{t.label}</span>
            </label>
          ))}
        </div>
        {err("projectType")}
      </fieldset>

      <div className="field-row">
        <div className="field">
          <label htmlFor="enquiry-budget">
            {labels.budget} <span className="opt">(optional)</span>
          </label>
          <select id="enquiry-budget" name="budget" defaultValue="">
            <option value="">Select a range</option>
            {budgets.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="enquiry-timing">
            {labels.timing} <span className="opt">(optional)</span>
          </label>
          <select id="enquiry-timing" name="timing" defaultValue="">
            <option value="">Select timing</option>
            {timings.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="field choice-group">
        <legend>
          {labels.meeting} <span className="opt">(optional)</span>
        </legend>
        <div className="choices">
          {meetingPlaces.map((m) => (
            <label className="choice" key={m.value} htmlFor={`enquiry-meeting-${m.value}`}>
              <input type="radio" id={`enquiry-meeting-${m.value}`} name="meeting" value={m.value} />
              <span>{m.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="enquiry-message">
          {labels.message} <span className="req">(required)</span>
        </label>
        <p className="field-hint" id="enquiry-message-hint">
          The site, the house you have now, and how you would like the new one to feel.
        </p>
        <textarea
          id="enquiry-message"
          name="message"
          rows={5}
          required
          minLength={20}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describe("message", "enquiry-message-hint")}
          onBlur={() => onFieldBlur("message")}
        />
        {err("message")}
      </div>

      <div className="form-actions">
        <button type="submit" className="button">
          Request a consultation
        </button>
        <p className="form-small">Demo only. Submitting shows a confirmation; no data is sent.</p>
      </div>
      <noscript>
        <p className="form-small">
          JavaScript is off, so submitting this demo form does nothing at all. It never sends data either way.
        </p>
      </noscript>
    </form>
  );
}
