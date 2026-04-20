"use client";
import React, { useEffect } from "react";
import { X, Mail, Phone, Calendar, Briefcase, CreditCard, User } from "lucide-react";
import { Badge, Avatar } from "@/components/ui";
import { cn, formatDate, TYPE_CONTRAT_LABELS } from "@/lib/utils";
import type { Employe } from "@/types";

interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employe | null;
}

export default function EmployeeDetailsModal({ isOpen, onClose, employee }: EmployeeDetailsModalProps) {
  // Bloquer le scroll du body quand la modale est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !employee) return null;

  return (
    <>
      {/* Backdrop avec animation */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4">

          {/* Header */}
          <div className="flex items-start justify-between p-8 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-4">
              <Avatar nom={employee.nom} prenom={employee.prenom} size="lg" />
              <div>
                <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">EMPLOYÉS / DÉTAILS</p>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{employee.prenom} {employee.nom}</h1>
                <p className="text-slate-600">{employee.poste?.intitule} • {employee.departement?.nom}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white transition-all duration-200"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-8 space-y-8">

              {/* Informations personnelles */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <User size={20} className="text-primary-600" />
                  Informations personnelles
                </h2>

                {/* Photo de profil */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="relative">
                    <Avatar nom={employee.nom} prenom={employee.prenom} size="xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Photo de profil</p>
                    <p className="text-xs text-slate-500">Image de l'employé</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Prénom</label>
                      <p className="text-sm text-slate-900">{employee.prenom}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Nom</label>
                      <p className="text-sm text-slate-900">{employee.nom}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Mail size={16} className="text-slate-500" />
                        Email professionnel
                      </label>
                      <p className="text-sm text-slate-900">{employee.emailPro}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Phone size={16} className="text-slate-500" />
                        Téléphone
                      </label>
                      <p className="text-sm text-slate-900">{employee.telephone}</p>
                    </div>
                    {employee.rib && (
                      <div>
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                          <CreditCard size={16} className="text-slate-500" />
                          IBAN
                        </label>
                        <p className="text-sm text-slate-900 font-mono">{employee.rib}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations professionnelles */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <Briefcase size={20} className="text-primary-600" />
                  Informations professionnelles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Poste</label>
                      <p className="text-sm text-slate-900">{employee.poste?.intitule}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Département</label>
                      <p className="text-sm text-slate-900">{employee.departement?.nom}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Calendar size={16} className="text-slate-500" />
                        Date d'embauche
                      </label>
                      <p className="text-sm text-slate-900">{formatDate(employee.dateEmbauche)}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Type de contrat</label>
                      <Badge variant="blue" size="sm">{TYPE_CONTRAT_LABELS[employee.typeContrat]}</Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Salaire de base</label>
                      <p className="text-sm text-slate-900 font-semibold">{employee.salaireBase.toLocaleString()} CFA</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}