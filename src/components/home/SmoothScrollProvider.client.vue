<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";

let animationFrame = 0;
let cleanup: (() => void) | undefined;

onMounted(() => {
  let disposed = false;
  cleanup = () => {
    disposed = true;
  };

  void (async () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice =
      window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(hover: none)").matches;

    if (prefersReducedMotion || isTouchDevice) {
      return;
    }

    const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] = await Promise.all([
      import("lenis"),
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]);

    if (disposed) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1,
    });

    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    const raf = (time: number) => {
      lenis.raf(time);
      animationFrame = window.requestAnimationFrame(raf);
    };

    animationFrame = window.requestAnimationFrame(raf);

    cleanup = () => {
      disposed = true;

      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }

      lenis.destroy();
    };
  })();
});

onBeforeUnmount(() => {
  cleanup?.();
});
</script>

<template>
  <slot />
</template>
