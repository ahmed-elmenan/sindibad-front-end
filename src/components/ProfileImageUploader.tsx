import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import { Camera, User, X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";

// Constantes de sécurité
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const MAX_IMAGE_DIMENSIONS = { width: 2048, height: 2048 };

// Helper function to create image from url
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

// Fonction améliorée pour vérifier le type MIME réel par la signature binaire
const verifyImageSignature = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      if (!e.target?.result) return resolve(false);

      const arr = new Uint8Array(e.target.result as ArrayBuffer).subarray(0, 8);
      const signature = Array.from(arr)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

      // Vérification des signatures (magic numbers) d'images communes
      const isPNG = signature.startsWith("89504e47");
      const isJPEG =
        signature.startsWith("ffd8ffe0") ||
        signature.startsWith("ffd8ffe1") ||
        signature.startsWith("ffd8ffdb") ||
        signature.startsWith("ffd8ffe2");

      resolve(isPNG || isJPEG);
    };
    reader.readAsArrayBuffer(file.slice(0, 8));
  });
};

// Fonction pour vérifier les dimensions de l'image
const checkImageDimensions = (dataUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(
        img.width <= MAX_IMAGE_DIMENSIONS.width &&
          img.height <= MAX_IMAGE_DIMENSIONS.height
      );
    };
    img.onerror = () => resolve(false);
    img.src = dataUrl;
  });
};

// Fonction pour générer un nom de fichier sécurisé
const generateSecureFileName = (originalFile: File): string => {
  const extension = originalFile.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = ["jpg", "jpeg", "png"].includes(extension)
    ? extension
    : "jpg";
  return `profile-${uuidv4().slice(0, 8)}.${safeExtension}`;
};

// Amélioration de la fonction getCroppedImg pour limiter les dimensions
const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<string> => {
  const image = await createImage(imageSrc);

  // Limiter les dimensions maximales du crop
  const maxWidth = Math.min(pixelCrop.width, MAX_IMAGE_DIMENSIONS.width);
  const maxHeight = Math.min(pixelCrop.height, MAX_IMAGE_DIMENSIONS.height);

  const canvas = document.createElement("canvas");
  canvas.width = maxWidth;
  canvas.height = maxHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2d context");

  // Santitization: Dessiner sur un nouveau canvas pour éliminer les potentiels scripts
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    maxWidth,
    maxHeight
  );

  // Optimisation de la qualité pour limiter la taille
  return canvas.toDataURL("image/jpeg", 0.85);
};

// Amélioration de la fonction base64ToFile avec validation supplémentaire
const base64ToFile = (base64: string, filename: string): File | null => {
  try {
    // Vérifier le format du base64
    if (!base64 || !base64.startsWith("data:image/")) {
      throw new Error("Format de données invalide");
    }

    const arr = base64.split(",");
    if (arr.length !== 2) {
      throw new Error("Format base64 invalide");
    }
    const mime = arr[0].match(/:(.*?);/)?.[1];

    // Vérifier que le MIME type est autorisé
    if (!mime || !ALLOWED_MIME_TYPES.includes(mime)) {
      throw new Error("Type de fichier non autorisé");
    }

    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  } catch (error) {
    console.error("Erreur lors de la conversion base64 vers File:", error);
    return null;
  }
};

interface ProfileImageUploaderProps {
  onChange?: (file: File | undefined) => void;
  value?: File;
  className?: string;
  maxSizeMB?: number;
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
  onChange,
  value,
  className,
  maxSizeMB = 5,
}) => {
  // Ajouter le hook de traduction
  const { t } = useTranslation();

  // State pour le dialog, etc.
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // State for the preview and drag/drop UI
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If there's an initial value, set the preview URL
    if (value) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(value);
    }
    return () => {
      // Clean up the URL object when the component unmounts
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, value]);

  // Handle file drop
  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        // Utiliser t() pour les messages d'erreur
        setError(t("profileImageUploader.errors.invalidFormat"));
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      // Validation de taille
      if (file && file.size > maxSizeMB * 1024 * 1024) {
        // Utiliser t() pour les messages d'erreur avec variables
        setError(t("profileImageUploader.errors.fileTooLarge", { maxSizeMB }));
        return;
      }

      // Validation du type MIME déclaré
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setError(t("profileImageUploader.errors.invalidFormat"));
        return;
      }

      try {
        // Vérification de la signature du fichier (magic numbers)
        const isValidImage = await verifyImageSignature(file);
        if (!isValidImage) {
          setError(t("profileImageUploader.errors.invalidFormat"));
          return;
        }

        // Lecture sécurisée du fichier
        const reader = new FileReader();
        reader.onload = async (e) => {
          const result = e.target?.result as string;
          if (!result) {
            setError(t("profileImageUploader.errors.processingError"));
            return;
          }

          // Vérifier les dimensions de l'image
          const dimensionsOK = await checkImageDimensions(result);
          if (!dimensionsOK) {
            setError(t("profileImageUploader.errors.imageTooLarge"));
            return;
          }

          setImageSource(result);
          setIsDialogOpen(true);
        };

        reader.onerror = () => {
          setError(t("profileImageUploader.errors.processingError"));
        };

        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error processing image:", error);
        setError(t("profileImageUploader.errors.processingError"));
      }
    },
    [maxSizeMB, t] // Ajouter t aux dépendances
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxFiles: 1,
    multiple: false,
    onDragEnter: () => setIsDraggingOver(true),
    onDragLeave: () => setIsDraggingOver(false),
  });

  // Handle the crop complete event
  const onCropComplete = useCallback(
    (_croppedArea: unknown, croppedAreaPixelsParam: unknown) => {
      // Type assertion
      setCroppedAreaPixels(
        croppedAreaPixelsParam as {
          x: number;
          y: number;
          width: number;
          height: number;
        }
      );
    },
    []
  );

  // Handle the crop confirmation
  const handleCropConfirm = async () => {
    try {
      if (imageSource && croppedAreaPixels) {
        // Create the cropped image with security measures
        const croppedImageUrl = await getCroppedImg(
          imageSource,
          croppedAreaPixels
        );

        // Génération d'un nom de fichier sécurisé
        const secureFileName = generateSecureFileName(
          value || new File([""], "temp.jpg", { type: "image/jpeg" })
        );

        // Conversion sécurisée en fichier
        const file = base64ToFile(croppedImageUrl, secureFileName);

        // Vérifier une dernière fois la taille du fichier résultant
        if (file && file.size > maxSizeMB * 1024 * 1024) {
          setError(
            t("profileImageUploader.errors.fileTooLarge", { maxSizeMB })
          );
          return;
        }

        // Set the preview URL
        setPreviewUrl(croppedImageUrl);

        // Call the onChange handler
        if (onChange && file) {
          onChange(file);
        }

        // Close the dialog
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error cropping image:", error);
      setError(t("profileImageUploader.errors.processingError"));
    }
  };

  // Handle removing the profile picture
  const removeProfilePicture = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setError(null);
    if (onChange) {
      onChange(undefined);
    }
  };

  // Handle zoom increment/decrement
  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 1));
  };

  return (
    <>
      {/* Profile Picture Drop Zone */}
      <div className={cn("flex flex-col items-center", className)}>
        <div className="relative mb-4">
          <div
            {...getRootProps()}
            className={cn(
              "w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors shadow-sm",
              isDraggingOver || isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-accent/5",
              previewUrl ? "p-0 border-solid" : "p-4",
              error ? "border-destructive" : ""
            )}
            aria-label="Upload profile picture"
          >
            <input {...getInputProps()} />
            {previewUrl ? (
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <User className="h-8 w-8 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground text-center">
                  {t("profileImageUploader.label")}
                </span>
              </div>
            )}
          </div>

          {previewUrl && (
            <button
              type="button"
              onClick={removeProfilePicture}
              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center hover:bg-destructive/90 transition-colors"
              aria-label="Remove profile picture"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {t("profileImageUploader.helper", { maxSizeMB })}
        </p>
        {error && (
          <p className="text-xs text-destructive mt-1 text-center">{error}</p>
        )}
      </div>

      {/* Cropping Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>
              {t("profileImageUploader.cropDialog.title")}
            </DialogTitle>
            <DialogDescription>
              {t("profileImageUploader.cropDialog.description")}
            </DialogDescription>
          </DialogHeader>

          {/* Cropper */}
          <div className="relative h-64 w-full mt-4 bg-white border border-gray-200 rounded-md overflow-hidden">
            {imageSource && (
              <Cropper
                image={imageSource}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round"
                showGrid={false}
                style={{
                  containerStyle: {
                    backgroundColor: '#ffffff'
                  }
                }}
              />
            )}
          </div>

          {/* Zoom Controls */}
          <div className="flex flex-col space-y-1.5 mt-4">
            <div className="flex items-center justify-between">
              <label htmlFor="zoom" className="text-sm font-medium">
                {t("profileImageUploader.cropDialog.zoom")}
              </label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-full"
                  onClick={handleZoomOut}
                  disabled={zoom <= 1}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm w-10 text-center">
                  {Math.round(zoom * 10) / 10}x
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-full"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Slider
              id="zoom"
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              aria-label="Zoom"
            />
          </div>

          <DialogFooter className="flex justify-between sm:justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              {t("profileImageUploader.cropDialog.cancel")}
            </Button>
            <Button type="button" onClick={handleCropConfirm}>
              {t("profileImageUploader.cropDialog.apply")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileImageUploader;
