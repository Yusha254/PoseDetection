import React, { useState } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import CameraView from './components/CameraView';


export default function App() {
  const [cameraType, setCameraType] = useState('back');

  const toggleCamera = () => {
    setCameraType((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      <CameraView cameraType={cameraType} />
      <Button title="Switch Camera" onPress={toggleCamera} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
