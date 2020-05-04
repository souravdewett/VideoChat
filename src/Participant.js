import React, { useState, useEffect, useRef } from "react";


const Participant = ({
  participant,
  handleCallDisconnect,
  handleAudioToggle,
  handleVideoToggle,
  toggleAudio,
  toggleVideo,
  isLocal,
  isSharingScreen
}) => {

    console.log('refresh ?????');

  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);

  const videoRef = useRef();
  const screenRef = useRef();
  const audioRef = useRef();

  const trackpubsToTracks = trackMap =>
    Array.from(trackMap)
      .map(publication => publication.track)
      .filter(track => track !== null);

  useEffect(() => {
    // Lots of things were wrong because Twilio-Video v1 differs a lot from Twilio-Video v2
    // https://www.twilio.com/docs/video/migrating-1x-2x 
    setVideoTracks(trackpubsToTracks(participant.videoTracks.values()));
    setAudioTracks(trackpubsToTracks(participant.audioTracks.values()));
      console.log(participant);

    const trackSubscribed = event => {
      // trackPublished emits a publication as first param while trackSubscribed emits a track
      const track = event.track ? event.track : event;

      if (track.kind === "video") {
        setVideoTracks(videoTracks => [...videoTracks, track]);
      } else {
        setAudioTracks(audioTracks => [...audioTracks, track]);
      }
    };

    const trackUnsubscribed = event => {
      const track = event.track ? event.track : event;

      if (track.kind === "video") {
        setVideoTracks(videoTracks => videoTracks.filter(v => v !== track));
      } else {
        setAudioTracks(audioTracks => audioTracks.filter(a => a !== track));
      }
    };

    // LocalParticipant won't subscribe to tracks, they should use the track as soon as it's published
    isLocal && participant.on("trackPublished", trackSubscribed);
    isLocal && participant.on("trackUnpublished", trackUnsubscribed);

    // RemoteParticipant can only consume a track after it has been succesfully subscribed to
    !isLocal && participant.on("trackSubscribed", trackSubscribed);
    !isLocal && participant.on("trackUnsubscribed", trackUnsubscribed);

    return () => {
      setVideoTracks([]);
      setAudioTracks([]);
      participant.removeAllListeners();
    };
  }, [participant]);

  useEffect(() => {
    console.log('attaching video track', videoTracks);
    let shouldUnsub = [];
    // const localTracks = Array.from(participant.videoTracks.values()).map(v => v.track);
      const getTrackByName = (name) => videoTracks.reduce((acc, cur) => acc ? acc : cur.name === name ? cur : acc, null);
      const getScreenTrack = () => {
          const t = getTrackByName('screen');
          // Fallback to webcam if there is no screen
          return t && t.isEnabled ? t : getTrackByName('webcam');
      };
      console.log(isSharingScreen, isLocal);
      const getVideoTrack = () => isLocal ? getTrackByName('webcam') : getScreenTrack();


    const videoTrack = getVideoTrack();
    const screenTrack = getScreenTrack();

      !isLocal && screenTrack && screenTrack.on('disabled', (t) => {
          console.log('remote screenTrack was disabled')
          const wTrack = getTrackByName('webcam');
          wTrack && wTrack.attach(videoRef.current)
      })

      !isLocal && screenTrack && screenTrack.on('enabled', (t) => {
          console.log('remote screenTrack was enabled')
          screenTrack.attach(videoRef.current)
      })

      console.log(videoTracks, videoTrack, screenTrack);
    if (videoTrack) {
      videoTrack.attach(videoRef.current);
      shouldUnsub.push(videoTrack);
    }

    if (screenTrack) {
      console.log('screnRef', screenRef, screenRef.current)
      shouldUnsub.push(screenTrack);
      screenTrack.attach(screenRef.current);
    }

    return () => {
      shouldUnsub.forEach(track => track && track.detach())
    }
  }, [videoTracks]);

  useEffect(() => {
    const audioTrack = audioTracks[0];

    if (audioTrack) {
      audioTrack.attach(audioRef.current);
      return () => {
        audioTrack.detach();
      };
    }
  }, [audioTracks]);

  return (
    <div>
    <div className="futura-20-900 margin-top-8 margin-left-8" style={{ color: "white" }}>{participant.identity}</div>
      <video ref={screenRef} autoPlay={true} style={{ display: `${isSharingScreen ? 'block' : 'none'}`}}/>
      <video ref={videoRef} autoPlay={true} />
      <audio ref={audioRef} autoPlay={true} />
    </div>
  );
};

export default Participant;
