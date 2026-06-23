"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  User, Mail, MapPin, Bell, Shield, Moon, Sun, Monitor, 
  Download, Trash2, ChevronRight, Check, Image as ImageIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/hooks/useAuth";
import { uploadProfileMedia } from "@/lib/firebase/storage";
import { UserAvatar } from "@/components/shared/UserAvatar";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, deleteAccount, updateProfile } = useAuth();
  
  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("");
  const [ward, setWard] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize state once user is loaded
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setCity(user.city || "");
      setWard(user.ward || "");
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    try {
      setUploading(true);
      const url = await uploadProfileMedia(file, user.id);
      await updateProfile({ photoURL: url });
      toast.success("Profile photo updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      // Reset the file input so the same file can be selected again if needed
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleSaveAccount = async () => {
    if (!displayName.trim()) return toast.error("Display name cannot be empty");
    await updateProfile({ displayName });
  };

  const handleSaveLocation = async () => {
    await updateProfile({ city, ward });
  };

  const handleToggleVisibility = async () => {
    if (!user) return;
    const newVisibility = !user.isPublicProfile;
    await updateProfile({ isPublicProfile: newVisibility });
  };

  const handleExportData = () => {
    if (!user) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `civicmind_data_${user.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success("Data export started");
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you absolutely sure you want to permanently delete your account and all associated data? This action cannot be undone.")) {
      deleteAccount();
    }
  };
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyDigest: false,
    updatesOnReports: true,
  });

  return (
    <div className="min-h-screen bg-zinc-950 pb-20 pt-16 md:pt-0">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-10 hidden md:block">
        <div className="mx-auto max-w-4xl px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage your account preferences and settings.</p>
        </div>
      </div>
      
      {/* Mobile header */}
      <div className="md:hidden px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      <div className="mx-auto max-w-4xl p-4 md:p-8 space-y-8">
        
        {/* ACCOUNT SETTINGS */}
        <SettingsSection title="Account" icon={User} description="Update your personal information.">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex flex-col items-center gap-3">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <div 
                onClick={handleAvatarClick}
                className={`relative h-24 w-24 rounded-full flex items-center justify-center group cursor-pointer ring-2 ring-transparent hover:ring-zinc-500 transition-all ${uploading ? 'opacity-50' : ''}`}
              >
                <UserAvatar user={user as any} className="h-full w-full text-3xl group-hover:opacity-50 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs" onClick={handleAvatarClick} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Change Avatar'}
              </Button>
            </div>
            
            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input 
                  id="name" 
                  value={displayName || user?.displayName || ""} 
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-zinc-900 border-white/10 text-white" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={user?.email || ""} disabled className="bg-zinc-900 border-white/10 text-zinc-500 opacity-70" />
                <p className="text-xs text-zinc-500">Email cannot be changed.</p>
              </div>
              <Button onClick={handleSaveAccount} className="bg-white text-zinc-950 hover:bg-zinc-200">Save Changes</Button>
            </div>
          </div>
        </SettingsSection>

        {/* LOCATION SETTINGS */}
        <SettingsSection title="Location" icon={MapPin} description="Set your default reporting area.">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                value={city || user?.city || ""} 
                onChange={(e) => setCity(e.target.value)}
                className="bg-zinc-900 border-white/10 text-white" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ward">Ward / Area</Label>
              <Input 
                id="ward" 
                value={ward || user?.ward || ""} 
                onChange={(e) => setWard(e.target.value)}
                className="bg-zinc-900 border-white/10 text-white" 
              />
            </div>
          </div>
          <Button variant="outline" className="mt-4" onClick={handleSaveLocation}>Update Location</Button>
        </SettingsSection>

        {/* NOTIFICATIONS */}
        <SettingsSection title="Notifications" icon={Bell} description="Choose what you want to be notified about.">
          <div className="space-y-4">
            <ToggleRow 
              label="Push Notifications" 
              description="Receive alerts on your device." 
              checked={notifications.pushNotifications} 
              onChange={() => setNotifications(prev => ({...prev, pushNotifications: !prev.pushNotifications}))} 
            />
            <ToggleRow 
              label="Email Alerts" 
              description="Get emails for important updates." 
              checked={notifications.emailAlerts} 
              onChange={() => setNotifications(prev => ({...prev, emailAlerts: !prev.emailAlerts}))} 
            />
            <ToggleRow 
              label="Updates on My Reports" 
              description="Notify me when my reported issues change status." 
              checked={notifications.updatesOnReports} 
              onChange={() => setNotifications(prev => ({...prev, updatesOnReports: !prev.updatesOnReports}))} 
            />
            <ToggleRow 
              label="Weekly Digest" 
              description="A weekly summary of activity in your area." 
              checked={notifications.weeklyDigest} 
              onChange={() => setNotifications(prev => ({...prev, weeklyDigest: !prev.weeklyDigest}))} 
            />
          </div>
        </SettingsSection>

        {/* APPEARANCE */}
        <SettingsSection title="Appearance" icon={Sun} description="Customize how CivicMind looks on your device.">
          <div className="grid grid-cols-3 gap-4">
            <ThemeCard 
              active={theme === 'light'} 
              onClick={() => setTheme('light')}
              icon={Sun}
              title="Light"
              previewClass="bg-white border-zinc-200"
            />
            <ThemeCard 
              active={theme === 'dark'} 
              onClick={() => setTheme('dark')}
              icon={Moon}
              title="Dark"
              previewClass="bg-zinc-950 border-zinc-800"
            />
            <ThemeCard 
              active={theme === 'system'} 
              onClick={() => setTheme('system')}
              icon={Monitor}
              title="System"
              previewClass="bg-gradient-to-br from-white to-zinc-950 border-zinc-500"
            />
          </div>
        </SettingsSection>

        {/* PRIVACY & DATA */}
        <SettingsSection title="Privacy & Data" icon={Shield} description="Manage your data and privacy preferences.">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-zinc-900/50">
              <div>
                <p className="font-medium text-white text-sm">Profile Visibility</p>
                <p className="text-xs text-zinc-400">Make your profile visible to other users.</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleToggleVisibility}>
                {user?.isPublicProfile ? 'Public' : 'Private'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-medium text-white text-sm">Export My Data</p>
                  <p className="text-xs text-zinc-400">Download a copy of all your reports and activity.</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={handleExportData}>Request</Button>
            </div>
          </div>
        </SettingsSection>

        {/* DANGER ZONE */}
        <section className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-red-500 flex items-center gap-2 mb-2">
            <Trash2 className="w-5 h-5" /> Danger Zone
          </h2>
          <p className="text-sm text-zinc-400 mb-6">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <Button 
            variant="destructive" 
            onClick={handleDeleteAccount}
            className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/50"
          >
            Delete Account
          </Button>
        </section>

      </div>
    </div>
  );
}

function SettingsSection({ title, description, icon: Icon, children }: { title: string, description: string, icon: any, children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-xl">
      <div className="mb-6 border-b border-white/5 pb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Icon className="w-5 h-5 text-zinc-400" /> {title}
        </h2>
        <p className="text-sm text-zinc-400 mt-1">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium text-white text-sm">{label}</p>
        <p className="text-xs text-zinc-400">{description}</p>
      </div>
      <button 
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${checked ? 'bg-blue-500' : 'bg-zinc-700'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

function ThemeCard({ active, onClick, icon: Icon, title, previewClass }: { active: boolean, onClick: () => void, icon: any, title: string, previewClass: string }) {
  return (
    <button 
      onClick={onClick}
      className={`group flex flex-col items-center gap-3 rounded-xl border p-4 transition-all ${
        active ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-zinc-900 hover:bg-zinc-800'
      }`}
    >
      <div className={`h-12 w-full rounded-md border ${previewClass} relative overflow-hidden flex items-center justify-center`}>
        {active && (
          <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-0.5 text-white">
            <Check className="w-3 h-3" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-zinc-500'}`} />
        <span className={`text-sm font-medium ${active ? 'text-white' : 'text-zinc-400'}`}>{title}</span>
      </div>
    </button>
  );
}
