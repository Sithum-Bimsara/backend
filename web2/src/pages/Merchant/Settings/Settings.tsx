import React from "react";
import { useMerchantSettingsForm } from "../../../features/MerchantProfile/hooks/useMerchantSettingsForm";
import { MerchantSettingsSkeleton, MerchantConfirmModal } from "../../../features/MerchantProfile/components/MerchantUI";
import { ProfileCard } from "../../../features/MerchantProfile/components/ProfileCard";
import { EditProfileForm } from "../../../features/MerchantProfile/components/EditProfileForm";

const Settings: React.FC = () => {
  const {
    profile,
    loading,
    error,
    formData,
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
  } = useMerchantSettingsForm();

  if (loading && !profile) {
    return (
      <div className="flex-1 w-full p-4 lg:p-8 max-w-6xl mx-auto">
        <MerchantSettingsSkeleton />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col xl:flex-row gap-8 items-start">

        {/* Left Column: Profile Card */}
        <div className="w-full xl:w-95 shrink-0 flex flex-col gap-6">
          <ProfileCard
            profile={profile}
            onLogoutClick={() => setConfirmLogout(true)}
          />
        </div>

        {/* Right Column: Edit Form */}
        <EditProfileForm
          formData={formData}
          profile={profile}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          setDocumentFile={setDocumentFile}
          removeDocument={removeDocument}
          setRemoveDocument={setRemoveDocument}
          error={error}
          saveSuccess={saveSuccess}
          isSaving={isSaving}
        />
      </div>

      <MerchantConfirmModal
        isOpen={confirmLogout}
        title="Logout Account"
        message="Are you sure you want to logout? You'll be returned to the login page."
        confirmLabel="Yes, Logout"
        tone="danger"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
};

export default Settings;
