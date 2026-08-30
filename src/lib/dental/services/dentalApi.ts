// ============================================
// DENTAL API SERVICE (Enterprise Persistence Layer)
// ============================================

import { supabase, isSupabaseConfigured } from '../../supabase/client';
import { 
  Tooth, 
  ToothHistory, 
  PeriodontalChart, 
  Radiograph, 
  RadiographType, 
  TreatmentPlan, 
  TreatmentPlanItem, 
  createDefaultTeeth, 
  ToothSurface, 
  SurfaceCondition 
} from '../types';

// In-Memory & LocalStorage Cache fallback for resilience
const LOCAL_STORAGE_PREFIX = 'cura_dental_';

const getLocalData = <T>(key: string, defaultVal: T): T => {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const setLocalData = <T>(key: string, val: T): void => {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, JSON.stringify(val));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
};

export class DentalApiService {
  // ============================================
  // TEETH OPERATIONS
  // ============================================

  static async getTeeth(patientId: string): Promise<Tooth[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('dental_teeth')
          .select('*')
          .eq('patient_id', patientId)
          .order('tooth_number', { ascending: true });

        if (!error && data && data.length > 0) {
          setLocalData(`teeth_${patientId}`, data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase getTeeth error, falling back to local:', err);
      }
    }

    // Default seeded teeth if not yet in storage
    const cached = getLocalData<Tooth[]>(`teeth_${patientId}`, []);
    if (cached.length === 32) return cached;

    const defaults = createDefaultTeeth(patientId);
    // Seed initial realistic dental conditions
    [3, 14, 19, 30].forEach(num => {
      const t = defaults.find(d => d.toothNumber === num);
      if (t) {
        t.status = 'Caries';
        t.condition = num === 14 ? 'Class II Occlusal-Distal Caries (D2 Depth)' : 'Class I Occlusal Pit Caries (D1 Depth)';
        t.surfaces.occlusal = { surface: 'occlusal', condition: 'Caries', notes: 'Demineralized groove' };
        if (num === 14) {
          t.surfaces.distal = { surface: 'distal', condition: 'Caries', notes: 'Interproximal lesion' };
        }
      }
    });

    [18, 31].forEach(num => {
      const t = defaults.find(d => d.toothNumber === num);
      if (t) {
        t.status = 'Restored';
        t.condition = 'Amalgam Restoration (Intact margins)';
        t.surfaces.occlusal = { surface: 'occlusal', condition: 'Restored' };
      }
    });

    [1, 16, 17, 32].forEach(num => {
      const t = defaults.find(d => d.toothNumber === num);
      if (t) {
        t.status = 'Impacted';
        t.condition = 'Mesioangular Third Molar Impaction';
      }
    });

    [21, 23, 25, 27].forEach(num => {
      const t = defaults.find(d => d.toothNumber === num);
      if (t) {
        t.status = 'Crown';
        t.condition = 'Zirconia Monolithic Crown';
        t.surfaces.occlusal = { surface: 'occlusal', condition: 'Restored' };
        t.surfaces.buccal = { surface: 'buccal', condition: 'Restored' };
        t.surfaces.lingual = { surface: 'lingual', condition: 'Restored' };
      }
    });

    setLocalData(`teeth_${patientId}`, defaults);
    return defaults;
  }

  static async getTooth(patientId: string, toothNumber: number): Promise<Tooth | null> {
    const teeth = await this.getTeeth(patientId);
    return teeth.find(t => t.toothNumber === toothNumber) || null;
  }

  static async upsertTooth(tooth: Tooth): Promise<Tooth> {
    const now = new Date().toISOString();
    const updated: Tooth = {
      ...tooth,
      updatedAt: now,
      version: (tooth.version || 0) + 1
    };

    // Update local cache
    const current = getLocalData<Tooth[]>(`teeth_${tooth.patientId}`, []);
    const idx = current.findIndex(t => t.toothNumber === tooth.toothNumber);
    if (idx >= 0) {
      current[idx] = updated;
    } else {
      current.push(updated);
    }
    setLocalData(`teeth_${tooth.patientId}`, current);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('dental_teeth')
          .upsert({
            patient_id: updated.patientId,
            tooth_number: updated.toothNumber,
            status: updated.status,
            surfaces: updated.surfaces,
            condition: updated.condition,
            notes: updated.notes,
            restoration: updated.restoration,
            updated_at: updated.updatedAt,
            version: updated.version
          }, { onConflict: 'patient_id,tooth_number' });
      } catch (err) {
        console.warn('Supabase tooth upsert skipped:', err);
      }
    }

    return updated;
  }

  static async updateToothStatus(
    patientId: string,
    toothNumber: number,
    status: Tooth['status'],
    condition: string,
    userId: string
  ): Promise<Tooth> {
    const tooth = await this.getTooth(patientId, toothNumber);
    if (!tooth) throw new Error('Tooth not found');

    const now = new Date().toISOString();
    const updated: Tooth = {
      ...tooth,
      status,
      condition,
      updatedAt: now,
      updatedBy: userId,
      version: tooth.version + 1
    };

    await this.recordToothHistory(tooth, updated, userId, 'status_change');
    return this.upsertTooth(updated);
  }

  static async updateToothSurface(
    patientId: string,
    toothNumber: number,
    surface: ToothSurface,
    condition: SurfaceCondition,
    userId: string
  ): Promise<Tooth> {
    const tooth = await this.getTooth(patientId, toothNumber);
    if (!tooth) throw new Error('Tooth not found');

    const now = new Date().toISOString();
    const updated: Tooth = {
      ...tooth,
      surfaces: {
        ...tooth.surfaces,
        [surface]: {
          surface,
          condition,
          notes: condition === 'Healthy' ? '' : `${condition} diagnosed on ${surface}`
        }
      },
      updatedAt: now,
      updatedBy: userId,
      version: tooth.version + 1
    };

    await this.recordToothHistory(tooth, updated, userId, 'surface_change');
    return this.upsertTooth(updated);
  }

  // ============================================
  // TOOTH HISTORY
  // ============================================

  static async recordToothHistory(
    previous: Tooth,
    current: Tooth,
    userId: string,
    action: ToothHistory['action']
  ): Promise<void> {
    const history: ToothHistory = {
      id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      toothId: current.id,
      patientId: current.patientId,
      toothNumber: current.toothNumber,
      previousState: {
        status: previous.status,
        condition: previous.condition,
        surfaces: previous.surfaces
      },
      newState: {
        status: current.status,
        condition: current.condition,
        surfaces: current.surfaces
      },
      action,
      performedBy: userId,
      performedAt: new Date().toISOString()
    };

    const logs = getLocalData<ToothHistory[]>(`tooth_history_${current.patientId}`, []);
    logs.unshift(history);
    setLocalData(`tooth_history_${current.patientId}`, logs);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('dental_teeth_history').insert(history);
      } catch (err) {
        console.warn('History insertion skipped:', err);
      }
    }
  }

  static async getToothHistory(patientId: string, toothNumber: number): Promise<ToothHistory[]> {
    const logs = getLocalData<ToothHistory[]>(`tooth_history_${patientId}`, []);
    return logs.filter(l => l.toothNumber === toothNumber);
  }

  // ============================================
  // PERIODONTAL CHARTING (6-POINT PROBING)
  // ============================================

  static async getPeriodontal(patientId: string): Promise<PeriodontalChart[]> {
    const cached = getLocalData<PeriodontalChart[]>(`periodontal_${patientId}`, []);
    if (cached.length === 32) return cached;

    const now = new Date().toISOString();
    const defaults: PeriodontalChart[] = Array.from({ length: 32 }, (_, i) => {
      const toothNumber = i + 1;
      const hasDeepPocket = [3, 14, 19, 30].includes(toothNumber);
      return {
        id: `perio-${toothNumber}-${Date.now()}`,
        patientId,
        toothNumber,
        probingDepth: {
          mesioBuccal: hasDeepPocket ? 5 : 2.5,
          midBuccal: hasDeepPocket ? 4 : 2.0,
          distoBuccal: hasDeepPocket ? 4.5 : 2.5,
          mesioLingual: hasDeepPocket ? 4.5 : 2.5,
          midLingual: hasDeepPocket ? 3.5 : 2.0,
          distoLingual: hasDeepPocket ? 5 : 2.5
        },
        gingivalMargin: {
          mesioBuccal: 0,
          midBuccal: hasDeepPocket ? 1 : 0,
          distoBuccal: 0,
          mesioLingual: 0,
          midLingual: 0,
          distoLingual: 0
        },
        clinicalAttachmentLoss: hasDeepPocket ? 4 : 1,
        mobility: hasDeepPocket ? 'grade1' : 'normal',
        furcation: hasDeepPocket ? 'grade1' : 'none',
        bleedingOnProbing: {
          mesioBuccal: hasDeepPocket,
          midBuccal: false,
          distoBuccal: hasDeepPocket,
          mesioLingual: hasDeepPocket,
          midLingual: false,
          distoLingual: hasDeepPocket
        },
        suppuration: {
          buccal: false,
          lingual: false
        },
        plaque: hasDeepPocket,
        calculus: hasDeepPocket,
        createdAt: now,
        updatedAt: now,
        createdBy: 'dentist-001',
        updatedBy: 'dentist-001'
      };
    });

    setLocalData(`periodontal_${patientId}`, defaults);
    return defaults;
  }

  static async upsertPeriodontal(chart: PeriodontalChart): Promise<PeriodontalChart> {
    const now = new Date().toISOString();
    const updated = { ...chart, updatedAt: now };

    const current = getLocalData<PeriodontalChart[]>(`periodontal_${chart.patientId}`, []);
    const idx = current.findIndex(p => p.toothNumber === chart.toothNumber);
    if (idx >= 0) {
      current[idx] = updated;
    } else {
      current.push(updated);
    }
    setLocalData(`periodontal_${chart.patientId}`, current);
    return updated;
  }

  // ============================================
  // RADIOGRAPHS & DICOM-STYLE PREVIEWS
  // ============================================

  static async getRadiographs(patientId: string): Promise<Radiograph[]> {
    const cached = getLocalData<Radiograph[]>(`radiographs_${patientId}`, []);
    if (cached.length > 0) return cached;

    const initial: Radiograph[] = [
      {
        id: 'rx-ortho-01',
        patientId,
        name: 'Full Orthopantomogram (OPG Panoramic)',
        date: '2026-08-15',
        type: 'panoramic',
        imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80',
        findings: [
          {
            id: 'find-1',
            toothNumber: 14,
            description: 'Interproximal radiolucency reaching middle third of dentin (D2 Caries)',
            location: 'Tooth #14 Distal',
            confidence: 0.94,
            severity: 'moderate',
            reviewed: true,
            accepted: true,
            clinicalNote: 'Confirmed on clinical bitewing'
          },
          {
            id: 'find-2',
            toothNumber: 19,
            description: 'Coronal radiolucency on occlusal surface extending toward pulp horn',
            location: 'Tooth #19 Occlusal',
            confidence: 0.91,
            severity: 'severe',
            reviewed: true,
            accepted: true
          },
          {
            id: 'find-3',
            toothNumber: 1,
            description: 'Impacted third molar with root apex near maxillary sinus floor',
            location: 'Tooth #1 Apical',
            confidence: 0.97,
            severity: 'mild',
            reviewed: false,
            accepted: false
          }
        ],
        aiStatus: 'completed',
        aiAnalysis: 'High-probability caries detected on #14 (Distal) and #19 (Occlusal). Bilateral mandibular & maxillary third molar impaction noted without cystic pathology.',
        metadata: {
          modality: 'DX',
          acquisitionDate: '2026-08-15T09:30:00Z',
          studyId: 'ST-2026-0815',
          seriesId: 'SER-PAN-01',
          institution: 'CURA Dental Imaging & Diagnostics'
        }
      }
    ];

    setLocalData(`radiographs_${patientId}`, initial);
    return initial;
  }

  static async uploadRadiograph(
    patientId: string,
    file: File,
    userId: string,
    type: RadiographType = 'bitewing'
  ): Promise<Radiograph> {
    const now = new Date().toISOString();
    const objectUrl = URL.createObjectURL(file);

    const newRx: Radiograph = {
      id: `rx-${Date.now()}`,
      patientId,
      name: file.name,
      date: now.split('T')[0],
      type,
      imageUrl: objectUrl,
      aiStatus: 'processing',
      findings: [],
      metadata: {
        modality: 'DX',
        acquisitionDate: now,
        studyId: `ST-${Date.now().toString().slice(-6)}`,
        seriesId: `SER-${Date.now().toString().slice(-4)}`,
        institution: 'CURA Dental Radiology Center'
      },
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId
    };

    const current = getLocalData<Radiograph[]>(`radiographs_${patientId}`, []);
    current.unshift(newRx);
    setLocalData(`radiographs_${patientId}`, current);
    return newRx;
  }

  // ============================================
  // TREATMENT PLAN WITH AUDIT TRAIL
  // ============================================

  static async getTreatmentPlan(patientId: string): Promise<TreatmentPlan> {
    const cached = getLocalData<TreatmentPlan | null>(`tx_plan_${patientId}`, null);
    if (cached) return cached;

    const now = new Date().toISOString();
    const initialPlan: TreatmentPlan = {
      id: `plan-${Date.now()}`,
      patientId,
      date: now,
      status: 'in_progress',
      version: 1,
      items: [
        {
          id: 'tx-item-1',
          toothNumber: 14,
          procedure: 'Class II Composite Restoration (2 Surfaces)',
          code: 'D2392',
          description: 'Distal-Occlusal Resin-based composite on Tooth #14',
          cost: 2400,
          priority: 'high',
          status: 'approved',
          duration: 35,
          notes: 'Shade A2 nanohybrid composite',
          createdBy: 'dentist-001',
          createdAt: now
        },
        {
          id: 'tx-item-2',
          toothNumber: 19,
          procedure: 'Root Canal Therapy - Molar',
          code: 'D3330',
          description: 'Endodontic treatment excluding final restoration',
          cost: 8500,
          priority: 'high',
          status: 'pending',
          duration: 60,
          notes: 'Evaluate pulp vitality before instrumentation',
          createdBy: 'dentist-001',
          createdAt: now
        },
        {
          id: 'tx-item-3',
          toothNumber: 0, // Full mouth
          procedure: 'Full Mouth Scaling & Polishing (Prophylaxis)',
          code: 'D1110',
          description: 'Ultrasonic supragingival and subgingival debridement',
          cost: 1500,
          priority: 'medium',
          status: 'approved',
          duration: 30,
          notes: 'Fluoride varnish application post-scaling',
          createdBy: 'dentist-001',
          createdAt: now
        }
      ],
      totalCost: 12400,
      estimatedDuration: 125,
      auditLog: [
        {
          id: `audit-${Date.now()}`,
          action: 'create',
          performedBy: 'dentist-001',
          performedAt: now,
          notes: 'Initial comprehensive dental treatment plan created'
        }
      ],
      createdBy: 'dentist-001',
      createdAt: now,
      modifiedBy: 'dentist-001',
      modifiedAt: now
    };

    setLocalData(`tx_plan_${patientId}`, initialPlan);
    return initialPlan;
  }

  static async upsertTreatmentPlan(plan: TreatmentPlan): Promise<TreatmentPlan> {
    const now = new Date().toISOString();
    const updated: TreatmentPlan = {
      ...plan,
      modifiedAt: now,
      version: (plan.version || 0) + 1
    };
    setLocalData(`tx_plan_${plan.patientId}`, updated);
    return updated;
  }

  static async addTreatmentItem(
    patientId: string,
    item: Omit<TreatmentPlanItem, 'id' | 'createdAt' | 'createdBy'>,
    userId: string
  ): Promise<TreatmentPlan> {
    const plan = await this.getTreatmentPlan(patientId);
    const now = new Date().toISOString();
    const fullItem: TreatmentPlanItem = {
      ...item,
      id: `tx-item-${Date.now()}`,
      createdAt: now,
      createdBy: userId,
      modifiedAt: now,
      modifiedBy: userId
    };

    const newItems = [...plan.items, fullItem];
    const totalCost = newItems.reduce((acc, i) => acc + i.cost, 0);
    const estimatedDuration = newItems.reduce((acc, i) => acc + i.duration, 0);

    const updatedPlan: TreatmentPlan = {
      ...plan,
      items: newItems,
      totalCost,
      estimatedDuration,
      modifiedAt: now,
      modifiedBy: userId,
      version: plan.version + 1,
      auditLog: [
        ...plan.auditLog,
        {
          id: `audit-${Date.now()}`,
          action: 'create',
          itemId: fullItem.id,
          newValue: fullItem,
          performedBy: userId,
          performedAt: now,
          notes: `Added procedure ${fullItem.code}: ${fullItem.procedure}`
        }
      ]
    };

    return this.upsertTreatmentPlan(updatedPlan);
  }

  static async updateTreatmentItem(
    patientId: string,
    itemId: string,
    updates: Partial<TreatmentPlanItem>,
    userId: string
  ): Promise<TreatmentPlan> {
    const plan = await this.getTreatmentPlan(patientId);
    const prev = plan.items.find(i => i.id === itemId);
    if (!prev) throw new Error('Treatment item not found');

    const now = new Date().toISOString();
    const updatedItems = plan.items.map(item =>
      item.id === itemId
        ? { ...item, ...updates, modifiedAt: now, modifiedBy: userId }
        : item
    );

    const totalCost = updatedItems.reduce((acc, i) => acc + i.cost, 0);
    const estimatedDuration = updatedItems.reduce((acc, i) => acc + i.duration, 0);

    const updatedPlan: TreatmentPlan = {
      ...plan,
      items: updatedItems,
      totalCost,
      estimatedDuration,
      modifiedAt: now,
      modifiedBy: userId,
      version: plan.version + 1,
      auditLog: [
        ...plan.auditLog,
        {
          id: `audit-${Date.now()}`,
          action: updates.status ? 'status_change' : 'update',
          itemId,
          previousValue: prev,
          newValue: { ...prev, ...updates },
          performedBy: userId,
          performedAt: now,
          notes: `Updated procedure: ${prev.procedure}`
        }
      ]
    };

    return this.upsertTreatmentPlan(updatedPlan);
  }

  static async deleteTreatmentItem(
    patientId: string,
    itemId: string,
    userId: string
  ): Promise<TreatmentPlan> {
    const plan = await this.getTreatmentPlan(patientId);
    const prev = plan.items.find(i => i.id === itemId);
    if (!prev) throw new Error('Treatment item not found');

    const now = new Date().toISOString();
    const updatedItems = plan.items.filter(item => item.id !== itemId);
    const totalCost = updatedItems.reduce((acc, i) => acc + i.cost, 0);
    const estimatedDuration = updatedItems.reduce((acc, i) => acc + i.duration, 0);

    const updatedPlan: TreatmentPlan = {
      ...plan,
      items: updatedItems,
      totalCost,
      estimatedDuration,
      modifiedAt: now,
      modifiedBy: userId,
      version: plan.version + 1,
      auditLog: [
        ...plan.auditLog,
        {
          id: `audit-${Date.now()}`,
          action: 'delete',
          itemId,
          previousValue: prev,
          performedBy: userId,
          performedAt: now,
          notes: `Removed procedure ${prev.code}: ${prev.procedure}`
        }
      ]
    };

    return this.upsertTreatmentPlan(updatedPlan);
  }
}
