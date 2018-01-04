$(document).ready(function () {
  
  // Refresh image
  var refreshImageTimeout;
  function refreshImage() {
    refreshImageTimeout = setInterval(function(){
      var d = new Date();
      $("img#camera").attr("src","/images/still.jpg?" + d.getTime());
    }, 1000);
  }
  
  // Initially camera is off
  // Todo: get this from server to handle multiple client connections
  var cameraOn = false;
  // Turn on/off camera on server and start refreshing images
  $('#cameraControl').on('click', function() {
    var $this = $(this);
    if (cameraOn) {
      $.get('/camera', {'action': 'stop'}, clearTimeout(refreshImageTimeout));
      $this.text('Start camera');
      cameraOn = false;
    } else {
      $.get('/camera', {'action': 'start'}, refreshImage());
      $this.text('Stop camera');
      cameraOn = true;
    }
  });
  
});