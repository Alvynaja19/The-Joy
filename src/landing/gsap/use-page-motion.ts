"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function usePageMotion<T extends HTMLElement>(rootRef: RefObject<T | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      return;
    }

    const ctx = gsap.context(() => {
      const heroItems = root.querySelectorAll("[data-hero-reveal]");
      if (heroItems.length > 0) {
        gsap.from(heroItems, {
          y: 22,
          opacity: 0,
          duration: 0.72,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "transform,opacity",
        });
      }

      const scrollItems = root.querySelectorAll("[data-scroll-reveal]");
      scrollItems.forEach((element) => {
        gsap.from(element, {
          y: 26,
          opacity: 0,
          duration: 0.68,
          ease: "power2.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: element,
            start: "top 86%",
            once: true,
          },
        });
      });

      ScrollTrigger.refresh();
    }, root);

    return () => {
      ctx.revert();
    };
  }, [rootRef]);
}
