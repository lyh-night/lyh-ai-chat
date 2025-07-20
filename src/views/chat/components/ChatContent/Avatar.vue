<template>
  <div class="avatar-container">
    <div>{{ props.data.message }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: () => {}
  }
})
</script>

<style lang="scss" scoped>
.avatar-container {
  display: flex;
  justify-content: flex-end;
  animation: fadeIn 0.5s ease forwards;
  font-size: 14px;
  margin-bottom: 20px;
  > div {
    max-width: 60%;
    border-radius: 15px;
    background-color: #f2f2f2;
    line-height: 20px;
    padding: 5px 10px;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>
