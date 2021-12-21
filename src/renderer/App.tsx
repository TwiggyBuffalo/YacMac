import { useRef, useState } from 'react';
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';

const Hello = () => {
  // FIXME: But actually dont.
  const [hasAudio, setHasAudio] = useState(true);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const context = new AudioContext();
  const sayButton = useRef(null);
  const handleSuccess = (stream) => {
    console.log(stream);
    const options = { mimeType: 'audio/webm' };
    const recordedChunks = [];
    const mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.addEventListener('dataavailable', function (e) {
      if (e.data.size > 0) recordedChunks.push(e.data);
    });

    mediaRecorder.addEventListener('stop', function () {
      var blob = new Blob(recordedChunks, {
        'type': 'audio/wav'
      });
      var reader = new FileReader();
      reader.addEventListener("loadend", function() {
        context.decodeAudioData(reader.result, function(buffer) {
          setRecordedAudio(buffer);
        },
        function(e) {
          // Who cares
          console.log("error ", e)
        });
      });
      reader.readAsArrayBuffer(blob);
    });

    sayButton.current.addEventListener('mouseup', () => {
      try {
        mediaRecorder.stop();
      } catch (error) {
        // Who cares
        console.log(error);
      }
      stream.getTracks().forEach(function (track) {
        track.stop();
      });
    });

    mediaRecorder.start();
  };
  const onSay = () => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const audioInputs = devices.filter((d) => d.kind === 'audioinput');
      if (audioInputs.length > 0) {
        navigator.mediaDevices
          .getUserMedia({
            audio: {
              deviceId: devices[0].deviceId,
            },
          })
          .then((stream) => handleSuccess(stream))
          .catch(error => console.log(error));
      } else {
        setHasAudio(false);
      }
    });
  };
  const onPlay = () => {
    var source = context.createBufferSource();
    source.buffer = recordedAudio;
    source.connect(context.destination);
    source.start(0);
  };
  return (
    <div>
      <div className="Hello">
        <img width="200px" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <div className="Hello">
        {!hasAudio && <div>Shit, no audio devices detected!</div>}
        <button onMouseDown={onSay} ref={sayButton}>
          Say
        </button>
        <button type="button" onClick={onPlay}>Play</button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Hello} />
      </Switch>
    </Router>
  );
}
