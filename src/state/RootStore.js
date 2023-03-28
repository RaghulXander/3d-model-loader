import { create } from "zustand";
import { APP_MODE, DEFAULT_GLB } from "../modules/Constant";

const store = (set, get) => ({
  page: null,
  setPage: (page) => {
    set({ page });
  },
  loading: true,
  setLoading: (loading) => set({ loading }),
  appMode: APP_MODE.VIEWER,
  setAppMode: (appMode) => {
    set({ appMode });
  },
  setMaterials: (materials) => set({ glbMaterials: materials }),
  glbMaterials: [],
  setSelectedMaterial: (selectedMaterial) => set({ selectedMaterial }),
  selectedMaterial: "",
  setTexture: (selectedTexture) => set({ selectedTexture }),
  selectedTexture: null,
  selectedGlb: Object.values(DEFAULT_GLB)[0],
  selectedGlbAssetId: Object.keys(DEFAULT_GLB)[0],
  setSelectedGLB: (selectedGlb) =>
    set({ selectedGlb, selectedGlbAssetId: selectedGlb.id }),
  modelId: null,
  setModelId: (modelId) => set({ modelId }),
  assetObjects: {},
  setAssetObjects: (assetObject) => {
    const assetObjects = get()?.assetObjects;
    set({ ...assetObjects, assetObject });
  },
});
const useRootStore = create(store);
const RootStore = useRootStore.getState;
export { useRootStore, RootStore };
