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

interface EmployeForm {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  departement: string;
  dateEmbauche: string;
  iban: string;
  role: string;
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
  const emptyForm: EmployeForm = { nom: "", prenom: "", email: "", password: "", departement: "", dateEmbauche: "", iban: "", role: "", isActive: true, photo: null };
  const [form, setForm] = useState<EmployeForm>(emptyForm);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generatePassword = () => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
    let pwd = "";
    for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setForm(f => ({ ...f, password: pwd }));
  };

  const openCreateForm = () => {
    setForm(emptyForm);
    setPhotoPreview(null);
    setEditingEmploye(null);
    setShowForm(true);
  };

  const openEditForm = (emp: Employe) => {
    setForm({
      nom: emp.nom,
      prenom: emp.prenom,
      email: emp.email,
      password: "",
      departement: (emp as any).departement || "",
      dateEmbauche: emp.dateEmbauche || "",
      iban: emp.rib || "",
      role: (emp as any).role || "",
      isActive: emp.statut === "ACTIF",
      photo: null,
    });
    setPhotoPreview((emp as any).photo || null);
    setEditingEmploye(emp);
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
        departement: form.departement, date_embauche: form.dateEmbauche,
        iban: form.iban, role: form.role,
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{editingEmploye ? "Modifier l'employé" : "Nouvel employé"}</h2>
                <p className="text-sm text-slate-500">{editingEmploye ? `Modification de ${editingEmploye.prenom} ${editingEmploye.nom}` : "Créer un nouveau compte employé"}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-200 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Photo */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Photo" className="w-20 h-20 rounded-full object-cover border-2 border-slate-200" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <User size={32} />
                    </div>
                  )}
                </div>
                <div>
                  <Button variant="outline" size="sm" icon={<Upload size={16} />} onClick={() => fileInputRef.current?.click()}>Photo (optionnel)</Button>
                  <p className="text-xs text-slate-400 mt-1">JPEG/PNG/WebP, max 2MB</p>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
                </div>
              </div>

              {/* Nom / Prénom */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Nom <span className="text-danger">*</span></label>
                  <Input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="Dupont" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Prénom <span className="text-danger">*</span></label>
                  <Input value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} placeholder="Jean" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Email <span className="text-danger">*</span></label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jean.dupont@company.com" />
              </div>

              {/* Mot de passe */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  {editingEmploye ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : <>Mot de passe <span className="text-danger">*</span></>}
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Mot de passe"
                    className="flex-1 font-mono"
                  />
                  <Button variant="outline" size="sm" icon={<Key size={16} />} onClick={generatePassword}>Générer</Button>
                </div>
              </div>

              {/* Département / Date embauche */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Département</label>
                  <Input value={form.departement} onChange={e => setForm(f => ({ ...f, departement: e.target.value }))} placeholder="Informatique" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Date d'embauche</label>
                  <Input type="date" value={form.dateEmbauche} onChange={e => setForm(f => ({ ...f, dateEmbauche: e.target.value }))} />
                </div>
              </div>

              {/* IBAN / Rôle */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">IBAN (optionnel)</label>
                  <Input value={form.iban} onChange={e => setForm(f => ({ ...f, iban: e.target.value }))} placeholder="FR76..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Rôle</label>
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Sélectionner un rôle</option>
                    {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Actif */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-primary-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Compte actif</label>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
              <Button loading={isSubmitting} icon={<CheckCircle size={16} />} onClick={handleSubmitForm}>
                {editingEmploye ? "Enregistrer" : "Créer l'employé"}
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <Avatar nom={showViewModal.nom} prenom={showViewModal.prenom} size="md" />
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{showViewModal.prenom} {showViewModal.nom}</h2>
                  <p className="text-sm text-slate-500">{showViewModal.matricule}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(null)} className="p-2 hover:bg-slate-200 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Email", value: showViewModal.email },
                { label: "Statut", value: <Badge variant={showViewModal.statut === "ACTIF" ? "green" : "gray"}>{showViewModal.statut}</Badge> },
                { label: "Type contrat", value: showViewModal.typeContrat },
                { label: "Date embauche", value: showViewModal.dateEmbauche ? formatDate(showViewModal.dateEmbauche) : "-" },
                { label: "Congés annuels", value: `${showViewModal.congesRestants?.annuels ?? 0} jours restants` },
                { label: "IBAN", value: showViewModal.rib ? "••••••••" + showViewModal.rib.slice(-4) : "-" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-500 text-sm">{label}</span>
                  <span className="font-medium text-sm">{value}</span>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowViewModal(null)}>Fermer</Button>
              <Button icon={<Edit size={16} />} onClick={() => { setShowViewModal(null); openEditForm(showViewModal); }}>Modifier</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
