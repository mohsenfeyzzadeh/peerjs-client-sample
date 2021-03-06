(function(global) {

  // Compatibility
  //navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
  navigator.getUserMedia = ( navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

  var peerClient;
  var currentPeerConnection;
  var localMediaStream;

  $(function() {

    var $myselfId = $('#js-myself-id');
    var $peerId = $('#js-peer-id');
    var $partnerId = $('#js-partner-id');
    var $open = $('#js-open');
    var $connect = $('#js-connect');
    var videoMyself = document.querySelector('#js-video-myself');
    var videoPartner = document.querySelector('#js-video-partner');

    navigator.getUserMedia({video: true, audio: true}, function(stream) {
      //videoMyself.src = URL.createObjectURL(stream);
      videoMyself.srcObject = stream;
      videoMyself.play();
      localMediaStream = stream;
    }, function(error) {
      console.error(error);
    });

    $open.on('click', function(e) {
      // create peer object
      var myselfId = $myselfId.val();
      peerClient = new Peer(myselfId, {
        host: 'webrtc.10d.ir',
        port: 9000,
        path: '/myapp',
        debug: 3,           // 0, 1, 2, 3 log levels
        pingInterval: 5000,
        key: 'peerjs',      // API key
        secure: true,       // true if you're using ssl.
        config : {
          //iceServers: [{'url': 'stun:stun.l.google.com:19302'}
          iceServers: [
            {urls: 'turn:turn.10d.ir', username: 'turn10d', credential: 'Hy(DHvSzDi@7dJpz'},
            {urls: 'stun:turn.10d.ir'},
          ]
        }
      });

      // if peer connection is opened
      peerClient.on('open', function() {
        $peerId.html(peerClient.id);
      });

      peerClient.on('error', function (error) {
        console.log(error);
      });

      peerClient.on('disconnected', function () {
        console.log('Connection lost. peer client disconnected.');
      });

      peerClient.on('call', function(call) {
        // answer with my media stream
        call.answer(localMediaStream);

        // close current connection if exists
        if (currentPeerConnection) {
          currentPeerConnection.close();
        }

        // keep call as currentPeerConnection
        currentPeerConnection = call;

        // wait for partner's stream
        call.on('stream', function(stream) {
          //videoPartner.src = URL.createObjectURL(stream);
          videoPartner.srcObject = stream;
          videoPartner.play();
        });

        // if connection is closed
        call.on('close', function() {
          console.log('Connection is closed.');
        });
      });

      // disable id input
      $myselfId.attr('disabled', 'disabled');

      // enable partner id input
      $partnerId.removeAttr('disabled');

      // enable connect button
      $connect.removeAttr('disabled');
    });

    $connect.on('click', function(e) {
      // if peerClient is not initialized
      if (!peerClient) {
        return;
      }

      // connect to partner
      var partnerId = $partnerId.val();
      var call = peerClient.call(partnerId, localMediaStream);

      // close current connection if exists
      if (currentPeerConnection) {
        currentPeerConnection.close();
      }

      // keep call as currentPeerConnection
      currentPeerConnection = call;

      // wait for partner's stream
      call.on('stream', function(stream) {
        //videoPartner.src = URL.createObjectURL(stream);
        videoPartner.srcObject = stream;
        videoPartner.play();
      });

      // if connection is closed
      call.on('close', function() {
        console.log('Connection is closed.');
      });
    });
  });

})(this);
