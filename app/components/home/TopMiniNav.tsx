"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SiteLogo from "./SiteLogo";

const navLinks = [
  { href: "/menu", label: "Our Menu" },
  { href: "#accommodation", label: "Rooms" },
];

export default function TopMiniNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const floatingControlsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        navRef.current?.contains(target) ||
        panelRef.current?.contains(target) ||
        floatingControlsRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <nav className={`top-mini-nav${isOpen ? " is-open" : ""}`} aria-label="Primary" ref={navRef}>
        <div className="top-mini-nav__controls">
          <button
            className={`top-mini-nav__toggle top-mini-nav__toggle--anchor${isOpen ? " is-open" : ""}`}
            type="button"
            aria-expanded={isOpen}
            aria-controls="top-mini-nav-links"
            onClick={() => setIsOpen((open) => !open)}
          >
            <span className="sr-only">{isOpen ? "Close navigation menu" : "Open navigation menu"}</span>
            <span className="top-mini-nav__icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="top-mini-nav__text">Menu</span>
          </button>
        </div>
      </nav>

      {isMounted &&
        isOpen &&
        createPortal(
          <>
            <div className="top-mini-nav__floating-controls" ref={floatingControlsRef}>
              <button
                className="top-mini-nav__toggle top-mini-nav__toggle--floating is-open"
                type="button"
                aria-expanded={isOpen}
                aria-controls="top-mini-nav-links"
                onClick={() => setIsOpen(false)}
              >
                <span className="sr-only">Close navigation menu</span>
                <span className="top-mini-nav__icon" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <span className="top-mini-nav__text">Menu</span>
              </button>
            </div>

            <div
              className="top-mini-nav__panel is-open"
              id="top-mini-nav-links"
              role="dialog"
              aria-modal="true"
              ref={panelRef}
            >
              <section className="top-mini-nav__left image-chef">
                <SiteLogo className="top-mini-nav__logo top-mini-nav__logo--left" />
                <ul className="top-mini-nav__links">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} onClick={() => setIsOpen(false)}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="top-mini-nav__right">
                <address>
                  Karatu Town
                  <br />
                  Arusha Region
                  <br />
                  Tanzania
                </address>
                <a href="tel:+255620600100">+255 620 600 100</a>
                <a href="tel:+255762413810">+255 762 413 810</a>
                <a href="mailto:reservations@patamurestaurants.com">reservations@patamurestaurants.com</a>
                <a href="mailto:sales@patamurestaurants.com">sales@patamurestaurants.com</a>

                <div className="top-mini-nav__social" aria-label="Social links">
                  <a
                    href="https://www.instagram.com/patamu_lodge/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                  >
                    <span className="sr-only">Instagram</span>
                    <svg viewBox="0 0 24 24" role="presentation" focusable="false" aria-hidden="true">
                      <path
                        d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm9.75 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
                        fill="currentColor"
                      />
                    </svg>
                  </a>
                  <a href="https://www.youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                    <span className="sr-only">YouTube</span>
                    <svg viewBox="0 0 24 24" role="presentation" focusable="false" aria-hidden="true">
                      <path
                        d="M23 12s0-3.4-.44-5.03a2.98 2.98 0 0 0-2.1-2.1C18.82 4.43 12 4.43 12 4.43s-6.82 0-8.46.44a2.98 2.98 0 0 0-2.1 2.1A19.9 19.9 0 0 0 1 12c0 1.67.2 3.35.44 5.03a2.98 2.98 0 0 0 2.1 2.1c1.64.44 8.46.44 8.46.44s6.82 0 8.46-.44a2.98 2.98 0 0 0 2.1-2.1C23 15.4 23 12 23 12ZM10 15.5v-7l6 3.5-6 3.5Z"
                        fill="currentColor"
                      />
                    </svg>
                  </a>
                  <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                    <span className="sr-only">Facebook</span>
                    <svg viewBox="0 0 24 24" role="presentation" focusable="false" aria-hidden="true">
                      <path
                        d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V4.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V11H8v3h2.1v8h3.4Z"
                        fill="currentColor"
                      />
                    </svg>
                  </a>
                </div>

              </section>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
