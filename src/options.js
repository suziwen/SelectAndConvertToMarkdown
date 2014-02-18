function toggleRemarkedConfig(enableRemarkedConfig){
    if (enableRemarkedConfig){
      $('#remarked_config').find('input').removeAttr('disabled');
    } else {
      $('#remarked_config').find('input').attr('disabled', 'disabled');
    }
}
$(function(){
  var options = get_options();
  $('#save_options').click(function(){
    save_options();
    alert('保存成功');
  });
  $('#reset_options').click(function(){
    reset_options();
    alert('重置成功');
  });
  $('input[name=render][type=radio]').change(function(event){
    var $this = $(this);
    toggleRemarkedConfig($this.val() == 'remarked');
  });
  set_options(options);
})
