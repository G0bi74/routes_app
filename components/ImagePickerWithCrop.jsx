import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  Modal,
  Dimensions,
  PanResponder,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import ThemedButton from "./ThemedButton";
import ThemedText from "./ThemedText";
import ThemedView from "./ThemedView";
import ThemedCard from "./ThemedCard";
import Spacer from "./Spacer";
import { Colors } from "../constants/Colors";
import { useAlertHelpers } from "./ThemedAlert";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ImagePickerWithCrop = ({
  onImageCaptured,
  buttonText = "Zrób zdjęcie",
  buttonIcon = "camera-outline",
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToProcess, setImageToProcess] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const { error: showError, warning, confirm } = useAlertHelpers();

  const openCamera = async () => {
    try {
      const mediaPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!cameraPermission) {
        showError("Błąd", "Nie można sprawdzić uprawnień aparatu");
        return;
      }

      if (!cameraPermission.granted) {
        const result = await requestCameraPermission();
        if (!result.granted) {
          warning("Brak uprawnień", "Potrzebujemy dostępu do aparatu");
          return;
        }
      }

      if (mediaPermission.status !== "granted") {
        warning("Brak uprawnień", "Potrzebujemy dostępu do galerii");
        return;
      }

      setShowCameraModal(true);
    } catch (error) {
      console.error("Błąd uprawnień:", error);
      showError("Błąd", "Nie można otworzyć aparatu");
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        exif: false,
      });

      setShowCameraModal(false);
      setImageToProcess(photo.uri);
      setImageSize({ width: photo.width, height: photo.height });
      setShowCropModal(true);
      setIsProcessing(false);
    } catch (error) {
      console.error("Błąd robienia zdjęcia:", error);
      showError("Błąd", "Nie można zrobić zdjęcia");
      setIsProcessing(false);
    }
  };

  const openGalleryFromCamera = async () => {
    try {
      setShowCameraModal(false);
      setIsProcessing(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setImageToProcess(asset.uri);
        setImageSize({ width: asset.width, height: asset.height });
        setShowCropModal(true);
      }

      setIsProcessing(false);
    } catch (error) {
      console.error("Błąd galerii:", error);
      showError("Błąd", "Nie można otworzyć galerii");
      setIsProcessing(false);
    }
  };

  const cropImage = async (cropData) => {
    if (!imageToProcess) return;

    try {
      setIsProcessing(true);

      const croppedImage = await ImageManipulator.manipulateAsync(
        imageToProcess,
        [
          {
            crop: {
              originX: Math.max(0, Math.round(cropData.x)),
              originY: Math.max(0, Math.round(cropData.y)),
              width: Math.round(cropData.width),
              height: Math.round(cropData.height),
            },
          },
        ],

        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );

      setShowCropModal(false);
      setImageToProcess(null);

      if (onImageCaptured) {
        onImageCaptured(croppedImage.uri);
      }
    } catch (error) {
      console.error("Błąd kadrowania:", error);
      showError("Błąd", "Nie można przyciąć zdjęcia");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    confirm("Anulować?", "Zdjęcie nie zostanie zapisane", () => {
      setShowCropModal(false);
      setImageToProcess(null);
    });
  };

  return (
    <View style={styles.container}>
      <ThemedButton
        onPress={openCamera}
        disabled={isProcessing}
        icon={buttonIcon}
      >
        {isProcessing ? "Przetwarzanie..." : buttonText}
      </ThemedButton>

      {}
      <Modal
        visible={showCameraModal}
        animationType="slide"
        onRequestClose={() => setShowCameraModal(false)}
      >
        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} style={styles.camera} facing="back">
            {}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCameraModal(false)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            {}
            <View style={styles.bottomControls}>
              {}
              <TouchableOpacity
                style={styles.galleryButton}
                onPress={openGalleryFromCamera}
                disabled={isProcessing}
              >
                <Ionicons name="images-outline" size={28} color="#fff" />
              </TouchableOpacity>

              {}
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
                disabled={isProcessing}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>

              {}
              <View style={styles.galleryButton} />
            </View>
          </CameraView>
        </View>
      </Modal>

      <ManualCropModal
        visible={showCropModal}
        imageUri={imageToProcess}
        imageSize={imageSize}
        onCrop={cropImage}
        onCancel={handleCancel}
        isProcessing={isProcessing}
      />
    </View>
  );
};

const ManualCropModal = ({
  visible,
  imageUri,
  imageSize,
  onCrop,
  onCancel,
  isProcessing,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] ?? Colors.light;

  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [rectPosition, setRectPosition] = useState({ x: 50, y: 50 });
  const [rectSize, setRectSize] = useState({ width: 200, height: 200 });

  const currentRect = useRef({ x: 50, y: 50, width: 200, height: 200 });
  const currentDisplaySize = useRef({ width: 0, height: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });

  React.useEffect(() => {
    currentRect.current = {
      x: rectPosition.x,
      y: rectPosition.y,
      width: rectSize.width,
      height: rectSize.height,
    };
  }, [rectPosition, rectSize]);

  React.useEffect(() => {
    currentDisplaySize.current = displaySize;
  }, [displaySize]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        dragStartPos.current = {
          x: currentRect.current.x,
          y: currentRect.current.y,
        };
      },
      onPanResponderMove: (evt, gesture) => {
        const maxX =
          currentDisplaySize.current.width - currentRect.current.width;
        const maxY =
          currentDisplaySize.current.height - currentRect.current.height;

        const newX = Math.max(
          0,
          Math.min(maxX, dragStartPos.current.x + gesture.dx),
        );
        const newY = Math.max(
          0,
          Math.min(maxY, dragStartPos.current.y + gesture.dy),
        );

        setRectPosition({ x: newX, y: newY });
      },
    }),
  ).current;

  const resizeResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        resizeStartSize.current = {
          width: currentRect.current.width,
          height: currentRect.current.height,
        };
      },
      onPanResponderMove: (evt, gesture) => {
        const maxWidth =
          currentDisplaySize.current.width - currentRect.current.x;
        const maxHeight =
          currentDisplaySize.current.height - currentRect.current.y;

        const newWidth = Math.max(
          50,
          Math.min(maxWidth, resizeStartSize.current.width + gesture.dx),
        );
        const newHeight = Math.max(
          50,
          Math.min(maxHeight, resizeStartSize.current.height + gesture.dy),
        );

        setRectSize({ width: newWidth, height: newHeight });
      },
    }),
  ).current;

  React.useEffect(() => {
    if (imageUri && imageSize.width > 0) {
      const maxWidth = SCREEN_WIDTH - 40;
      const maxHeight = SCREEN_HEIGHT * 0.5;
      const imageAspect = imageSize.width / imageSize.height;

      let displayWidth, displayHeight;

      if (imageAspect > maxWidth / maxHeight) {
        displayWidth = maxWidth;
        displayHeight = maxWidth / imageAspect;
      } else {
        displayHeight = maxHeight;
        displayWidth = maxHeight * imageAspect;
      }

      setDisplaySize({ width: displayWidth, height: displayHeight });

      const initialWidth = displayWidth * 0.8;
      const initialHeight = displayHeight * 0.8;
      setRectPosition({
        x: (displayWidth - initialWidth) / 2,
        y: (displayHeight - initialHeight) / 2,
      });
      setRectSize({
        width: initialWidth,
        height: initialHeight,
      });
    }
  }, [imageUri, imageSize]);

  const convertToImageCoordinates = () => {
    const scaleX = imageSize.width / displaySize.width;
    const scaleY = imageSize.height / displaySize.height;

    return {
      x: rectPosition.x * scaleX,
      y: rectPosition.y * scaleY,
      width: rectSize.width * scaleX,
      height: rectSize.height * scaleY,
    };
  };

  const handleConfirm = () => {
    const cropData = convertToImageCoordinates();
    onCrop(cropData);
  };

  if (!visible || !imageUri) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <ThemedView style={styles.modalContainer} safe>
        {}
        <View style={styles.modalHeader}>
          <Ionicons name="crop-outline" size={32} color={Colors.primary} />
          <ThemedText title style={styles.modalTitle}>
            Kadrowanie zdjęcia
          </ThemedText>
          <ThemedText style={styles.modalSubtitle}>
            Zaznacz obszar do wycięcia
          </ThemedText>
        </View>

        <Spacer height={16} />

        {}
        <ThemedCard style={styles.cropCard}>
          <View style={[styles.cropContainer, { height: displaySize.height }]}>
            <Image
              source={{ uri: imageUri }}
              style={[
                styles.cropImage,
                { width: displaySize.width, height: displaySize.height },
              ]}
              resizeMode="contain"
            />

            {displaySize.width > 0 && (
              <View style={styles.overlayContainer}>
                {}
                <View style={[styles.overlay, { height: rectPosition.y }]} />

                <View
                  style={[
                    styles.overlay,
                    {
                      top: rectPosition.y,
                      height: rectSize.height,
                      width: rectPosition.x,
                    },
                  ]}
                />

                <View
                  style={[
                    styles.overlay,
                    {
                      top: rectPosition.y,
                      height: rectSize.height,
                      left: rectPosition.x + rectSize.width,
                      width:
                        displaySize.width - rectPosition.x - rectSize.width,
                    },
                  ]}
                />

                <View
                  style={[
                    styles.overlay,
                    {
                      top: rectPosition.y + rectSize.height,
                      height:
                        displaySize.height - rectPosition.y - rectSize.height,
                    },
                  ]}
                />

                {}
                <View
                  {...panResponder.panHandlers}
                  style={[
                    styles.cropRect,
                    {
                      left: rectPosition.x,
                      top: rectPosition.y,
                      width: rectSize.width,
                      height: rectSize.height,
                    },
                  ]}
                >
                  {}
                  <View pointerEvents="none" style={styles.decorations}>
                    <View
                      style={[
                        styles.gridLine,
                        { left: "33%", width: 1, height: "100%" },
                      ]}
                    />
                    <View
                      style={[
                        styles.gridLine,
                        { left: "66%", width: 1, height: "100%" },
                      ]}
                    />
                    <View
                      style={[
                        styles.gridLine,
                        { top: "33%", height: 1, width: "100%" },
                      ]}
                    />
                    <View
                      style={[
                        styles.gridLine,
                        { top: "66%", height: 1, width: "100%" },
                      ]}
                    />

                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />
                  </View>
                </View>

                {}
                <View
                  {...resizeResponder.panHandlers}
                  style={[
                    styles.resizeHandle,
                    {
                      left: rectPosition.x + rectSize.width - 20,
                      top: rectPosition.y + rectSize.height - 20,
                    },
                  ]}
                >
                  <Ionicons
                    name="resize-outline"
                    size={20}
                    color={Colors.primary}
                  />
                </View>
              </View>
            )}
          </View>
        </ThemedCard>

        <Spacer height={12} />

        {}
        <View
          style={[
            styles.instructionCard,
            { backgroundColor: colors.uiBackground },
          ]}
        >
          <Ionicons
            name="hand-left-outline"
            size={18}
            color={colors.iconColor}
          />
          <ThemedText style={styles.instruction}>
            Przesuń prostokąt palcem • Prawy dolny róg = zmiana rozmiaru
          </ThemedText>
        </View>

        <Spacer height={20} />

        {}
        <View style={styles.actionButtons}>
          <ThemedButton
            onPress={handleConfirm}
            disabled={isProcessing}
            icon="checkmark-circle-outline"
          >
            {isProcessing ? "Przycinam..." : "Zatwierdź kadrowanie"}
          </ThemedButton>

          <Spacer height={12} />

          <ThemedButton
            onPress={onCancel}
            disabled={isProcessing}
            variant="outline"
            icon="close-circle-outline"
          >
            Anuluj
          </ThemedButton>
        </View>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.6,
  },
  cropCard: {
    padding: 12,
    alignItems: "center",
  },
  cropContainer: {
    alignSelf: "center",
    position: "relative",
  },
  cropImage: {
    borderRadius: 12,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "box-none",
  },
  overlay: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    left: 0,
    right: 0,
  },
  cropRect: {
    position: "absolute",
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: "transparent",
    borderRadius: 4,
  },
  decorations: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "#fff",
    backgroundColor: "transparent",
  },
  cornerTL: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 4,
  },
  resizeHandle: {
    position: "absolute",
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  instructionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  instruction: {
    fontSize: 13,
    flex: 1,
    opacity: 0.8,
  },
  actionButtons: {
    width: "100%",
  },

  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 50,
    backgroundColor: "transparent",
  },
  galleryButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(30, 30, 30, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
  },
});

export default ImagePickerWithCrop;
