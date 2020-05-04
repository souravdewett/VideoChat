import React, { useState, useEffect } from "react";
import Video from "twilio-video";
import Participant from "./Participant";
import Controls from "./Controls";

const Room = ({ roomName, token, handleLogout }) => {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [toggleAudio, setToggleAudio] = useState(true);
  const [toggleVideo, setToggleVideo] = useState(true);
  const [toggleScreenShare, setToggleScreenShare] = useState(false);
  const [screenStream, setScreenStream] = useState(null);

  useEffect(() => {
    const participantConnected = participant => {
      setParticipants(prevParticipants => [...prevParticipants, participant]);
    };

    const participantDisconnected = participant => {

      setParticipants(prevParticipants =>
        prevParticipants.filter(p => p !== participant)
      );
    };
    /*
    const opts = { name: roomName };
    if (screenStream) {
      console.log(screenStream);
      alert('screen share')
      opts.tracks = screenStream.getTracks();
    }
    */

      Video.connect(token, { name: roomName, audio: true, video: { name: 'webcam' } }).then(room => {
      setRoom(room);
      room.on("participantConnected", participantConnected);
      room.on("participantDisconnected", participantDisconnected);
      room.participants.forEach(participantConnected);
    });

    return () => {
      setRoom(currentRoom => {
        if (currentRoom && currentRoom.localParticipant.state === "connected") {
          currentRoom.localParticipant.tracks.forEach(function(
            trackPublication
          ) {
            trackPublication.track.stop();
          });
          currentRoom.disconnect();
          return null;
        } else {
          return currentRoom;
        }
      });
    };
  }, [roomName, token]);

  const handleCallDisconnect = () => {
    handleLogout();
    room.disconnect();
    window.close();
  };

  const handleAudioToggle = () => {
    room.localParticipant.audioTracks.forEach(track => {
      if (track.track.isEnabled) {
        track.track.disable();
      } else {
        track.track.enable();
      }
      setToggleAudio(track.track.isEnabled);
    });
  };

  const handleVideoToggle = () => {
    room.localParticipant.videoTracks.forEach(track => {
        console.log(track);
      if (track.track.isEnabled && track.trackName !== 'screen') {
        track.track.disable();
      } else {
        track.track.enable();
      }
      setToggleVideo(track.track.isEnabled);
    });
  };

   const handleScreenToggle = () => {
    //room.localParticipant.publishTrack(screenTrack);
    if (screenStream) {
        room.localParticipant.videoTracks.forEach(track => {
            console.log(track);
            if (track.track.isEnabled && track.trackName === 'screen') {
                track.track.disable();
            } else {
                track.track.enable();
            }
            setToggleScreenShare(track.track.isEnabled);
        });

        // setScreenStream(null);
    } else {
      navigator.mediaDevices.getDisplayMedia().then(_screenStream => {
        console.log(_screenStream);
        if (_screenStream) {
          const screenTrack = _screenStream.getVideoTracks()[0];
          const tracks = Array.from(room.localParticipant.videoTracks.values());
          console.log('Screen track', screenTrack);
          window.room = room;
          // const tracks = Array.from(room.localParticipant.tracks.values());
          // console.log(tracks);
          // room.localParticipant.unpublishTracks(tracks);
          if (tracks.length) {
           //console.log('unpublish track');
           //room.localParticipant.unpublishTrack(tracks[0].track);
          }
          // log(room.localParticipant.identity   " removed track: "   tracks[0].kind);
          // detachTracks(tracks);
    
          // room.localParticipant.publishTrack(localScreenTrack);
          room.localParticipant.publishTrack(screenTrack, { name: 'screen' });
          setToggleScreenShare(true);
          // log(localParticipant.identity   " added track: "   localVideoTrack.kind);
          console.log( window.room, room, 'published track', screenTrack);
          // room.localParticipant.videoTracks.forEach(track => {
          //   if (track.track.isEnabled) {
          //     track.track.disable();
          //   } else {
          //     track.track.enable();
          //   }
          //   setToggleVideo(track.track.isEnabled);
          // });
          setScreenStream(_screenStream);
        }
      });
      // console.log(_screenStream);
        // Video.createLocalVideoTrack({
        //   // deviceId: { exact: select.value }
        // }).then(function(screenTrack) {
        //   const tracks = Array.from(room.localParticipant.videoTracks.values());
        //   window.room = room;
        //   // const tracks = Array.from(room.localParticipant.tracks.values());
        //   // console.log(tracks);
        //   // room.localParticipant.unpublishTracks(tracks);
        //   room.localParticipant.unpublishTrack(tracks[0].track);
        //   // log(room.localParticipant.identity   " removed track: "   tracks[0].kind);
        //   // detachTracks(tracks);
    
        //   room.localParticipant.publishTrack(screenTrack);
        //   // log(localParticipant.identity   " added track: "   localVideoTrack.kind);
        //   const previewContainer = document.getElementById('local-media');
        //   // attachTracks([localVideoTrack], previewContainer);
        // });
        // console.log(screenTrack);
        // room.localParticipant.unpublishTracks(screenTrack);
        // room.localParticipant.publishTrack(screenTrack);
        // room.localParticipant.videoTracks = screenStream.getVideoTracks();
        // room.localParticipant.audioTracks = screenStream.getAudioTracks();
  
        // room.localParticipant.videoTracks.forEach(track => {
        //   if (track.track.isEnabled) {
        //     track.track.disable();
        //   } else {
        //     track.track.enable();
        //   }
        // });
        // use stream track properties
        // const screenTracks = screenStream.getVideoTracks();
        // let videoStream;
        // if (screenTracks.length) {
        //  videoStream = screenTracks[0] 
        //}
  
        //console.log(_screenStream, "--------------------");
        //console.log(_screenStream.getVideoTracks());
      }
    }


    //room.localParticipant.videoTracks = screenStream.getVideoTracks();
    //room.localParticipant.audioTracks = screenStream.getAudioTracks();
    /*
    room.localParticipant.videoTracks.forEach(track => {
      if (track.track.isEnabled) {
        track.track.disable();
      } else {
        track.track.enable();
      }
    });
    */
    // NOTE: Most important - in order to display inside a video element, set videoElement.srcObject = screenStream;
    // videoElement.srcObject = screenStream;

    // setToggleScreenShare();
    // use stream track properties
    // const screenTracks = screenStream.getVideoTracks();
    // let videoStream;
    // if (screenTracks.length) {
    //  videoStream = screenTracks[0] 
    //}
    // do what you want with the videoStream variable, as this contains the screenshare content

  const remoteParticipants = participants.map(participant => (
    <Participant
      key={participant.sid}
      participant={participant}
      isLocal={false}
    />
  ));

  return (
    <div className="room">
      <div className="local-participant">
        {room ? (
          <Participant
            key={room.localParticipant.sid}
            participant={room.localParticipant}
            handleAudioToggle={handleAudioToggle}
            handleVideoToggle={handleVideoToggle}
            handleCallDisconnect={handleCallDisconnect}
            toggleAudio={toggleAudio}
            toggleVideo={toggleVideo}
            isLocal={true}
            isSharingScreen={toggleScreenShare}
          />
        ) : (
          ""
        )}
      </div>
      <div className="remote-participants">{remoteParticipants}</div>
      <Controls
          handleCallDisconnect={handleCallDisconnect}
          handleAudioToggle={handleAudioToggle}
          handleVideoToggle={handleVideoToggle}
          handleScreenToggle={handleScreenToggle}
          audio={toggleAudio}
          video={toggleVideo}
          screen={toggleScreenShare}
        />
    </div>
  );
};

export default Room;
