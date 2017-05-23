<style>
.search{
  margin-top: 40px;
}

div#order-control-panel {
  margin-top: 0px;
}

div#order-control-panel button {
  text-decoration: none;
  font-weight:bold;
}

</style>

<template>
  <div>
    <h1>Welcome</h1>
    <div class="logout"><a href="/" @click= "doLogout" onclick="return false">Logout</a></div>
    <div class="search">
        <span>
            <label>Search Order</label>
            <input id="order_search" @keyup.enter = "onSearchEnter" v-model = "order_search_keyword"></input>
            <button @click= "onOrderSearchEnter">Search</button>
        </span>

        <span style="margin-left: 20px">
            <label>Search Loads</label>
            <input id="load_search" @keyup.enter = "onSearchEnter" v-model = "load_search_keyword"></input>
            <button @click= "onLoadSearchEnter">Search</button>
        </span>

    </div>
    <div v-if = "order_found == 1">
        <h4>Order: {{order.name}}</h4>
        <div id="order-control-panel">
            <button v-if= "hasPermission('view')" class="view" @click = "viewOrder">View</button>
            <button v-if= "hasPermission('edit')" class="edit" @click = "editOrder">Edit</button>
            <button v-if= "hasPermission('document')" class="document" @click = "showDocumentCenter">Documents Center</button>
            <OrderView v-if="currentTabIs('view')" v-bind:order = "order"></OrderView>
            <OrderEditor v-if="currentTabIs('edit')" v-bind:order_rawdata = "order_rawdata"></OrderEditor>
            <DocumentCenter v-if="currentTabIs('document')" v-bind:order = "order"></DocumentCenter>
        </div>
    </div>
  </div>
</template>

<script>
    import axios from 'axios';

var data = {
    'permissions' : '',
    'order_found' : 0, //default, order not found
    'order' : {},
    'order_rawdata' : {},
    'order_search_keyword' : '',
    'current_order_tab' : '' //current order tab, default to not selected

}

//we need to "flatten out" the method definitions in order to make sure "this" works on v-model
var hooks = {};
var authentication = {};
var methods = {};
var components = {};

methods.currentTabIs = function(tab) {
    return this.current_order_tab == tab; 
}

methods.hasPermission = function(permission) {
    return this.permissions.includes(permission);
}

methods.onOrderSearchEnter = function(event) {
    var keyword = this.order_search_keyword;
    keyword = keyword.trim();
    sessionStorage.setItem('order_search_keyword', keyword);
    if (keyword.length == 0) {
        alert("Keyword is empty!");
        return;
    }

    this._loadOrderFromSearch();
    this.current_order_tab = "view"; //this will update the view
    this.order_search_keyword = "";
}

methods.viewOrder = function(event) {
    this.current_order_tab = "view";
    this._loadOrderFromSearch();
}

methods.editOrder = function(event) {
    this.current_order_tab = "edit";
    var order_id = sessionStorage.getItem('order_search_keyword');
    if (order_id != undefined) {
        var _access_token = sessionStorage.getItem('access_token');
        axios.post('/api/orders/raw',{
            id : order_id,
            access_token : _access_token
        }).then(response => {
            if (response.data.success && response.data.data.length > 0) {
                this.order_rawdata = response.data.data;
            } else {
                this.order_rawdata = response.data.error;
            }
        }).catch(error => {
            alert(error);
        });
    }
}

methods.showDocumentCenter = function(event) {
    this.current_order_tab = "document";
}

methods._loadOrderFromSearch = function() {
    var _access_token = sessionStorage.getItem('access_token');
    var _keyword = sessionStorage.getItem('order_search_keyword');

    axios.post('/api/orders',{
        id : _keyword,
        access_token : _access_token
    }).then(response => {
        this.order_found = 1;
        this.order = response.data.data;
    }).catch(error => {
        alert(error);
    });
}

methods.doLogout = function(event) {
    var _access_token = sessionStorage.getItem('access_token');
    axios.post('/api/user/logout',{
        access_token : _access_token
    }).then(response => {
        if (response.body.success) {
            sessionStorage.clear(); //clear session storage
            location.reload(true);
        }
    }).catch(error => {
        //on error, we at least redirect user to home page 
        sessionStorage.clear(); //clear session storage
        location.reload(true);
    });
    return false;
}

hooks.mounted = function() {
    this.permissions = sessionStorage.getItem('permissions');
}

components.OrderView = require("./OrderView.vue");
components.OrderEditor = require("./OrderEditor.vue");
components.DocumentCenter = require("./DocumentCenter.vue");

export default {
    'data' : function() {
        return data;  
    },
    'methods' : methods,
    'mounted' : hooks.mounted,
    'components' : components
}

    </script>
