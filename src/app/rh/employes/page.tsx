"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Users, Plus, Search, Trash2, Edit, Eye, RefreshCw, X, User, Mail, Phone, Building2, Calendar, Key, Upload, CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Badge, Button, Input, Avatar } from "@/components/ui";
import { TrashView } from "@/components/shared";
import { employeService, rbacService } from "@/lib/services";
import { cn, formatDate } from "@/lib/utils";
import type { Employe } from "@/types";
import toast from "react-hot-toast";

type TabType = "actifs" | "archives";

interface Departement {
  id: string;
  nom: string;
  code?: string;
}

interface EmployeForm {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateNaissance: string;
  password: string;
  departement_id: string;
  dateEmbauche: string;
  iban: string;
  role_id: string;
  isActive: boolean;
  photo?: File | null;
}

export default function RHEmployesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("actifs");
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editingEmploye, setEditingEmploye] = useState<Employe | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Employe | null>(null);
  const [showViewModal, setShowViewModal] = useState<Employe | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);

  // Form state
  const emptyForm: EmployeForm = { 
    nom: "", prenom: "", email: "", telephone: "", dateNaissance: "",
    password: "", departement_id: "", dateEmbauche: "", iban: "", role_id: "", 
    isActive: true, photo: null 
  };
  const [form, setForm] = useState<EmployeForm>(emptyForm);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Départements et rôles
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  const generatePassword = () => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
    let pwd = "";
    for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setForm(f => ({ ...f, password: pwd }));
  };

  const fetchDepartements = async () => {
    setLoadingDepts(true);
    try {
      const res = await employeService.getDepartements();
      if (res.success) {
        const data = res.data as any;
        setDepartements(data?.data || data || []);
      }
    } catch {
      // Silencieux
    } finally {
      setLoadingDepts(false);
    }
  };

  const openCreateForm = () => {
    setForm(emptyForm);
    setPhotoPreview(null);
    setEditingEmploye(null);
    fetchDepartements();
    loadRoles();
    setShowForm(true);
  };

  const openEditForm = (emp: Employe) => {
    setForm({
      nom: emp.nom,
      prenom: emp.prenom,
      email: emp.email,
      telephone: (emp as any).telephone || "",
      dateNaissance: (emp as any).date_naissance || "",
      password: "",
      departement_id: (emp as any).departement_id || (emp as any).departement?.id || "",
      dateEmbauche: emp.dateEmbauche || "",
      iban: emp.rib || "",
      role_id: (emp as any).role_id || (emp as any).roles?.[0]?.id || "",
      isActive: emp.statut === "ACTIF",
      photo: null,
    });
    setPhotoPreview((emp as any).photo || null);
    setEditingEmploye(emp);
    fetchDepartements();
    loadRoles();
    setShowForm(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Photo max 2MB"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { toast.error("Format JPEG/PNG/WebP uniquement"); return; }
    setForm(f => ({ ...f, photo: file }));
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmitForm = async () => {
    if (!form.nom.trim() || !form.prenom.trim() || !form.email.trim()) {
      toast.error("Nom, prénom et email sont obligatoires");
      return;
    }
    if (!editingEmploye && !form.password.trim()) {
      toast.error("Générez ou saisissez un mot de passe");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = {
        nom: form.nom, prenom: form.prenom, email: form.email,
        telephone: form.telephone, date_naissance: form.dateNaissance,
        departement_id: form.departement_id, date_embauche: form.dateEmbauche,
        iban: form.iban, role_id: form.role_id,
        statut: form.isActive ? "ACTIF" : "INACTIF",
        ...(form.password ? { password: form.password } : {}),
      };
      let res;
      if (editingEmploye) {
        res = await employeService.update(editingEmploye.id, payload);
      } else {
        res = await employeService.create(payload);
      }
      if (res.success) {
        toast.success(editingEmploye ? "Employé modifié avec succès" : "Employé créé avec succès");
        setShowForm(false);
        loadEmployes();
      } else {
        toast.error((res as any).message || "Erreur lors de l'enregistrement");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    const target = showDeleteConfirm;
    // Optimistic update
    setEmployes(prev => prev.filter(e => e.id !== target.id));
    setShowDeleteConfirm(null);
    try {
      await employeService.delete(target.id);
      toast.success("Employé archivé — restauration possible depuis la Corbeille");
    } catch (e: any) {
      // Rollback
      setEmployes(prev => [target, ...prev]);
      toast.error(e?.response?.data?.message || e?.message || "Erreur lors de l'archivage");
    }
  };

  const loadEmployes = async () => {
    try {
      setIsLoading(true);
      const res = await employeService.getAll();
      if (res.success) {
        setEmployes(res.data?.data || []);
      } else {
        toast.error((res as any).message || "Erreur chargement employés");
      }
    } catch (error: any) {
      toast.error(error?.message || "Erreur chargement employés");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const res = await rbacService.getRoles();
      if (res.success && Array.isArray(res.data)) setRoles(res.data);
    } catch (e) {
      setRoles([]);
    }
  };

  const loadArchives = async (): Promise<any[]> => {
    try {
      const res = await employeService.getTrashed();
      if (res.success) {
        return (res.data?.data || []);
      }
      toast.error(res.message || "Erreur lors du chargement de la corbeille");
      return [];
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors du chargement de la corbeille");
      return [];
    }
  };

  useEffect(() => { loadEmployes(); loadRoles(); }, []);

  const filteredEmployes = employes.filter(e => 
    searchQuery ? `${e.nom} ${e.prenom} ${e.email}`.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const handleRestore = async (id: string) => {
    try {
      const res = await employeService.restore(id);
      if (res.success) {
        toast.success("Employé restauré avec succès");
        loadEmployes();
      } else {
        throw new Error(res.message || "Erreur lors de la restauration");
      }
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de la restauration");
      throw e;
    }
  };


  if (activeTab === "archives") {
    return (
      <DashboardLayout title="Gestion des Employés">
        <div className="max-w-5xl mx-auto">
          <TrashView
            entityLabel="Employé"
            entityLabelPlural="Employés"
            columns={[
              { key: "employe", header: "Employé", render: (item) => <div className="flex items-center gap-2"><Avatar nom={item.nom} prenom={item.prenom} size="sm" /><span>{item.prenom} {item.nom}</span></div> },
              { key: "email", header: "Email" },
              { key: "statut", header: "Statut", render: (item) => <Badge variant="gray">{item.statut}</Badge> },
            ]}
            fetchArchives={loadArchives}
            restoreItem={handleRestore}
            onRestoreSuccess={() => loadEmployes()}
            onClose={() => setActiveTab("actifs")}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Gestion des Employés" subtitle={`${filteredEmployes.length} employés`}>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <CardTitle className="flex items-center gap-2"><Users size={20} className="text-primary-500" />Liste des employés</CardTitle>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-0 min-w-[140px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-full sm:w-48" /></div>
            <Button size="sm" icon={<Plus size={16} />} onClick={openCreateForm} className="flex-shrink-0">Nouvel employé</Button>
            <Button variant="ghost" size="sm" icon={<Trash2 size={16} />} onClick={() => setActiveTab("archives")} className="text-slate-500 hover:text-amber-600 flex-shrink-0">Corbeille</Button>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Employé</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Contact</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Département</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Statut</th><th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployes.map((employe) => (
                <tr key={employe.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar nom={employe.nom} prenom={employe.prenom} size="sm" /><div><p className="font-medium text-slate-800">{employe.prenom} {employe.nom}</p><p className="text-xs text-slate-500">{employe.matricule}</p></div></div></td>
                  <td className="px-4 py-3"><div className="text-sm text-slate-700">{employe.email}</div></td>
                  <td className="px-4 py-3 text-sm text-slate-700">Informatique</td>
                  <td className="px-4 py-3"><Badge variant={employe.statut === "ACTIF" ? "green" : "gray"} size="sm">{employe.statut}</Badge></td>
                  <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="xs" icon={<Eye size={14} />} onClick={() => setShowViewModal(employe)} /><Button variant="ghost" size="xs" icon={<Edit size={14} />} onClick={() => openEditForm(employe)} /><Button variant="ghost" size="xs" icon={<Trash2 size={14} />} className="text-danger hover:text-danger" onClick={() => setShowDeleteConfirm(employe)} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {/* Modal Formulaire Créer/Modifier */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header sticky */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingEmploye ? "Modifier l'employé" : "Nouvel employé"}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {editingEmploye 
                    ? `Modification de ${editingEmploye.prenom} ${editingEmploye.nom}` 
                    : "Créer un nouveau compte employé"}
                </p>
              </div>
              <button 
                onClick={() => setShowForm(false)} 
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            {/* Body scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              
              {/* Photo de profil */}
              <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Photo de profil (optionnel)
                </h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {photoPreview ? (
                      <img 
                        src={photoPreview} 
                        alt="Photo" 
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-200" 
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      icon={<Upload size={16} />} 
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl border-gray-200"
                    >
                      Choisir une photo
                    </Button>
                    <p className="text-xs text-gray-400 mt-1.5">JPEG/PNG/WebP, max 2MB</p>
                    <input 
                      ref={fileInputRef} 
                      type="file" 
                      accept="image/jpeg,image/png,image/webp" 
                      className="hidden" 
                      onChange={handlePhotoChange} 
                    />
                  </div>
                </div>
              </section>

              {/* Informations personnelles */}
              <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Informations personnelles
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Nom */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.nom}
                      onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                      placeholder="Dupont"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  
                  {/* Prénom */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.prenom}
                      onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                      placeholder="Jean"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="jean.dupont@company.com"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  
                  {/* Téléphone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={form.telephone}
                      onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  {/* Date de naissance */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Date de naissance
                    </label>
                    <input
                      type="date"
                      value={form.dateNaissance}
                      onChange={e => setForm(f => ({ ...f, dateNaissance: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  {/* IBAN */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      IBAN / Compte bancaire
                    </label>
                    <input
                      type="text"
                      value={form.iban}
                      onChange={e => setForm(f => ({ ...f, iban: e.target.value }))}
                      placeholder="FR76 1234 5678 9012..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
                    />
                  </div>
                </div>
              </section>

              {/* Informations professionnelles */}
              <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Informations professionnelles
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* DÉPARTEMENT — Select dynamique */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Département <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.departement_id}
                      onChange={e => setForm(f => ({ ...f, departement_id: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer transition-all duration-200 text-gray-800"
                      required
                    >
                      <option value="">-- Sélectionner un département --</option>
                      {departements.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.nom} {dept.code ? `(${dept.code})` : ''}
                        </option>
                      ))}
                    </select>
                    {loadingDepts && (
                      <p className="text-xs text-gray-400 animate-pulse">
                        Chargement des départements...
                      </p>
                    )}
                  </div>
                  
                  {/* Date d'embauche */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Date d'embauche <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.dateEmbauche}
                      onChange={e => setForm(f => ({ ...f, dateEmbauche: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  
                  {/* RÔLE — Select dynamique */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Rôle <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.role_id}
                      onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer transition-all duration-200 text-gray-800"
                      required
                    >
                      <option value="">-- Sélectionner un rôle --</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Mot de passe */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      {editingEmploye 
                        ? "Nouveau mot de passe (optionnel)" 
                        : "Mot de passe provisoire"}
                      {!editingEmploye && <span className="text-red-500"> *</span>}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        placeholder={editingEmploye ? "Laisser vide pour ne pas changer" : "Généré automatiquement"}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-600 transition-all duration-200 whitespace-nowrap font-medium"
                      >
                        🔄 Générer
                      </button>
                    </div>
                    {!editingEmploye && (
                      <p className="text-xs text-gray-400">
                        L'employé devra changer ce mot de passe à sa première connexion
                      </p>
                    )}
                  </div>
                  
                  {/* Statut actif - toggle switch */}
                  <div className="flex items-center gap-3 pt-6">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                    <span className="text-sm font-medium text-gray-700">
                      Compte actif
                    </span>
                  </div>
                </div>
              </section>
            </div>
            
            {/* Footer sticky */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3 z-10">
              <Button 
                variant="outline" 
                onClick={() => setShowForm(false)}
                className="rounded-xl border-gray-200"
              >
                Annuler
              </Button>
              <Button 
                loading={isSubmitting} 
                icon={<CheckCircle size={16} />} 
                onClick={handleSubmitForm}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
              >
                {editingEmploye ? "Enregistrer les modifications" : "Créer l'employé"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation Suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-danger" size={28} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 text-center mb-2">Supprimer cet employé ?</h2>
              <p className="text-slate-600 text-center mb-6">
                Cet employé sera archivé (soft delete). Vous pourrez le restaurer depuis la <strong>Corbeille 🗑️</strong>.
              </p>
              <p className="text-center font-semibold text-slate-800 mb-6">{showDeleteConfirm.prenom} {showDeleteConfirm.nom}</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(null)}>Annuler</Button>
                <Button variant="danger" className="flex-1" onClick={handleDelete}>Oui, archiver</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Voir Employé */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            
            {/* Header avec dégradé */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  {(showViewModal as any).photo_profil ? (
                    <img
                      src={(showViewModal as any).photo_profil}
                      alt={`${showViewModal.prenom} ${showViewModal.nom}`}
                      className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/30"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-2xl ring-4 ring-white/30">
                      {showViewModal.prenom?.[0] || ''}{showViewModal.nom?.[0] || ''}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {showViewModal.prenom} {showViewModal.nom}
                    </h2>
                    <p className="text-blue-100 text-sm mt-0.5">
                      {(showViewModal as any).departement?.nom || (showViewModal as any).departement || 'Sans département'}
                    </p>
                    <span className={`
                      inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold
                      ${showViewModal.statut === 'ACTIF'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'}
                    `}>
                      <span className={`w-1.5 h-1.5 rounded-full ${showViewModal.statut === 'ACTIF' ? 'bg-green-500' : 'bg-red-500'}`} />
                      {showViewModal.statut === 'ACTIF' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(null)}
                  className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Corps — scrollable */}
            <div className="flex-1 overflow-y-auto">
              
              {/* Section Informations personnelles */}
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Informations personnelles
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">📧</span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-medium">Email</p>
                      <p className="text-sm text-gray-800 font-medium mt-0.5 truncate">{showViewModal.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">📱</span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-medium">Téléphone</p>
                      <p className="text-sm text-gray-800 font-medium mt-0.5">{(showViewModal as any).telephone || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">🎂</span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-medium">Date de naissance</p>
                      <p className="text-sm text-gray-800 font-medium mt-0.5">
                        {(showViewModal as any).date_naissance 
                          ? formatDate((showViewModal as any).date_naissance) 
                          : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">🏦</span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-medium">IBAN</p>
                      <p className="text-sm text-gray-800 font-medium mt-0.5">
                        {showViewModal.rib ? `****${showViewModal.rib.slice(-4)}` : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Section Informations professionnelles */}
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Informations professionnelles
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">🏢</span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-medium">Département</p>
                      <p className="text-sm text-gray-800 font-medium mt-0.5">
                        {(showViewModal as any).departement?.nom || (showViewModal as any).departement || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">📅</span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-medium">Date d'embauche</p>
                      <p className="text-sm text-gray-800 font-medium mt-0.5">
                        {showViewModal.dateEmbauche 
                          ? formatDate(showViewModal.dateEmbauche) 
                          : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">🎭</span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-medium">Rôle</p>
                      <p className="text-sm text-gray-800 font-medium mt-0.5">
                        {(showViewModal as any).roles?.[0]?.name || (showViewModal as any).role || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">📋</span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-medium">Contrat actif</p>
                      <p className="text-sm text-gray-800 font-medium mt-0.5">
                        {(showViewModal as any).contrat_actif?.type || 'Aucun contrat actif'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Section Solde congés */}
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Solde de congés
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Congés annuels', 
                      value: (showViewModal as any).solde_conges?.annuels ?? (showViewModal.congesRestants?.annuels ?? '—'), 
                      color: 'blue' },
                    { label: 'Congés maladie', 
                      value: (showViewModal as any).solde_conges?.maladie ?? '—', 
                      color: 'green' },
                    { label: 'Congés exceptionnels', 
                      value: (showViewModal as any).solde_conges?.exceptionnels ?? '—', 
                      color: 'purple' },
                  ].map(item => (
                    <div key={item.label} className={`bg-${item.color}-50 rounded-xl p-4 text-center`}>
                      <p className={`text-2xl font-bold text-${item.color}-600`}>
                        {item.value}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Section Historique congés récents */}
              {(showViewModal as any).conges_recents && (showViewModal as any).conges_recents.length > 0 ? (
                <div className="px-6 py-5">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Congés récents
                  </h3>
                  <div className="space-y-2">
                    {(showViewModal as any).conges_recents.slice(0, 3).map((conge: any) => (
                      <div key={conge.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{conge.type}</p>
                          <p className="text-xs text-gray-400">
                            {formatDate(conge.date_debut)} → {formatDate(conge.date_fin)}
                          </p>
                        </div>
                        <Badge variant={conge.etat?.includes('VALIDE') ? 'green' : conge.etat?.includes('REFUSE') ? 'red' : 'yellow'}>
                          {conge.etat}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-6 py-5">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Congés récents
                  </h3>
                  <p className="text-sm text-gray-400 italic">Aucun congé récent</p>
                </div>
              )}
            </div>
            
            {/* Footer actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center flex-shrink-0">
              <p className="text-xs text-gray-400">
                Créé le {(showViewModal as any).created_at ? formatDate((showViewModal as any).created_at) : '—'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowViewModal(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-all duration-200"
                >
                  Fermer
                </button>
                <button
                  onClick={() => { setShowViewModal(null); openEditForm(showViewModal); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all duration-200"
                >
                  ✏️ Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
