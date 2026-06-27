import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { IAccommodationView } from '../types/accommodation.types';
import PropertyNameForm from './AccommodationForm/Common/PropertyNameForm';
import PropertyTypeSelector from './PropertyTypeSelector';
import AddressForm from './AccommodationForm/Common/AddressForm';
import HostProfileForm from './AccommodationForm/Common/HostProfileForm';
import HouseRulesForm from './AccommodationForm/Common/HouseRulesForm';
import LanguagesSelector from './AccommodationForm/Common/LanguagesSelector';
import FacilitiesSelector from './AccommodationForm/Common/FacilitiesSelector';
import {ImageUploader} from './AccommodationForm/Common/ImageUploader';


interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: IAccommodationView;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}

type Tab = 'basics' | 'location' | 'description' | 'facilities' | 'rules' | 'images';

const EditPropertyModal: React.FC<EditPropertyModalProps> = ({ isOpen, onClose, property, onSave }) => {
  const [activeTab, setActiveTab] = useState<Tab>('basics');
  const [data, setData] = useState<Record<string, unknown>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && property) {
      setData({
        name: property.name,
        type: property.type,
        description: property.description,
        address: property.address,
        city: property.city,
        island: property.island,
        zipCode: property.zipCode,
        latitude: property.latitude,
        longitude: property.longitude,
        propertyFacilities: property.propertyFacilities,
        languages: property.languages,
        checkInFrom: property.checkInFrom,
        checkInTo: property.checkInTo,
        checkOutFrom: property.checkOutFrom,
        checkOutTo: property.checkOutTo,
        smokingAllowed: property.smokingAllowed,
        childrenAllowed: property.childrenAllowed,
        partiesAllowed: property.partiesAllowed,
        hostProfile: property.hostProfile,
        images: property.images.map(img => ({ url: img.url })),
        starRating: property.starRating,
      });
    }
  }, [isOpen, property]);

  const updateData = (patch: Record<string, unknown>) => {
    setData(prev => ({ ...prev, ...patch }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(data);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'basics', label: 'Basics' },
    { id: 'location', label: 'Location' },
    { id: 'description', label: 'Description' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'rules', label: 'House Rules' },
    { id: 'images', label: 'Images' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0e2a47]/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl shadow-[#0e2a47]/20 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2.5 py-1 bg-[#2dd4af]/10 text-[#2dd4af] text-[10px] font-black uppercase tracking-wider rounded-lg">Edit Mode</span>
              <h2 className="text-2xl font-black text-[#0e2a47] tracking-tight">Property Details</h2>
            </div>
            <p className="text-sm text-slate-400 font-medium">Update your property's general information and settings.</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400 hover:text-[#0e2a47]"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-8 py-2 bg-slate-50/50 border-b border-slate-100 flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-white text-[#2dd4af] shadow-sm shadow-[#2dd4af]/10 border border-slate-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="max-w-2xl mx-auto"
            >
              {activeTab === 'basics' && (
                <div className="space-y-10">
                  <PropertyTypeSelector
                    value={data.type as any}
                    onChange={(type) => updateData({ type })}
                    isReadOnly={true}
                  />
                  <div className="pt-10 border-t border-slate-100">
                    <PropertyNameForm
                      name={(data.name as string) || ''}
                      description={(data.description as string) || ''}
                      onChange={(patch) => updateData(patch)}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'location' && (
                <AddressForm
                  value={data as any}
                  onChange={updateData}
                />
              )}

              {activeTab === 'description' && (
                <div className="space-y-10">
                  <div>
                    <label className="text-xs font-black text-[#0e2a47] uppercase tracking-widest opacity-50 mb-4 block">Property Description</label>
                    <textarea
                      value={(data.description as string) || ''}
                      onChange={(e) => updateData({ description: e.target.value })}
                      placeholder="Tell guests what makes your property special..."
                      className="w-full h-48 px-6 py-4 rounded-[24px] border-2 border-slate-100 focus:border-[#2dd4af] focus:outline-none transition-all text-[#0e2a47] font-medium resize-none bg-slate-50/30 focus:bg-white"
                    />
                  </div>
                  <div className="pt-10 border-t border-slate-100">
                    <HostProfileForm
                      value={(data.hostProfile as any) || {}}
                      onChange={(hostProfile) => updateData({ hostProfile })}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'facilities' && (
                <div className="space-y-10">
                  <FacilitiesSelector
                    value={(data.propertyFacilities as string[]) || []}
                    onChange={(propertyFacilities) => updateData({ propertyFacilities })}
                  />
                  <div className="pt-10 border-t border-slate-100">
                    <LanguagesSelector
                      value={(data.languages as string[]) || []}
                      onChange={(languages) => updateData({ languages })}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'rules' && (
                <HouseRulesForm
                  value={(data.houseRules as any) || {}}
                  onChange={(houseRules) => updateData({ houseRules })}
                />
              )}

              {activeTab === 'images' && (
                <ImageUploader
                  value={(data.images as any[]) || []}
                  onChange={(images) => updateData({ images })}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancel Changes
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-8 py-3 bg-[#0e2a47] text-white rounded-2xl text-sm font-black uppercase tracking-wider hover:bg-[#0e2a47]/90 transition-all flex items-center gap-2 shadow-xl shadow-[#0e2a47]/10 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Saving...
              </>
            ) : (
              'Save Property Details'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EditPropertyModal;
