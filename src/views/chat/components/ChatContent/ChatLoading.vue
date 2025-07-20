<template>
  <div class="wave-loading">
    <span class="dot" v-for="n in 3" :key="n" :style="{ animationDelay: `${(n - 1) * 0.2}s` }" />
  </div>
</template>

<script setup></script>

<style scoped>
.wave-loading {
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  height: 20px;
  gap: 6px;
}

.dot {
  width: 10px;
  height: 10px;
  background-color: black;
  border-radius: 50%;
  animation: waveBounce 1s infinite ease-in-out;
}

@keyframes waveBounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 1;
  }
  30% {
    transform: translateY(-8px);
    opacity: 0.6;
  }
}
</style>
