'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Modal from '@/components/shared/Modal';
import { Calculator, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  employe_id: z.number().min(1, 'L\'employé est requis'),
  mois: z.number().min(1).max(12),
  annee: z.number().min(2020).max(2100),
  salaire_base: z.number().min(0),
  heures_sup: z.number().min(0),
  absences: z.number().min(0),
});

type FormData = z.infer<typeof schema>;

const fetchEmployes = async () => {
  const response = await api.get<{ data: any[] }>('/employes', { params: { per_page: 100 } });
  return response.data.data;
};

const fetchContrat = async (employeId: number) => {
  const response = await api.get<{ data: any }>(`/contrats`, {
    params: { employe_id: employeId, statut: 'actif', per_page: 1 },
  });
  return response.data.data?.[0];
};

const createFichePaie = async (data: FormData) => {
  const response = await api.post('/fiches-paie', data);
  return response.data;
};

interface AddFichePaieModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddFichePaieModal({ isOpen, onClose }: AddFichePaieModalProps) {
  const queryClient = useQueryClient();
  const [calculatedNet, setCalculatedNet] = useState<number>(0);

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      employe_id: 0,
      mois: new Date().getMonth() + 1,
      annee: new Date().getFullYear(),
      salaire_base: 0,
      heures_sup: 0,
      absences: 0,
    },
  });

  const { data: employes = [] } = useQuery({
    queryKey: ['employes'],
    queryFn: fetchEmployes,
    enabled: isOpen,
  });

  const employeId = watch('employe_id');
  const salaireBase = watch('salaire_base');
  const heuresSup = watch('heures_sup');
  const absences = watch('absences');

  const { data: contrat } = useQuery({
    queryKey: ['contrat-actif', employeId],
    queryFn: () => fetchContrat(employeId),
    enabled: !!employeId && isOpen,
  });

  useEffect(() => {
    if (contrat?.salaire_base && salaireBase === 0) {
      setValue('salaire_base', contrat.salaire_base);
    }
  }, [contrat, salaireBase, setValue]);

  useEffect(() => {
    // Calcul simplifié du net à payer
    const tauxHoraireSup = salaireBase / 151.67 * 1.25;
    const deductionAbsences = (salaireBase / 21.67) * absences;
    const brut = salaireBase + (heuresSup * tauxHoraireSup) - deductionAbsences;
    const cotisations = brut * 0.23; // ~23% de cotisations
    const net = brut - cotisations;
    setCalculatedNet(Math.max(0, net));
  }, [salaireBase, heuresSup, absences]);

  const mutation = useMutation({
    mutationFn: createFichePaie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiches-paie'] });
      reset();
      setCalculatedNet(0);
      onClose();
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Générer une fiche de paie" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employé</label>
            <select
              {...register('employe_id', { valueAsNumber: true })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Sélectionner un employé</option>
              {employes.map((emp: any) => (
                <option key={emp.id} value={emp.id}>
                  {emp.prenom} {emp.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mois</label>
            <select
              {...register('mois', { valueAsNumber: true })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            >
              {months.map((m, i) => (
                <option key={i + 1} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Année</label>
            <select
              {...register('annee', { valueAsNumber: true })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            >
              {[2024, 2025, 2026, 2027].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Salaire base (€)</label>
            <input
              type="number"
              step="0.01"
              {...register('salaire_base', { valueAsNumber: true })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Heures supplémentaires</label>
            <input
              type="number"
              {...register('heures_sup', { valueAsNumber: true })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Absences (jours)</label>
            <input
              type="number"
              {...register('absences', { valueAsNumber: true })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        {/* Calcul automatique */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Calculator size={18} className="text-purple-600" />
            <span className="font-medium text-purple-900">Calcul automatique</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            Net à payer estimé: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(calculatedNet)}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-purple-600 px-4 py-2.5 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin inline mr-2" />
                Génération...
              </>
            ) : (
              'Générer la fiche'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
