"use client";
import React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { formatDate, TYPE_CONTRAT_LABELS, STATUT_EMPLOYE_LABELS } from "@/lib/utils";
import type { Employe } from "@/types";
import "@/styles/employees-liquid-glass.css";

interface EmployeesTableProps {
  employees: Employe[];
  onView: (emp: Employe) => void;
  onEdit: (emp: Employe) => void;
  onDelete: (emp: Employe) => void;
  deletingId?: string;
}

export function EmployeesTable({
  employees,
  onView,
  onEdit,
  onDelete,
  deletingId,
}: EmployeesTableProps) {
  return (
    <div className="glass-container overflow-hidden">
      <div className="overflow-x-auto">
        <table className="employees-table">
          <thead>
            <tr>
              <th style={{ width: "25%" }}>Nom complet</th>
              <th style={{ width: "18%" }}>Poste</th>
              <th style={{ width: "18%" }}>Département</th>
              <th style={{ width: "18%" }}>Email</th>
              <th style={{ width: "12%" }}>Embauché</th>
              <th style={{ width: "9%" }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr
                key={emp.id}
                className={`${deletingId === emp.id ? "row-deleting" : ""}`}
              >
                {/* Name */}
                <td>
                  <div className="emp-name">
                    <div className="emp-avatar">
                      {emp.prenom.charAt(0)}
                      {emp.nom.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {emp.prenom} {emp.nom}
                      </div>
                      <div style={{ fontSize: "12px", opacity: 0.6 }}>
                        {emp.matricule}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Position */}
                <td>{emp.poste?.intitule || "-"}</td>

                {/* Department */}
                <td>{emp.departement?.nom || "-"}</td>

                {/* Email */}
                <td style={{ fontSize: "13px", opacity: 0.75 }}>{emp.email}</td>

                {/* Hire Date */}
                <td style={{ opacity: 0.75 }}>{formatDate(emp.dateEmbauche)}</td>

                {/* Status */}
                <td>
                  <span
                    className={`emp-status-badge ${
                      emp.statut === "ACTIF" ? "status-active" : "status-inactive"
                    }`}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        display: "inline-block",
                        background: "currentColor",
                      }}
                    />
                    {STATUT_EMPLOYE_LABELS[emp.statut]}
                  </span>
                </td>

                {/* Actions */}
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => onView(emp)}
                      className="btn-action btn-view"
                      title="Voir"
                      aria-label="Voir le profil"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(emp)}
                      className="btn-action btn-edit"
                      title="Modifier"
                      aria-label="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(emp)}
                      className="btn-action btn-delete"
                      title="Supprimer"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
