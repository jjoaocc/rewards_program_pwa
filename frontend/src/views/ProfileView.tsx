import { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import type { Customer, ActivePage } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, type ApiClientPort } from '../lib/api-client';
import { getErrorMessage } from '../lib/api-error';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { ProfileStatsCards } from '../components/profile/ProfileStatsCards';
import { PersonalDataSection } from '../components/profile/PersonalDataSection';
import { ContactsSection } from '../components/profile/ContactsSection';
import { AddressSection } from '../components/profile/AddressSection';
import { PushPreferencesSection } from '../components/profile/PushPreferencesSection';
import { LegalMenu } from '../components/profile/LegalMenu';

interface ProfileViewProps {
  customer: Customer;
  onNavigate: (page: ActivePage) => void;
  onUpdate: () => void;
  statsError?: string | null;
  client?: ApiClientPort;
}

export function ProfileView({ customer, onNavigate, onUpdate, statsError, client = apiClient }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState(customer);
  const { logout } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { permissionState, isSubscribed, isLoading: isPushLoading, subscribe, unsubscribe } = usePushNotifications(client);

  const handleFieldChange = (updates: Partial<Customer>) => {
    setEditedCustomer((prev) => ({ ...prev, ...updates }));
  };

  const handleAddressChange = (updates: Partial<Customer['address']>) => {
    setEditedCustomer((prev) => ({ ...prev, address: { ...prev.address, ...updates } }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await client.patch('/customers/me', {
        name: editedCustomer.name,
        email: editedCustomer.email,
        secondary_email: editedCustomer.secondaryEmail ?? null,
        phone: editedCustomer.phone,
        mobile: editedCustomer.secondaryPhone,
        birth_date: editedCustomer.birthDate ?? null,
      });
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      const message = getErrorMessage(err, 'Erro ao salvar dados.');
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedCustomer(customer);
    setIsEditing(false);
  };

  return (
    <main className="pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white animate-fade-in">Meu Perfil</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-smooth font-semibold text-sm"
          >
            <Edit2 size={16} />
            Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-xl transition-smooth font-semibold text-sm"
            >
              <X size={16} />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-smooth font-semibold text-sm"
            >
              <Save size={16} />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>

            {saveError && <p className="text-xs text-rose-400 mt-2 text-right">{saveError}</p>}
          </div>
        )}
      </div>

      {!isEditing && statsError && (
        <p className="text-xs text-amber-400 mb-3 text-center">{statsError}</p>
      )}
      {!isEditing && <ProfileStatsCards customer={customer} />}

      <PersonalDataSection
        customer={customer}
        editedCustomer={editedCustomer}
        isEditing={isEditing}
        onChange={handleFieldChange}
      />

      <ContactsSection
        customer={customer}
        editedCustomer={editedCustomer}
        isEditing={isEditing}
        onChange={handleFieldChange}
      />

      <AddressSection
        customer={customer}
        editedCustomer={editedCustomer}
        isEditing={isEditing}
        onChange={handleAddressChange}
      />

      <PushPreferencesSection
        permissionState={permissionState}
        isSubscribed={isSubscribed}
        isLoading={isPushLoading}
        subscribe={subscribe}
        unsubscribe={unsubscribe}
      />

      <LegalMenu onNavigate={onNavigate} />

      <button
        onClick={logout}
        className="w-full mt-6 py-3 px-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold text-sm hover:bg-rose-500/20 transition-smooth"
      >
        Sair da Conta
      </button>
    </main>
  );
}
