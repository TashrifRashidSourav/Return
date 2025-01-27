import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Alert } from 'react-native';
import { Audio } from 'expo-av';

const songs = [
  { id: '1', title: 'Relaxing Song 1', artist: 'Calm Artist 1', file: require('../../assets/audio/song1.mp3'), cover: require('../../assets/images/cover1.jpg') },
  { id: '2', title: 'Peaceful Melody', artist: 'Calm Artist 2', file: require('../../assets/audio/song2.mp3'), cover: require('../../assets/images/cover2.jpg') },
  { id: '3', title: 'Soothing Tune', artist: 'Calm Artist 3', file: require('../../assets/audio/song3.mp3'), cover: require('../../assets/images/cover3.jpg') },
];

const MusicPlayerApp = () => {
  const [expoSound, setExpoSound] = useState<Audio.Sound | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const loadAndPlaySound = async (songIndex: number) => {
    try {
      if (expoSound) {
        await expoSound.stopAsync();
        await expoSound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(songs[songIndex].file);
      setExpoSound(sound);
      setIsPlaying(true);

      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          playNext();
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while playing the sound.');
      console.error('Error playing sound:', error);
    }
  };

  const playSong = () => {
    loadAndPlaySound(currentSongIndex);
  };

  const pauseSong = async () => {
    if (expoSound) {
      await expoSound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const playNext = () => {
    const nextIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextIndex);
    loadAndPlaySound(nextIndex);
  };

  const playPrevious = () => {
    const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    setCurrentSongIndex(prevIndex);
    loadAndPlaySound(prevIndex);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Peaceful Tunes</Text>

      <View style={styles.currentSongContainer}>
        <Image source={songs[currentSongIndex].cover} style={styles.coverImage} />
        <Text style={styles.songTitle}>{songs[currentSongIndex].title}</Text>
        <Text style={styles.songArtist}>{songs[currentSongIndex].artist}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={playPrevious}>
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>

        {isPlaying ? (
          <TouchableOpacity style={styles.button} onPress={pauseSong}>
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={playSong}>
            <Text style={styles.buttonText}>Play</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={playNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.songItem}
            onPress={() => {
              setCurrentSongIndex(index);
              loadAndPlaySound(index);
            }}
          >
            <Image source={item.cover} style={styles.songItemImage} />
            <View style={styles.songItemDetails}>
              <Text style={styles.songItemTitle}>{item.title}</Text>
              <Text style={styles.songItemArtist}>{item.artist}</Text>
            </View>
          </TouchableOpacity>
        )}
        style={styles.songList}
      />
    </View>
  );
};

export default MusicPlayerApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FC', // Soothing light blue
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4A90E2', // Calm blue
    textAlign: 'center',
  },
  currentSongContainer: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#EAF3FA', // Soft blue for card
    padding: 20,
    borderRadius: 15,
  },
  coverImage: {
    width: 180,
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  songTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3E50',
  },
  songArtist: {
    fontSize: 16,
    color: '#6B8BA4',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 30,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: '#4A90E2',
    borderRadius: 50,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  songList: {
    marginTop: 10,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#FFFFFF', // White background for list items
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  songItemImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  songItemDetails: {
    flex: 1,
  },
  songItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3E50',
  },
  songItemArtist: {
    fontSize: 14,
    color: '#6B8BA4',
  },
});
