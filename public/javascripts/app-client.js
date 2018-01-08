$(document).ready(function () {
  
  // Refresh image
  var refreshImageInterval;
  function refreshImage() {
    refreshImageInterval = setInterval(function(){
      var d = new Date();
      $('img#camera').attr('src','/images/still.jpg?' + d.getTime());
    }, 1000);
  }
  
  // Keeping this for dev purposes to be able to turn off image refresh
  var cameraOn = false;
  // Turn on/off camera on server and start refreshing images
  $('#cameraControl').on('click', function() {
    var $this = $(this);
    if (cameraOn) {
      clearTimeout(refreshImageInterval);
      $this.text('Start camera');
      cameraOn = false;
    } else {
      refreshImage();
      $this.text('Stop camera');
      cameraOn = true;
    }
  });
  
});