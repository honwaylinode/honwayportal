<template>
  <div id="tab-order-view">
    <p v-for = "value, key in order">{{ key }} : {{ value }}</p>
  </div>
</template>

<script>
  export default {
    props : ['order']
  }  
  </script>
