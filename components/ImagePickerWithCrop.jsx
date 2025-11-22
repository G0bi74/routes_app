/**
 * ImagePickerWithCrop - Komponent do robienia zdjęć z manualnym kadrowaniem
 * 
 * Workflow:
 * 1. Użytkownik klika przycisk
 * 2. Otwiera się natywny aparat (z przyciskiem do galerii)
 * 3. Po zrobieniu zdjęcia otwiera się ekran kadrowania
 * 4. Użytkownik przesuwa i zmienia rozmiar prostokąta
 * 5. Po zatwierdzeniu otrzymuje URI przyciętego zdjęcia
 */

import React, { useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    Image,
    Modal,
    Dimensions,
    PanResponder,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import ThemedButton from './ThemedButton';
import ThemedText from './ThemedText';
import ThemedView from './ThemedView';
import Spacer from './Spacer';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ImagePickerWithCrop = ({ onImageCaptured, buttonText = "Zrób zdjęcie" }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCropModal, setShowCropModal] = useState(false);
    const [imageToProcess, setImageToProcess] = useState(null);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

    /**
     * Otwiera natywny aparat (automatycznie ma przycisk do galerii)
     */
    const openCamera = async () => {
        try {
            const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
            if (cameraPermission.status !== 'granted') {
                Alert.alert('Brak uprawnień', 'Potrzebujemy dostępu do aparatu');
                return;
            }

            await ImagePicker.requestMediaLibraryPermissionsAsync();

            setIsProcessing(true);

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
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
            console.error('Błąd aparatu:', error);
            Alert.alert('Błąd', 'Nie można uruchomić aparatu');
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
                }
            );

            setShowCropModal(false);
            setImageToProcess(null);

            if (onImageCaptured) {
                onImageCaptured(croppedImage.uri);
            }
        } catch (error) {
            console.error('Błąd kadrowania:', error);
            Alert.alert('Błąd', 'Nie można przyciąć zdjęcia');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = () => {
        Alert.alert(
            'Anulować?',
            'Zdjęcie nie zostanie zapisane',
            [
                { text: 'Nie', style: 'cancel' },
                {
                    text: 'Tak',
                    style: 'destructive',
                    onPress: () => {
                        setShowCropModal(false);
                        setImageToProcess(null);
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ThemedButton
                onPress={openCamera}
                disabled={isProcessing}
                style={styles.mainButton}
            >
                <ThemedText style={styles.buttonText}>
                    {isProcessing ? '⏳ Przetwarzanie...' : `📷 ${buttonText}`}
                </ThemedText>
            </ThemedButton>

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

/**
 * Modal z manualnym zaznaczaniem prostokąta
 */
const ManualCropModal = ({ visible, imageUri, imageSize, onCrop, onCancel, isProcessing }) => {
    const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
    const [rectPosition, setRectPosition] = useState({ x: 50, y: 50 });
    const [rectSize, setRectSize] = useState({ width: 200, height: 200 });
    
    // Referencje do przechowania wartości - zawsze aktualne
    const currentRect = useRef({ x: 50, y: 50, width: 200, height: 200 });
    const currentDisplaySize = useRef({ width: 0, height: 0 });
    const dragStartPos = useRef({ x: 0, y: 0 });
    const resizeStartSize = useRef({ width: 0, height: 0 });

    // Aktualizuj ref przy każdej zmianie
    React.useEffect(() => {
        currentRect.current = {
            x: rectPosition.x,
            y: rectPosition.y,
            width: rectSize.width,
            height: rectSize.height,
        };
    }, [rectPosition, rectSize]);

    // Aktualizuj ref displaySize
    React.useEffect(() => {
        currentDisplaySize.current = displaySize;
    }, [displaySize]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                // Zapisz pozycję prostokąta na początku przeciągania
                dragStartPos.current = {
                    x: currentRect.current.x,
                    y: currentRect.current.y,
                };
            },
            onPanResponderMove: (evt, gesture) => {
                // WAŻNE: Użyj currentDisplaySize.current zamiast displaySize
                const maxX = currentDisplaySize.current.width - currentRect.current.width;
                const maxY = currentDisplaySize.current.height - currentRect.current.height;
                
                const newX = Math.max(0, Math.min(
                    maxX,
                    dragStartPos.current.x + gesture.dx
                ));
                const newY = Math.max(0, Math.min(
                    maxY,
                    dragStartPos.current.y + gesture.dy
                ));

                setRectPosition({ x: newX, y: newY });
            },
        })
    ).current;

    const resizeResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                // Zapisz rozmiar prostokąta na początku zmiany rozmiaru
                resizeStartSize.current = {
                    width: currentRect.current.width,
                    height: currentRect.current.height,
                };
            },
            onPanResponderMove: (evt, gesture) => {
                // WAŻNE: Użyj currentDisplaySize.current zamiast displaySize
                const maxWidth = currentDisplaySize.current.width - currentRect.current.x;
                const maxHeight = currentDisplaySize.current.height - currentRect.current.y;
                
                const newWidth = Math.max(50, Math.min(
                    maxWidth,
                    resizeStartSize.current.width + gesture.dx
                ));
                const newHeight = Math.max(50, Math.min(
                    maxHeight,
                    resizeStartSize.current.height + gesture.dy
                ));

                setRectSize({ width: newWidth, height: newHeight });
            },
        })
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
            <ThemedView style={styles.modalContainer}>
                <ThemedText style={styles.modalTitle}>
                    Zaznacz obszar do wycięcia
                </ThemedText>

                <ThemedText style={styles.modalSubtitle}>
                    Przesuń i zmień rozmiar prostokąta palcem
                </ThemedText>

                <Spacer height={20} />

                <View style={[styles.cropContainer, { height: displaySize.height }]}>
                    <Image
                        source={{ uri: imageUri }}
                        style={[styles.cropImage, { width: displaySize.width, height: displaySize.height }]}
                        resizeMode="contain"
                    />

                    {displaySize.width > 0 && (
                        <View style={styles.overlayContainer}>
                            {/* Ciemne overlay wokół zaznaczenia */}
                            <View style={[styles.overlay, { height: rectPosition.y }]} />

                            <View style={[styles.overlay, {
                                top: rectPosition.y,
                                height: rectSize.height,
                                width: rectPosition.x
                            }]} />

                            <View style={[styles.overlay, {
                                top: rectPosition.y,
                                height: rectSize.height,
                                left: rectPosition.x + rectSize.width,
                                width: displaySize.width - rectPosition.x - rectSize.width
                            }]} />

                            <View style={[styles.overlay, {
                                top: rectPosition.y + rectSize.height,
                                height: displaySize.height - rectPosition.y - rectSize.height
                            }]} />

                            {/* Prostokąt zaznaczenia - DRAG */}
                            <View
                                {...panResponder.panHandlers}
                                style={[styles.cropRect, {
                                    left: rectPosition.x,
                                    top: rectPosition.y,
                                    width: rectSize.width,
                                    height: rectSize.height,
                                }]}
                            >
                                {/* Siatka i narożniki - nie blokują gestów */}
                                <View pointerEvents="none" style={styles.decorations}>
                                    <View style={[styles.gridLine, { left: '33%', width: 1, height: '100%' }]} />
                                    <View style={[styles.gridLine, { left: '66%', width: 1, height: '100%' }]} />
                                    <View style={[styles.gridLine, { top: '33%', height: 1, width: '100%' }]} />
                                    <View style={[styles.gridLine, { top: '66%', height: 1, width: '100%' }]} />

                                    <View style={[styles.corner, styles.cornerTL]} />
                                    <View style={[styles.corner, styles.cornerTR]} />
                                    <View style={[styles.corner, styles.cornerBL]} />
                                    <View style={[styles.corner, styles.cornerBR]} />
                                </View>
                            </View>

                            {/* Uchwyt resize - oddzielny od drag */}
                            <View
                                {...resizeResponder.panHandlers}
                                style={[styles.resizeHandle, {
                                    left: rectPosition.x + rectSize.width - 15,
                                    top: rectPosition.y + rectSize.height - 15,
                                }]}
                            >
                                <View style={styles.resizeHandleIcon} />
                            </View>
                        </View>
                    )}
                </View>

                <Spacer height={20} />

                <ThemedText style={styles.instruction}>
                    💡 Dotknij prostokąt i przesuń{'\n'}
                    🔧 Prawy dolny róg - zmiana rozmiaru
                </ThemedText>

                <Spacer height={20} />

                <View style={styles.actionButtons}>
                    <ThemedButton onPress={handleConfirm} disabled={isProcessing} style={styles.confirmButton}>
                        <ThemedText style={styles.buttonText}>
                            {isProcessing ? '⏳ Przycinam...' : '✓ Zatwierdź'}
                        </ThemedText>
                    </ThemedButton>

                    <Spacer height={10} />

                    <ThemedButton onPress={onCancel} disabled={isProcessing} style={styles.cancelButton}>
                        <ThemedText style={styles.buttonText}>✕ Anuluj</ThemedText>
                    </ThemedButton>
                </View>
            </ThemedView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
    },
    mainButton: {
        paddingHorizontal: 30,
        paddingVertical: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.7,
        marginTop: 8,
    },
    cropContainer: {
        alignSelf: 'center',
        position: 'relative',
    },
    cropImage: {
        borderRadius: 10,
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        pointerEvents: 'box-none',
    },
    overlay: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        left: 0,
        right: 0,
    },
    cropRect: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: '#fff',
        backgroundColor: 'transparent',
    },
    decorations: {
        ...StyleSheet.absoluteFillObject,
    },
    gridLine: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: '#fff',
        backgroundColor: 'transparent',
    },
    cornerTL: {
        top: -2,
        left: -2,
        borderTopWidth: 4,
        borderLeftWidth: 4,
    },
    cornerTR: {
        top: -2,
        right: -2,
        borderTopWidth: 4,
        borderRightWidth: 4,
    },
    cornerBL: {
        bottom: -2,
        left: -2,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
    },
    cornerBR: {
        bottom: -2,
        right: -2,
        borderBottomWidth: 4,
        borderRightWidth: 4,
    },
    resizeHandle: {
        position: 'absolute',
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#2196F3',
        zIndex: 10,
    },
    resizeHandleIcon: {
        width: 20,
        height: 20,
        borderRightWidth: 3,
        borderBottomWidth: 3,
        borderColor: '#2196F3',
    },
    instruction: {
        fontSize: 13,
        textAlign: 'center',
        opacity: 0.8,
        lineHeight: 20,
    },
    actionButtons: {
        width: '100%',
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 50,
        width: '80%',
    },
    cancelButton: {
        backgroundColor: '#757575',
        paddingHorizontal: 50,
        width: '80%',
    },
});

export default ImagePickerWithCrop;
