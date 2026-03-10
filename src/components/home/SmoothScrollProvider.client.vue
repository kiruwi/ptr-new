<script setup lang="ts">
import Lenis from "lenis";
import { onBeforeUnmount, onMounted } from "vue";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let animationFrame = 0;
let lenis: Lenis | null = null;

onMounted(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchOrMobile =
    window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(max-width: 700px)").matches;

  if (prefersReducedMotion || isTouchOrMobile) {
    return;
  }

  lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
  });

  lenis.on("scroll", () => {
    ScrollTrigger.update();
  });

  const raf = (time: number) => {
    lenis?.raf(time);
    animationFrame = window.requestAnimationFrame(raf);
  };

  animationFrame = window.requestAnimationFrame(raf);
});

onBeforeUnmount(() => {
  if (animationFrame) {
    window.cancelAnimationFrame(animationFrame);
  }

  lenis?.destroy();
  lenis = null;
});
</script>

<template>
  <slot />
</template>
