function get_sha512(text) {
  var hash = crypto.createHash("sha512");
  hash.update(text)
  var value = hash.digest("hex");
  return value;
}

function test_user_name_in_access_token(access_token)
{
  const UserAuthenticator = require(__dirname + "/../libs/user_authenticator");
  UserAuthenticator.init([], config.app_secret);
  var info = UserAuthenticator.getAccessTokenInfo(access_token);
  expect(info.username).to.equal(testAccount.username);
  expect(info.password_hash).to.equal(get_sha512(testAccount.password));
}

function test_order_view(access_token)
{
//test order view
  request({
    url: 'http://127.0.0.1/api/orders', //URL to hit
    method: 'POST', //Specify the method
    form: {
      id : 't16_01-02',
      access_token : access_token
    }
  }, function(error, response, body){
    if(error) {
      console.log(error);
    } else {
      if (response.statusCode == 200){
        var data = JSON.parse(body);
        if (data.success) {
          try{
            expect(data.data).to.have.property('name');
            expect(data.data).to.have.property('farm');
          } catch(err) {
            console.log(err);
          }
        }
      }
    }
  });

}

function test_order_rawdata_view(access_token)
{
request({
    url: 'http://127.0.0.1/api/orders/raw', //URL to hit
    method: 'POST', //Specify the method
    form: {
      id : 't16_01-02',
      access_token : access_token
    }
  }, function(error, response, body){
    if(error) {
      console.log(error);
    } else {
      if (response.statusCode == 200){
        var data = JSON.parse(body);
        if (data.success) {
          try{
            assert(data.data.length > 0);
            assert(data.data.includes('[pssk.meat]'));
          } catch(err) {
            console.log(err);
          }
        }
      }
    }
  });

}

function test_invoice_job_creation(access_token)
{
request({
    url: 'http://127.0.0.1/api/jobs/create', //URL to hit
    method: 'POST', //Specify the method
    form: {
      access_token : access_token,
      id : 't16_01-02',
      type : 'invoice'
    }
  }, function(error, response, body){
    if(error) {
      console.log(error);
    } else {
      if (response.statusCode == 200){
        var data = JSON.parse(body);
        assert(data.success == true); 
      }
    }
  });

}

"use strict";

var request = require('request');
var expect = require('chai').expect;
var assert = require('chai').assert;

var fs = require('fs');
var crypto = require('crypto');

var content = fs.readFileSync(__dirname + "/../config_dev.json").toString();
var config = JSON.parse(content);
var app_secret = config.app_secret;

var testAccount = {
  username: 'jim.huang',
  password: '123456'
}

//test user authentication
request({
  url: 'http://127.0.0.1/api/user/authenticate', //URL to hit
  method: 'POST', //Specify the method
  form: testAccount
}, function(error, response, body){
  if(error) {
    console.log(error);
  } else {
    if (response.statusCode == 200){
      var data = JSON.parse(body);
      if (data.success) {
        try{
          test_user_name_in_access_token(data.access_token);
          test_order_view(data.access_token);
          test_order_rawdata_view(data.access_token);
          test_invoice_job_creation(data.access_token);
        } catch(err) {
          console.log(err);
        }
      }
    }
  }
});
