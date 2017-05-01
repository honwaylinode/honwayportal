<template>
  <div id="document-center-panel">
    <ul>
      <li><a href="" @click.prevent = "startJob('invoice')">Generate Order Invoice</a></li>
      <div id="Progressbar-invoice" v-if = "percentage.invoice.length > 0">
        <label>Progress : </label><span>{{ percentage.invoice }} %</span>
        <a v-bind:href="download.invoice" target = "_blank" v-if="percentage.invoice == '100'">Open</a> 
      </div>
    </ul>
  </div>
</template>

<script>
  export default {
    props : ['order'],

    data () {
      return {
        percentage : {
          invoice : ''
        },
        download : {
          invoice : ''
        }
      }
    },

    mounted () {
      this.wsUrl = "ws://" + location.host + "/ws/jobs/progress";
      if (location.protocol == "https:") {
        this.wsUrl = "wss://" + location.host + "/ws/jobs/progress";
      }
      this.ws = new WebSocket(this.wsUrl);

      //try to keep the websocket alive by sending message every 10 seconds
      this.ws.onopen = () => {
        setInterval(() => { 
          this.ws.send("keep-alived");
        }, 10000);
      }

    },

    methods : {
      startJob (jobType) {

        //set an empty timer to detect when the websocket connection is lost 
        setInterval(() => {
          if (this.ws.readyState != 1) {
            //reconnect websocket 
            this.ws = new WebSocket(this.wsUrl);
          } 
        }, 6000);


        this.percentage[jobType] = "";
        this.ws.send(JSON.stringify({
          access_token : sessionStorage.getItem('access_token'),
          order_id : sessionStorage.getItem('order_search_keyword'),
          job_type: jobType
        }));

        this.ws.onmessage = (event) => {
          var data = JSON.parse(event.data);
          if (data.job_type.length > 0 && data.percentage != undefined && data.percentage.length > 0 ) {
            this.percentage[data.job_type] = data.percentage; 
            this.download[data.job_type] = "/dist/" + data.target_file;
          }
        }

      },

      openDoc (docName) {
        var win = window.open("/disc/" + docName, '_blank');
        win.focus();
      } 

    }
  }
  </script>
