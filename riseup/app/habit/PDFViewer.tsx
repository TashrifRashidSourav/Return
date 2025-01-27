import React from "react";
import { View, StyleSheet, Platform, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";

const PDFViewer = () => {
  const { fileUri } = useLocalSearchParams();

  console.log("Received File URI:", fileUri); // Debug the received file path

  if (!fileUri) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No file selected!</Text>
      </View>
    );
  }

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <iframe
          src={fileUri as string}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="PDF Viewer"
          allowFullScreen
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: fileUri as string }}
        style={{ flex: 1 }}
        onError={(error) => console.error("Failed to load PDF:", error)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
});

export default PDFViewer;
