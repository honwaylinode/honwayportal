<style>
div#tab-order-edit textarea {
  width: 800px;
  height: 400px;
}

div#tab-order-edit button{
}

</style>

<template>
  <div id="tab-order-edit">
    <button v-on:click = "saveOrderRawData">Save</button>
    <textarea id="order-editor" v-model="order_rawdata">
    </textarea>
  </div>
</template>

<script>
  import axios from 'axios';

export default { 
  props: ['order_rawdata'],

  computed : {
    rawdata () {
      return this.order_rawdata.substring(0).trim();
    }
  },

   methods : {
    saveOrderRawData() {
      var rawData = this.rawdata;
      var order_id = sessionStorage.getItem('order_search_keyword');
      if (order_id != undefined) {
        var _access_token = sessionStorage.getItem('access_token');
        axios.post('/api/orders/raw/save',{
          id : order_id,
          access_token : _access_token,
          raw_data: rawData
        }).then(response => {
          if (response.data.success) {
            alert("Order raw data saved successfully!");
          } else {
            alert(response.data.error);
          }
        }).catch(error => {
          alert(error);
        });
      }

    }
   }
}
  </script>
