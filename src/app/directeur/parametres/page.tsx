"use client";

import { useState, useEffect, useRef } from "react";
import {
  Settings, Users, Shield, Key, FileText, Camera, Eye, EyeOff,
  Search, Trash2, Plus, RefreshCw, Download, Filter, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, AlertCircle, User as UserIcon
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Button, Badge, Avatar, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { employeeService, employeService, rbacService, auditService } from "@/lib/services";
import type { Employe } from "@/types";
import toast from "react-hot-toast";

type TabType = "profil" | "roles" | "permissions" | "attribution" | "audit";

export default function DirecteurParametresPage() {
  const [activeTab, setActiveTab] = useState<TabType>("profil");

  return (
    <DashboardLayout title="Paramètres">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <div className="p-2 space-y-1">
            <TabButton active={activeTab === "profil"} onClick={() => setActiveTab("profil")} icon={<Users size={16} />}>Mon Profil Admin</TabButton>
            <TabButton active={activeTab === "roles"} onClick={() => setActiveTab("roles")} icon={<Shield size={16} />}>Gestion des Rôles</TabButton>
            <TabButton active={activeTab === "permissions"} onClick={() => setActiveTab("permissions")} icon={<Key size={16} />}>Gestion des Permissions</TabButton>
            <TabButton active={activeTab === "attribution"} onClick={() => setActiveTab("attribution")} icon={<Settings size={16} />}>Attribution Rôles & Permissions</TabButton>
            <TabButton active={activeTab === "audit"} onClick={() => setActiveTab("audit")} icon={<FileText size={16} />}>Audit Log</TabButton>
          </div>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === "profil" && <ProfilTab />}
          {activeTab === "roles" && <RolesTab />}
          {activeTab === "permissions" && <PermissionsTab />}
          {activeTab === "attribution" && <AttributionTab />}
          {activeTab === "audit" && <AuditTab />}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
function TabButton({ children, active, onClick, icon }: {
  children: React.ReactNode; active: boolean; onClick: () => void; icon: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className={cn(
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
      active ? "bg-primary-500 text-white" : "text-slate-600 hover:bg-slate-100"
    )}>
      {icon}{children}
    </button>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm";

// ─────────────────────────────────────────────────────────
// ONGLET PROFIL
// ─────────────────────────────────────────────────────────
function ProfilTab() {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState<Employe | null>(null);
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ actuel: "", nouveau: "", confirmation: "" });
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    employeeService.getMe().then(res => {
      if (res.success) setProfile(res.data as any);
    }).catch(() => {});
  }, []);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objUrl = URL.createObjectURL(file);
    setPreview(objUrl);
    try {
      const res = await employeeService.uploadPhoto(file);
      if (res.success) {
        updateUser({ avatar: (res.data as any)?.photo_url });
        toast.success("Photo mise à jour");
      } else { throw new Error((res as any).message); }
    } catch (err: any) {
      setPreview(null);
      toast.error(err?.message || "Échec de l'upload");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const res = await employeService.update(profile.id, {
        nom: profile.nom,
        prenom: profile.prenom,
        email: profile.email,
        telephone: (profile as any).telephone,
      });
      if (res.success) {
        updateUser({ nom: profile.nom, prenom: profile.prenom, email: profile.email });
        toast.success("Profil mis à jour");
      } else throw new Error((res as any).message);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Erreur de sauvegarde");
    } finally { setSaving(false); }
  };

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.nouveau !== pwForm.confirmation) { toast.error("Les mots de passe ne correspondent pas"); return; }
    setSavingPw(true);
    try {
      const res = await employeeService.changePassword({
        mot_de_passe_actuel: pwForm.actuel,
        nouveau_mot_de_passe: pwForm.nouveau,
        confirmation: pwForm.confirmation,
      });
      if (res.success) { toast.success("Mot de passe modifié"); setPwForm({ actuel: "", nouveau: "", confirmation: "" }); }
      else throw new Error((res as any).message);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Erreur changement mot de passe");
    } finally { setSavingPw(false); }
  };

  const avatarSrc = preview || user?.avatar;

  return (
    <div className="space-y-6">
      {/* Photo + infos */}
      <Card className="p-6">
        <CardTitle className="mb-6">Mon Profil Admin</CardTitle>
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <Avatar nom={user?.nom} prenom={user?.prenom} size="lg" src={avatarSrc ?? undefined} />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 shadow"
            >
              <Camera size={14} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
          <div>
            <p className="font-semibold text-lg">{user?.prenom} {user?.nom}</p>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <Badge variant="blue" size="sm" className="mt-1">{user?.role}</Badge>
          </div>
        </div>
        <form onSubmit={handleSaveProfile}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <FieldGroup label="Nom">
              <input className={inputCls} value={profile?.nom ?? user?.nom ?? ""} onChange={e => setProfile(p => p ? { ...p, nom: e.target.value } : p)} />
            </FieldGroup>
            <FieldGroup label="Prénom">
              <input className={inputCls} value={profile?.prenom ?? user?.prenom ?? ""} onChange={e => setProfile(p => p ? { ...p, prenom: e.target.value } : p)} />
            </FieldGroup>
            <FieldGroup label="Email">
              <input type="email" className={inputCls} value={profile?.email ?? user?.email ?? ""} onChange={e => setProfile(p => p ? { ...p, email: e.target.value } : p)} />
            </FieldGroup>
            <FieldGroup label="Téléphone">
              <input className={inputCls} value={(profile as any)?.telephone ?? ""} onChange={e => setProfile(p => p ? { ...p, telephone: e.target.value } as any : p)} />
            </FieldGroup>
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>Enregistrer</Button>
          </div>
        </form>
      </Card>

      {/* Changer mot de passe */}
      <Card className="p-6">
        <CardTitle className="mb-4">Changer le mot de passe</CardTitle>
        <form onSubmit={handleChangePw}>
          <div className="space-y-3 mb-4">
            {(["actuel", "nouveau", "confirmation"] as const).map((field) => (
              <FieldGroup key={field} label={field === "actuel" ? "Mot de passe actuel" : field === "nouveau" ? "Nouveau mot de passe" : "Confirmation"}>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    className={inputCls + " pr-10"}
                    value={pwForm[field]}
                    onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
                    required
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FieldGroup>
            ))}
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="outline" loading={savingPw}>Changer le mot de passe</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ONGLET RÔLES
// ─────────────────────────────────────────────────────────
function RolesTab() {
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await rbacService.getRoles();
      if (res.success) setRoles((res.data as any) ?? []);
    } catch {} finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newRole) });
      toast.success("Rôle créé");
      setShowCreate(false);
      setNewRole({ name: "", description: "" });
      load();
    } catch (err: any) {
      toast.error(err?.message || "Erreur création rôle");
    } finally { setSaving(false); }
  };

  if (isLoading) return <Card className="p-6 h-40 animate-pulse bg-slate-100" />;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <CardTitle>Gestion des Rôles</CardTitle>
        <Button size="sm" icon={<Plus size={16} />} onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? "Annuler" : "Créer un rôle"}
        </Button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-slate-50 rounded-xl p-4 mb-4 space-y-3">
          <FieldGroup label="Nom du rôle">
            <input className={inputCls} value={newRole.name} onChange={e => setNewRole(r => ({ ...r, name: e.target.value }))} required />
          </FieldGroup>
          <FieldGroup label="Description">
            <input className={inputCls} value={newRole.description} onChange={e => setNewRole(r => ({ ...r, description: e.target.value }))} />
          </FieldGroup>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button type="submit" size="sm" loading={saving}>Créer</Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Rôle</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roles.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">Aucun rôle trouvé</td></tr>
            ) : roles.map((role: any) => (
              <tr key={role.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium">{role.name}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{role.description || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="xs">Modifier</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={load}>Actualiser</Button>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────
// ONGLET PERMISSIONS
// ─────────────────────────────────────────────────────────
function PermissionsTab() {
  const [byModule, setByModule] = useState<Record<string, { id: string; name: string }[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    rbacService.getPermissionsByModule().then(res => {
      if (res.success) setByModule((res.data as any) ?? {});
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Card className="p-6 h-40 animate-pulse bg-slate-100" />;

  const modules = Object.keys(byModule);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <CardTitle>Gestion des Permissions</CardTitle>
        <Badge variant="blue" size="sm">{Object.values(byModule).flat().length} permissions</Badge>
      </div>
      <div className="space-y-4">
        {modules.length === 0 ? (
          <p className="text-slate-400 text-center py-8">Aucune permission trouvée</p>
        ) : modules.map((module) => (
          <div key={module} className="border border-slate-200 rounded-xl p-4">
            <h3 className="font-medium text-slate-800 mb-3 capitalize">{module}</h3>
            <div className="flex flex-wrap gap-2">
              {(byModule[module] || []).map((perm) => (
                <Badge key={perm.id} variant="gray" size="sm" className="font-mono text-xs">
                  {perm.name}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────
// ONGLET ATTRIBUTION RÔLES & PERMISSIONS
// ─────────────────────────────────────────────────────────
function AttributionTab() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermRole, setSelectedPermRole] = useState("");
  const [selectedPerm, setSelectedPerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      employeService.getAll({ limit: 200 } as any),
      rbacService.getRoles(),
      rbacService.getPermissions(),
    ]).then(([emp, rol, perm]) => {
      setEmployees((emp.data as any)?.data ?? []);
      setRoles((rol.data as any) ?? []);
      setPermissions((perm.data as any) ?? []);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const filteredEmployees = employees.filter(e =>
    `${e.prenom} ${e.nom} ${e.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedRole) { toast.error("Sélectionnez un utilisateur et un rôle"); return; }
    setSubmitting(true);
    try {
      const res = await rbacService.assignRole(selectedUser.id, selectedRole);
      if (res.success) { toast.success(`Rôle assigné à ${selectedUser.prenom} ${selectedUser.nom}`); setSelectedRole(""); }
      else throw new Error((res as any).message);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Échec de l'assignation");
    } finally { setSubmitting(false); }
  };

  const handleAssignPermToRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPermRole || !selectedPerm) { toast.error("Sélectionnez un rôle et une permission"); return; }
    setSubmitting(true);
    try {
      const res = await rbacService.assignPermissionToRole(selectedPermRole, selectedPerm);
      if (res.success) { toast.success("Permission assignée au rôle"); setSelectedPerm(""); }
      else throw new Error((res as any).message);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Échec de l'assignation");
    } finally { setSubmitting(false); }
  };

  if (isLoading) return <Card className="p-6 h-40 animate-pulse bg-slate-100" />;

  return (
    <div className="space-y-6">
      {/* Assigner rôle à utilisateur */}
      <Card className="p-6">
        <CardTitle className="mb-4">Assigner un rôle à un utilisateur</CardTitle>
        <form onSubmit={handleAssignRole} className="space-y-4">
          <FieldGroup label="Rechercher un utilisateur">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input className={inputCls + " pl-9"} placeholder="Nom, prénom, email..."
                value={search} onChange={e => { setSearch(e.target.value); setSelectedUser(null); }} />
            </div>
            {search && !selectedUser && filteredEmployees.length > 0 && (
              <div className="mt-1 border border-slate-200 rounded-xl shadow-sm max-h-40 overflow-y-auto bg-white z-10">
                {filteredEmployees.slice(0, 8).map(emp => (
                  <button type="button" key={emp.id}
                    onClick={() => { setSelectedUser(emp); setSearch(`${emp.prenom} ${emp.nom}`); }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left text-sm"
                  >
                    <Avatar nom={emp.nom} prenom={emp.prenom} size="xs" />
                    {emp.prenom} {emp.nom}
                    <span className="text-slate-400 text-xs ml-auto">{emp.email}</span>
                  </button>
                ))}
              </div>
            )}
          </FieldGroup>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldGroup label="Rôle à assigner">
              <select className={inputCls} value={selectedRole} onChange={e => setSelectedRole(e.target.value)} required>
                <option value="">Sélectionner un rôle</option>
                {roles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </FieldGroup>
            <div className="flex items-end">
              <Button type="submit" className="w-full" loading={submitting} disabled={!selectedUser || !selectedRole}>
                Assigner le rôle
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Assigner permission à rôle */}
      <Card className="p-6">
        <CardTitle className="mb-4">Assigner une permission à un rôle</CardTitle>
        <form onSubmit={handleAssignPermToRole}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FieldGroup label="Rôle cible">
              <select className={inputCls} value={selectedPermRole} onChange={e => setSelectedPermRole(e.target.value)} required>
                <option value="">Sélectionner un rôle</option>
                {roles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Permission">
              <select className={inputCls} value={selectedPerm} onChange={e => setSelectedPerm(e.target.value)} required>
                <option value="">Sélectionner une permission</option>
                {permissions.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </FieldGroup>
            <div className="flex items-end">
              <Button type="submit" variant="outline" className="w-full" loading={submitting}>Assigner</Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ONGLET AUDIT LOG
// ─────────────────────────────────────────────────────────
function AuditTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [search, setSearch] = useState("");

  const load = async (p = page) => {
    setIsLoading(true);
    try {
      const res = await auditService.getLogs({ page: p, limit: 15 });
      if (res.success) {
        const raw = res.data as any;
        setLogs(raw?.data ?? raw ?? []);
        setTotalPages(raw?.meta?.last_page ?? raw?.last_page ?? 1);
      }
    } catch {} finally { setIsLoading(false); }
  };

  useEffect(() => { load(page); }, [page]);

  const actionColor: Record<string, any> = {
    CREATE: "green", UPDATE: "blue", DELETE: "red", APPROVE: "green",
    REJECT: "red", SUPER_VALIDATION: "red", LOGIN: "gray", LOGOUT: "gray",
  };

  const filtered = logs.filter(l => {
    const matchAction = !actionFilter || (l.action || "").toLowerCase().includes(actionFilter.toLowerCase());
    const matchSearch = !search || JSON.stringify(l).toLowerCase().includes(search.toLowerCase());
    return matchAction && matchSearch;
  });

  const exportCSV = () => {
    const header = "Date,Utilisateur,Action,Entité,Valeur\n";
    const rows = logs.map(l =>
      [l.timestamp || l.created_at, l.user?.name || l.user_id, l.action, l.entity_name, JSON.stringify(l.new_value || "")].join(",")
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `audit-log-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <CardTitle>Audit Log</CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={() => load(page)}>Actualiser</Button>
          <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={exportCSV}>Exporter CSV</Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input className={inputCls + " pl-8 text-xs"} placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className={inputCls + " max-w-[160px] text-xs"} value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
          <option value="">Toutes actions</option>
          {["CREATE","UPDATE","DELETE","APPROVE","REJECT","SUPER_VALIDATION","LOGIN"].map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse bg-slate-100 rounded-xl" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Utilisateur</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Action</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Entité</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Aucun log trouvé</td></tr>
                ) : filtered.map((log: any, i: number) => (
                  <tr key={log.id ?? i} className="hover:bg-slate-50/50 text-sm">
                    <td className="px-3 py-2 text-xs text-slate-500 whitespace-nowrap">
                      {log.timestamp || log.created_at
                        ? new Date(log.timestamp || log.created_at).toLocaleString("fr-FR")
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{log.user?.name ?? log.user_id ?? "—"}</td>
                    <td className="px-3 py-2">
                      <Badge
                        variant={actionColor[log.action?.toUpperCase()] ?? "gray"}
                        size="sm"
                      >
                        {log.action} {log.action?.toUpperCase().includes("SUPER") && "⚡"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">{log.entity_name} #{log.entity_id}</td>
                    <td className="px-3 py-2 text-xs text-slate-500 max-w-xs truncate">
                      {typeof log.new_value === "string" ? log.new_value.substring(0, 60) : JSON.stringify(log.new_value || "")?.substring(0, 60)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500">Page {page} / {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" icon={<ChevronLeft size={14} />} disabled={page <= 1} onClick={() => setPage(p => p - 1)} />
                <Button variant="outline" size="sm" icon={<ChevronRight size={14} />} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} />
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
