import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import {
  MediapipeCamera,
  useFaceLandmarkDetection,
  Delegate,
  RunningMode,
} from 'react-native-mediapipe';

console.log('MediapipeCamera Component:', MediapipeCamera);

const CameraView = ({ cameraType }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [device, setDevice] = useState(null);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const overlayBounds = {
    top: 0.3 * screenHeight,
    bottom: 0.7 * screenHeight,
    left: 0.2 * screenWidth,
    right: 0.8 * screenWidth,
  };

  // Request Camera Permission
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
      const devices = await Camera.getAvailableCameraDevices();
      const selectedDevice = devices.find(
        (d) => d.position === (cameraType === 'front' ? 'front' : 'back')
      );
      setDevice(selectedDevice);
    })();
  }, [cameraType]);

  // Frame processor
  const faceDetection = useFaceLandmarkDetection(
    (results) => {
      console.log('Detection Results:', results);

      if (!results || results.results.length === 0) {
        console.log('No face detected');
        setFeedback('No face detected.');
        return;
      }

      const landmarks = results.results[0]?.faceLandmarks[0];
      if (!landmarks || landmarks.length === 0) {
        console.log('Landmarks not detected.');
        setFeedback('Landmarks not detected.');
        return;
      }

      const headPosition = landmarks[0]; // Example: Using the nose tip as the head's reference point.
      console.log('Head Position (Landmark):', headPosition);

      // Map normalized coordinates to view dimensions
      const mappedX = headPosition.x * overlayBounds.right;
      const mappedY = headPosition.y * overlayBounds.bottom;
      console.log('Mapped Coordinates:', { mappedX, mappedY });

      // Check alignment
      if (
        mappedX > overlayBounds.left &&
        mappedX < overlayBounds.right &&
        mappedY > overlayBounds.top &&
        mappedY < overlayBounds.bottom
      ) {
        console.log('Aligned!');
        setFeedback('Aligned!');
      } else {
        console.log('Please center your head.');
        setFeedback('Please center your head.');
      }
    },
    (error) => console.error(`Face detection error: ${error}`),
    RunningMode.LIVE_STREAM,
    'face_landmarker.task',
    { 
      delegate: Delegate.GPU, 
      numFaces: 1, // Detect one face
    }
  );


  if (!hasPermission) {
    return <Text>Requesting permissions...</Text>;
  }

  if (!device) {
    return <Text>Loading camera...</Text>;
  }

  return (
    <View style={styles.container}>
      {console.log('Face Detection Object:', faceDetection)}
      <MediapipeCamera 
        style={StyleSheet.absoluteFill} 
        solution={faceDetection} 
      />
      <View style={styles.overlay}>
        <View style={styles.faceSilhouette}></View>
        <Text style={styles.feedback}>{feedback}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceSilhouette: {
    width: 300,
    height: 400,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 150,
    backgroundColor: 'transparent',
  },
  feedback: {
    position: 'absolute',
    bottom: 20,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CameraView;
