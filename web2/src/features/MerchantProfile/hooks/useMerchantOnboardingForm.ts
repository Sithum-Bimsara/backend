import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { createProfile } from "../api/merchant-profile.api";
import { createMerchantProfileSchema } from "../schemas/merchant-profile.schema";
import { ErrorHandler } from "../../../utils/error-handler";

export const useMerchantOnboardingForm = () => {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(true);

  // Merchant profile state
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [businessRegistrationDocument, setBusinessRegistrationDocument] = useState<File | null>(null);

  const canProceed = () => {
    switch (step) {
      case 1:
        return businessName.trim().length > 0 && businessDescription.trim().length > 0;
      case 2:
        return contactNumber.trim().length >= 10;
      case 3:
        return address.trim().length > 0 && businessRegistrationDocument !== null;
      default:
        return false;
    }
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read document file"));
      reader.readAsDataURL(file);
    });

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!address.trim()) {
        throw new Error("Business address is required");
      }

      if (!businessRegistrationDocument) {
        throw new Error("Business registration document is required");
      }

      const documentBase64 = await toBase64(businessRegistrationDocument);

      // Validate data with Zod DTO schema
      const payload = createMerchantProfileSchema.parse({
        businessName,
        businessDescription,
        contactNumber,
        address,
        city: city || null,
        country: country || null,
        businessRegistrationDocumentBase64: documentBase64,
        businessRegistrationDocumentName: businessRegistrationDocument.name,
        businessRegistrationDocumentType: businessRegistrationDocument.type,
      });

      await createProfile(payload);
      await fetchUser();
      navigate("/merchant-dashboard");
    } catch (err: unknown) {
      const errorMessage = ErrorHandler.getErrorMessage(err, "Failed to create merchant profile");
      setError(errorMessage);
      ErrorHandler.handle(err, { showToast: true, fallbackMessage: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    setStep,
    loading,
    error,
    setError,
    privacyAgreed,
    setPrivacyAgreed,
    showPrivacyModal,
    setShowPrivacyModal,
    form: {
      businessName,
      setBusinessName,
      businessDescription,
      setBusinessDescription,
      contactNumber,
      setContactNumber,
      address,
      setAddress,
      city,
      setCity,
      country,
      setCountry,
      businessRegistrationDocument,
      setBusinessRegistrationDocument,
    },
    actions: {
      canProceed,
      handleSubmit,
    },
  };
};
