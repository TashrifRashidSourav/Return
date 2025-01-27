import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert, Linking } from "react-native";

const Pdf = () => {
  const serverBaseUrl = "http://10.10.200.209:5921"; // Change to your actual server URL

  const [books] = useState([
    {
      id: 1,
      title: "তুমিও জিতবে",
      cover: require("../../assets/book1.png"), // Cover image
      file: `${serverBaseUrl}/assets/book1.pdf`, // File download link
    },
    {
      id: 2,
      title: "না বলতে শিখুন",
      cover: require("../../assets/book2.png"), // Cover image
      file: `${serverBaseUrl}/assets/book2.pdf`, // File download link
    },
    {
      id: 2,
      title: "দ্যা পজিটিভ ওয়ে টু চেঞ্জ ইওর লাইফ",
      cover: require("../../assets/book3.png"), // Cover image
      file: `${serverBaseUrl}/assets/book3.pdf`, // File download link
    },
  ]);

  const handleDownload = async (fileUrl: string) => {
    try {
      if (!fileUrl) {
        Alert.alert("Error", "File not found!");
        return;
      }

      // Open the file URL in the browser for download
      const supported = await Linking.canOpenURL(fileUrl);
      if (supported) {
        await Linking.openURL(fileUrl);
      } else {
        Alert.alert("Error", "Unable to open file.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong while downloading the file.");
      console.error("Download error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Download Books</Text>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={item.cover} style={styles.cover} />
            <Text style={styles.bookTitle}>{item.title}</Text>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleDownload(item.file)}
            >
              <Text style={styles.downloadButtonText}>Download</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    flex: 1,
    margin: 10,
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cover: {
    height: 120,
    resizeMode: "contain",
    borderRadius: 8,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    textAlign: "center",
  },
  downloadButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default Pdf;
