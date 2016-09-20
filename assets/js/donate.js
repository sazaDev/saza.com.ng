/****************************
Name: stellar.donate.js
Author: saza.com.ng
Desc: Enables transfer of lumens
to a specific account. Can be integrated 
into a website for donations.
Note: Use this plugin over https connection
**************************/


jQuery(document).ready( function($){
  var apiURL = "https://saza.com.ng:8888/donate";
  var statusMsg = "Processing Payment";
	var stellarDonate = $('#stellar-donate');
	var destAcct = stellarDonate.data("dest");
  console.log(destAcct);


	var formTemplate =`
  <div style="padding: 10px;">
  <h3>Our Donation Plugin</h3>
  <div id="sdmsg"></div>
  <form id="stellar-donate-form" class="form-horizontal" name="stellarDonateForm" method="POST">
    <div class="form-group">
      <div class="col-xs-12">                                            
        <input type="number" class="form-control" id="sdfAmount" name="amount" placeholder="Amount in XLM" required/>
        <span class="help-block">Enter the amount in XLM</span>
      </div>
    </div>
    <div class="form-group">
      <div class="col-xs-12">                                            
        <input type="text" class="form-control" id="sdfSeed" name="srcSeed"  placeholder="Your Stellar Account Seed" required/>
        <span class="help-block">Enter Seed to enable us verify account ownership. This is not saved</span>
      </div>
    </div>  
    <input type="hidden" id="sdfDest" name="destAcct"  value="${destAcct}"/>
    <button type="submit" class="btn btn-success ">Send</button>
  </form>
  
  </div>
  `;

	stellarDonate.html(formTemplate);
  stellarDonate.append('<small>Powered by <a href="https://saza.com.ng" target="_blank">SAZA</a></small>');

  // Detect when form is submitted and process payment
  $("#stellar-donate-form" ).submit(function( event ) {
 
    // Stop form from submitting normally
    event.preventDefault();
    $('#sdmsg').html('<h4 class="text-info">'+statusMsg+'</h4>')
       
    // Send the data using post
    var posting = $.post( apiURL, $(this).serialize() );
    var response = "";
    
    posting.done(function( data ) {
      console.log("done", data);
      $('#sdmsg').html('<h4 class="text-success">'+data.content.message+'</h4>');
    
    });

    posting.fail(function( data ) {
      console.log("fail", JSON.parse(data.responseText));
      response = JSON.parse(data.responseText);
      $('#sdfAmount').val("");
      $('#sdfSeed').val("");
      $('#sdmsg').html('<h4 class="text-danger">'+response.content.message+'</h4>');
    });

  });


}); 