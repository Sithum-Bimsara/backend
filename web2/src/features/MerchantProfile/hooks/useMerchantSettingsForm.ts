import { useState, useEffect } from "react";
import { useMerchantProfile } from "./useMerchantProfile";
import { useLogout } from "../../(auth)/hooks/auth.hooks";
import { updateMerchantProfileSchema } from "../schemas/merchant-profile.schema";
import { updateProfile } from "../api/merchant-profile.api";
import { ErrorHandler } from "../../../utils/error-handler";

export const useMerchantSettingsForm = () => {
  const { profile, loading, error: fetchError, refetch } = useMerchantProfile();
  const { logout } = useLogout();

  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [removeDocument, setRemoveDocument] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: "",
    businessDescription: "",
    contactNumber: "",
    address: "",
    city: "",
    country: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        businessName: profile.businessName || "",
        businessDescription: profile.businessDescription || "",
        contactNumber: profile.contactNumber || "",
        address: profile.address || "",
        city: profile.city || "",
        country: profile.country || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (fetchError) {
      setError(fetchError);
    }
  }, [fetchError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read document file"));
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      let documentBase64: string | undefined;

      if (documentFile) {
        documentBase64 = await toBase64(documentFile);
      }

      // Input Validation using Zod DTO schema
      const payload = updateMerchantProfileSchema.parse({
        ...formData,
        businessRegistrationDocumentBase64: documentBase64,
        businessRegistrationDocumentName: documentFile?.name,
        businessRegistrationDocumentType: documentFile?.type,
        removeBusinessRegistrationDocument: removeDocument && !documentFile,
      });

      await updateProfile(payload);
      await refetch();
      setDocumentFile(null);
      setRemoveDocument(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const errorMessage = ErrorHandler.getErrorMessage(err, "Failed to update profile");
      setError(errorMessage);
      ErrorHandler.handle(err, { showToast: true, fallbackMessage: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return {
    profile,
    loading,
    error,
    formData,
    documentFile,
    setDocumentFile,
    removeDocument,
    setRemoveDocument,
    isSaving,
    saveSuccess,
    confirmLogout,
    setConfirmLogout,
    handleChange,
    handleSubmit,
    handleLogout,
  };
};
