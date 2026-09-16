"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

declare global {
  interface Window {
    MauticSDK?: { onLoad: () => void };
  }
}

/**
 * The "Book Aliaflow Event" Mautic form (form id 19), converted from raw
 * Mautic HTML into JSX the way BriefForm.tsx already does: the field names,
 * ids and data-validate attributes are kept verbatim so Mautic's own script
 * still recognises and submits the form, but every class is ours.
 */
function EventBookingForm() {
  return (
    <div id="mauticform_wrapper_bookaliaflowevent" className="event-modal-form-wrapper mauticform_wrapper">
      <form
        autoComplete="false"
        role="form"
        method="post"
        action="http://crm.houseoftechnocrats.ir/form/submit?formId=19"
        id="mauticform_bookaliaflowevent"
        data-mautic-form="bookaliaflowevent"
        encType="multipart/form-data"
      >
        <div className="mauticform-error event-modal-error" id="mauticform_bookaliaflowevent_error" aria-live="polite" />
        <div className="mauticform-message event-modal-message" id="mauticform_bookaliaflowevent_message" aria-live="polite" />
        <div className="mauticform-innerform">
          <div className="mauticform-page-wrapper mauticform-page-1" data-mautic-form-page="1">
            <div id="mauticform_bookaliaflowevent_first_name" className="event-modal-field mauticform-row mauticform-text mauticform-field-1 mauticform-required" data-validate="first_name" data-validation-type="text">
              <label id="mauticform_label_bookaliaflowevent_first_name" htmlFor="mauticform_input_bookaliaflowevent_first_name" className="event-modal-label mauticform-label">First Name</label>
              <input type="text" name="mauticform[first_name]" id="mauticform_input_bookaliaflowevent_first_name" className="event-modal-input mauticform-input" required />
              <span className="mauticform-errormsg event-modal-errormsg" aria-live="polite" aria-atomic="true" aria-hidden="true" style={{ display: "none" }}>This is required.</span>
            </div>

            <div id="mauticform_bookaliaflowevent_last_name" className="event-modal-field mauticform-row mauticform-text mauticform-field-2 mauticform-required" data-validate="last_name" data-validation-type="text">
              <label id="mauticform_label_bookaliaflowevent_last_name" htmlFor="mauticform_input_bookaliaflowevent_last_name" className="event-modal-label mauticform-label">Last Name</label>
              <input type="text" name="mauticform[last_name]" id="mauticform_input_bookaliaflowevent_last_name" className="event-modal-input mauticform-input" required />
              <span className="mauticform-errormsg event-modal-errormsg" aria-live="polite" aria-atomic="true" aria-hidden="true" style={{ display: "none" }}>This is required.</span>
            </div>

            <div id="mauticform_bookaliaflowevent_phone_number" className="event-modal-field mauticform-row mauticform-tel mauticform-field-3 mauticform-required" data-validate="phone_number" data-validation-type="tel">
              <label id="mauticform_label_bookaliaflowevent_phone_number" htmlFor="mauticform_input_bookaliaflowevent_phone_number" className="event-modal-label mauticform-label">Phone Number</label>
              <input type="tel" name="mauticform[phone_number]" id="mauticform_input_bookaliaflowevent_phone_number" className="event-modal-input mauticform-input" required />
              <span className="mauticform-errormsg event-modal-errormsg" aria-live="polite" aria-atomic="true" aria-hidden="true" style={{ display: "none" }}>This is required.</span>
            </div>

            <div id="mauticform_bookaliaflowevent_email" className="event-modal-field mauticform-row mauticform-email mauticform-field-4 mauticform-required" data-validate="email" data-validation-type="email">
              <label id="mauticform_label_bookaliaflowevent_email" htmlFor="mauticform_input_bookaliaflowevent_email" className="event-modal-label mauticform-label">Email</label>
              <input type="email" name="mauticform[email]" id="mauticform_input_bookaliaflowevent_email" className="event-modal-input mauticform-input" required />
              <span className="mauticform-errormsg event-modal-errormsg" aria-live="polite" aria-atomic="true" aria-hidden="true" style={{ display: "none" }}>This is required.</span>
            </div>

            <div id="mauticform_bookaliaflowevent_submit" className="event-modal-submit-row mauticform-row mauticform-button-wrapper mauticform-field-5">
              <button className="mauticform-button event-modal-submit" name="mauticform[submit]" value="1" id="mauticform_input_bookaliaflowevent_submit" type="submit">
                Reserve my seat <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </div>
        <input type="hidden" name="mauticform[formId]" id="mauticform_bookaliaflowevent_id" value="19" />
        <input type="hidden" name="mauticform[return]" id="mauticform_bookaliaflowevent_return" value="" />
        <input type="hidden" name="mauticform[formName]" id="mauticform_bookaliaflowevent_name" value="bookaliaflowevent" />
      </form>
    </div>
  );
}

/**
 * Trigger button + popup for the event-booking form above. Used wherever a
 * landing CTA is about reserving a seat at an event, so booking happens
 * without leaving the page. <MauticLoader/> in layout.tsx already loaded
 * mautic-form.js once, site-wide; it only binds to forms that existed in the
 * DOM at that time, so mounting this one on open needs to trigger a re-scan
 * via MauticSDK.onLoad() — the same call the SDK's own snippet makes when
 * MauticSDKLoaded is already true.
 */
export function EventBookingModal({
  eventName,
  eventDate,
  triggerLabel,
  triggerClassName,
}: {
  eventName: string;
  eventDate?: string;
  triggerLabel: string;
  triggerClassName: string;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    window.MauticSDK?.onLoad();
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => setOpen(true)}>
        {triggerLabel}
      </button>
      {open
        ? createPortal(
            <div
              className="event-modal-overlay"
              onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}
            >
              <div className="event-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
                <button type="button" ref={closeRef} className="event-modal-close" onClick={() => setOpen(false)} aria-label="Close">
                  <span aria-hidden="true">✕</span>
                </button>
                <p className="event-modal-eyebrow">Reserve your seat</p>
                <h2 id={titleId} className="event-modal-title">{eventName}</h2>
                {eventDate ? <p className="event-modal-date">{eventDate}</p> : null}
                <EventBookingForm />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
