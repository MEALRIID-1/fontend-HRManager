'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Modal from '@/components/shared/Modal';
import { Calculator, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schéma avec les bons noms de champs
const schema = z.object({
  employe_id: z.number().min(1, "L'employé est obligatoire"),
  mois: z.number().min(1, 'Le mois est obligatoire').max(12),
  annee: z.number().min(2020, 'Année invalide').max(2100),
  salaire_base: z.number().min(0, 'Le salaire de base est obligatoire'),
  heures_sup: z.number().min(0),
  absences: z.number().min(0),
  statut: z.string(),
});

type FormData = z.infer<typeof schema>;

const fetchEmployes = async () => {
  const response = await api.get<{ data: any[] }>('/employes', { params: { per_page: 100 } });
  return response.data.data;
};

// ✅ CORRECTION 1 : Gérer le cas où aucun contrat n'est trouvé
const fetchContrat = async (employeId: number) => {
  if (!employeId) return null;
  
  try {
    const response = await api.get<{ data: any[] }>(`/contrats`, {
      params: { employe_id: employeId, statut: 'actif', per_page: 1 },
    });
    return response.data.data?.[0] || null;
  } catch (error) {
    console.error('Erreur lors de la récupération du contrat:', error);
    return null;
  }
};

const createFichePaie = async (data: FormData) => {
  console.log('Envoi des données:', data);
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
  const [isSalaryLoaded, setIsSalaryLoaded] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      employe_id: 0,
      mois: new Date().getMonth() + 1,
      annee: new Date().getFullYear(),
      salaire_base: 0,
      heures_sup: 0,
      absences: 0,
      statut: 'brouillon',
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

  // ✅ CORRECTION 2 : Ne pas exécuter la requête si employeId est 0 ou undefined
  const { data: contrat, isLoading: isLoadingContrat } = useQuery({
    queryKey: ['contrat-actif', employeId],
    queryFn: () => fetchContrat(employeId),
    enabled: !!employeId && employeId !== 0 && isOpen, // Correction ici
  });

  useEffect(() => {
    setIsSalaryLoaded(false);
  }, [employeId]);

  useEffect(() => {
    // ✅ CORRECTION 3 : Vérifier que contrat existe et a salaire_brut
    if (contrat?.salaire_brut && !isSalaryLoaded && getValues('salaire_base') === 0) {
      setValue('salaire_base', contrat.salaire_brut);
      setIsSalaryLoaded(true);
    }
  }, [contrat, setValue, isSalaryLoaded, getValues]);

  useEffect(() => {
    const tauxHoraire = (salaireBase || 0) / 151.67;
    const montantHeuresSup = (heuresSup || 0) * tauxHoraire * 1.25;
    const deductionAbsences = ((salaireBase || 0) / 22) * (absences || 0);
    const brut = (salaireBase || 0) + montantHeuresSup - deductionAbsences;
    const cotisations = brut * 0.23;
    const net = brut - cotisations;
    setCalculatedNet(Math.max(0, net));
  }, [salaireBase, heuresSup, absences]);

  const mutation = useMutation({
    mutationFn: createFichePaie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiches-paie'] });
      reset();
      setCalculatedNet(0);
      setIsSalaryLoaded(false);
      onClose();
    },
    onError: (error: any) => {
      console.error('Erreur détaillée:', error.response?.data || error);
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log('Soumission du formulaire:', data);
    mutation.mutate(data);
  };

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];

  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Générer une fiche de paie" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Employé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employé</label>
            <select
              {...register('employe_id', { valueAsNumber: true })}
              className={`w-full rounded-lg border ${errors.employe_id ? 'border-red-500' : 'border-gray-300'} px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20`}
            >
              <option value={0}>Sélectionner un employé</option>
              {employes.map((emp: any) => (
                <option key={emp.id} value={emp.id}>
                  {emp.prenom} {emp.nom}
                </option>
              ))}
            </select>
            {errors.employe_id && <p className="text-red-500 text-xs mt-1">{errors.employe_id.message}</p>}
          </div>

          {/* Mois */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mois</label>
            <select
              {...register('mois', { valueAsNumber: true })}
              className={`w-full rounded-lg border ${errors.mois ? 'border-red-500' : 'border-gray-300'} px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20`}
            >
              {months.map((m, i) => (
                <option key={i + 1} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            {errors.mois && <p className="text-red-500 text-xs mt-1">{errors.mois.message}</p>}
          </div>

          {/* Année */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Année</label>
            <select
              {...register('annee', { valueAsNumber: true })}
              className={`w-full rounded-lg border ${errors.annee ? 'border-red-500' : 'border-gray-300'} px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20`}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {errors.annee && <p className="text-red-500 text-xs mt-1">{errors.annee.message}</p>}
          </div>

          {/* Salaire de base */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salaire base (XAF)
              {isLoadingContrat && employeId && employeId !== 0 && <span className="ml-2 text-xs text-gray-500">Chargement...</span>}
              {contrat && !isLoadingContrat && <span className="ml-2 text-xs text-green-600">✓ Auto-chargé</span>}
            </label>
            <input
              type="number"
              step="0.01"
              value={salaireBase || ''}
              onChange={(e) => setValue('salaire_base', parseFloat(e.target.value) || 0)}
              className={`w-full rounded-lg border ${errors.salaire_base ? 'border-red-500' : 'border-gray-300'} px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20`}
              placeholder="0"
            />
            {errors.salaire_base && <p className="text-red-500 text-xs mt-1">{errors.salaire_base.message}</p>}
          </div>

          {/* Heures supplémentaires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Heures supplémentaires</label>
            <input
              type="number"
              step="0.01"
              {...register('heures_sup', { valueAsNumber: true })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          {/* Absences */}
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
            Net à payer estimé:{' '}
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(calculatedNet)}
          </div>
        </div>

        {/* Actions */}
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