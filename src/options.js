$(function(){
  var options = get_options();
  set_options(options);
  $('#save_options').click(function(){
    save_options();
  });
  $('#reset_options').click(function(){
    reset_options();
  });
})
