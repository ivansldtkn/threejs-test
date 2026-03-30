import { makeAutoObservable, observable, action, computed } from 'mobx';
import { MineGraph } from '../models/MineGraph';
import { Horizon } from '../models/Horizon';
import { Excavation } from '../models/Excavation';
import { Section } from '../models/Section';

export class MineStore {
  mineGraph: MineGraph | null = null;
  selectedHorizon: Horizon | null = null;
  loading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {
      mineGraph: observable,
      selectedHorizon: observable,
      loading: observable,
      error: observable,
      setMineGraph: action,
      setSelectedHorizon: action,
      setLoading: action,
      setError: action,
      toggleExcavation: action,
      visibleSectionsBySelectedHorizon: computed,
      center: computed,
      optimalCameraDistance: computed,
      allHorizons: computed,
      allExcavations: computed,
      excavationsBySelectedHorizon: computed,
    });
  }

  setMineGraph(graph: MineGraph): void {
    this.mineGraph = graph;
    if (graph.getAllHorizons().length > 0) {
      this.selectedHorizon = graph.getAllHorizons()[0];
    }
  }

  setSelectedHorizon(horizon: Horizon): void {
    this.selectedHorizon = horizon;
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
  }

  setError(error: string | null): void {
    this.error = error;
  }

  toggleExcavation(excavation: Excavation): void {
    excavation.toggleVisibility();
  }

  get visibleSectionsBySelectedHorizon(): Section[] {
    if (!this.mineGraph || !this.selectedHorizon) return [];
    return this.mineGraph.getVisibleSectionsByHorizon(this.selectedHorizon.id);
  }

  get center() {
    if (!this.mineGraph) return null;
    return this.mineGraph.getCenter();
  }

  get optimalCameraDistance() {
    if (!this.mineGraph) return null;
    return this.mineGraph.getOptimalCameraDistance();
  }

  get allHorizons(): Horizon[] {
    if (!this.mineGraph) return [];
    return this.mineGraph.getAllHorizons();
  }

  get allExcavations(): Excavation[] {
    if (!this.mineGraph) return [];
    return this.mineGraph.getAllExcavations();
  }

  get excavationsBySelectedHorizon(): Excavation[] {
    if (!this.mineGraph || !this.selectedHorizon) return [];
    return this.mineGraph.getExcavationsByHorizon(this.selectedHorizon.id);
  }
}