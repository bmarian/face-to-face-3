<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container class="ftf-page-container">
      <div class="ftf-background">
        <svg class="ftf-background__top" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#282a36" fill-opacity="1" d="M0,288L48,256C96,224,192,160,288,154.7C384,149,480,203,576,229.3C672,256,768,256,864,240C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
        <svg class="ftf-background__bottom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#282a36" fill-opacity="1" d="M0,128L34.3,128C68.6,128,137,128,206,112C274.3,96,343,64,411,69.3C480,75,549,117,617,154.7C685.7,192,754,224,823,208C891.4,192,960,128,1029,96C1097.1,64,1166,64,1234,58.7C1302.9,53,1371,43,1406,37.3L1440,32L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path>
        </svg>
      </div>
      <div class="ftf-content"> <router-view/> </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FtfLayout',
});
</script>

<style lang="scss"></style>
