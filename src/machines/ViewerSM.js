import { GLOBAL_STATE_ATTR, PAGES, ASSET_TYPES } from "../modules/Constant";
import { isNumber } from "../utils/lodashUtils";
import {
  checkAssetsLoaded,
  setUpScene,
  downloadAssetsInSequence,
} from "../utils/modelUtils";
import sceneConfig from "../static/sceneConfig.json";
import WaitSM from "./WaitSM";
import { generateUUID } from "three/src/math/MathUtils";

export const VIEWER_SM_CONST = {
  // States
  VIEWER_SM_LOADING: "VIEWER_SM_LOADING",
  VIEWER_SM_CREATE_SCENE: "VIEWER_SM_CREATE_SCENE",
  VIEWER_SM_SCENE_READY: "VIEWER_SM_SCENE_READY",
  VIEWER_SM_READY: "VIEWER_SM_READY",
};

const ViewerSM = (actions) => ({
  id: VIEWER_SM_CONST.VIEWER_SM_ID,
  initial: VIEWER_SM_CONST.VIEWER_SM_LOADING,
  states: {
    [VIEWER_SM_CONST.VIEWER_SM_LOADING]: {
      entry: [
        () => actions.RootStore().setLoading(true),
        () => actions.RootStore().setModelId(generateUUID()),
        () => downloadAssetsInSequence(actions),
      ],
      ...WaitSM(
        checkAssetsLoaded(actions, [ASSET_TYPES.HDRI], () =>
          Object.keys(sceneConfig.assets)
        )
      ),
      onDone: VIEWER_SM_CONST.VIEWER_SM_CREATE_SCENE,
    },
    [VIEWER_SM_CONST.VIEWER_SM_CREATE_SCENE]: {
      entry: [
        () => {
          actions.Web3DScene.createScene(
            sceneConfig.rendererConfig,
            actions.GlobalState.getAttr(GLOBAL_STATE_ATTR.BACKGROUND_COLOR)
          );
          actions.Web3DScene.setCameraConfig(sceneConfig.camera);
          setUpScene(actions);
          actions.Web3DScene.addSceneToDOM();
        },
        () => actions.Web3DScene.hideScene(true),
      ],
      ...WaitSM(
        checkAssetsLoaded(actions, [ASSET_TYPES.GLTF], () => {
          return [actions.RootStore().selectedGlb.id];
        })
      ),
      onDone: { target: VIEWER_SM_CONST.VIEWER_SM_SCENE_READY },
    },
    [VIEWER_SM_CONST.VIEWER_SM_SCENE_READY]: {
      entry: [
        () => actions.Web3DScene.enableRenderLoop(),
        async () => {
          const envConfig = sceneConfig.environmentLight;
          const { selectedGlbAssetId: assetId, modelId } = actions.RootStore();
          const assetObject = await actions.AssetLoader.getGltf(assetId);
          console.log(`🚀 ~ ViewerSM ~ assetObject:`, assetObject);
          const clonedObject = actions.Web3DScene.cloneandAddModel(
            assetObject,
            modelId
          );
          actions.Web3DScene.updateModelOnLoad(modelId);
          const modelObject = actions.Web3DScene.getModel(modelId);
          const materials = Object.keys(modelObject?.materials ?? {});
          actions.RootStore().setMaterials(materials);
          actions.RootStore().setSelectedMaterial(materials[0] ?? "");
          // actions.Web3DScene.setSceneCenterModel(
          //   actions.Web3DScene.getModel(modelId)
          // );
          clonedObject.name = modelId;
          actions.Web3DScene.addModelToScene(modelId, clonedObject);
          actions.Web3DScene.addGroundToScene();

          if (isNumber(envConfig?.exposure)) {
            actions.Web3DScene.updateEnvMapIntensity(
              modelId,
              envConfig?.exposure
            );
          }

          // actions.Web3DScene.centerAndScale(clonedObject);
          actions.Web3DScene.setCameraController(sceneConfig.orbitControls);
          actions.Event.sendSMEvent("VIEWER_IS_READY");
        },
      ],
      on: {
        VIEWER_IS_READY: [VIEWER_SM_CONST.VIEWER_SM_READY],
      },
    },
    UPDATE_TEXTURE: {
      entry: [
        async () => {
          const { selectedTexture } = actions.RootStore();
          await actions.AssetLoader.loadAllAssets(
            {
              [selectedTexture.id]: {
                url: selectedTexture.url,
                type: ASSET_TYPES.TEXTURE,
              },
            },
            [selectedTexture.id]
          );
        },
      ],
      on: {
        ASSET_LOADED: {
          target: VIEWER_SM_CONST.VIEWER_SM_READY,
          actions: [
            async () => {
              const { modelId, selectedTexture, selectedMaterial, setLoading } =
                actions.RootStore();
              const assetObject = await actions.AssetLoader.getAsset(
                selectedTexture.id
              );
              actions.Web3DScene.applyMaterial(
                modelId,
                selectedMaterial,
                assetObject
              );
              setLoading(false);
            },
          ],
        },
      },
    },
    UPDATE_GLB: {
      entry: [
        async () => {
          const { modelId, selectedGlb, selectedGlbAssetId } =
            actions.RootStore();
          actions.Web3DScene.removeModelFromScene(modelId);
          actions.AssetLoader.removeAsset(selectedGlbAssetId);
          await actions.AssetLoader.loadAllAssets(
            {
              [selectedGlbAssetId]: {
                url: selectedGlb.url,
                type: ASSET_TYPES.GLTF,
              },
            },
            [selectedGlbAssetId]
          );
        },
      ],
      on: {
        ASSET_LOADED: {
          target: VIEWER_SM_CONST.VIEWER_SM_READY,
          actions: [
            async () => {
              const { modelId, selectedGlbAssetId, setLoading } =
                actions.RootStore();
              console.log(`🚀 ~ selectedGlbAssetId:`, selectedGlbAssetId);
              const assetObject = await actions.AssetLoader.getGltf(
                selectedGlbAssetId
              );
              const clonedObject = actions.Web3DScene.cloneandAddModel(
                assetObject,
                modelId
              );
              actions.Web3DScene.updateModelOnLoad(modelId);
              const modelObject = actions.Web3DScene.getModel(modelId);
              const materials = Object.keys(modelObject?.materials ?? {});
              actions.RootStore().setMaterials(materials);
              actions.RootStore().setSelectedMaterial(materials[0] ?? "");
              clonedObject.name = modelId;
              actions.Web3DScene.addModelToScene(modelId, clonedObject);
              setLoading(false);
            },
          ],
        },
      },
    },
    [VIEWER_SM_CONST.VIEWER_SM_READY]: {
      entry: [
        () => actions.Web3DScene.hideScene(false),
        () => actions.RootStore().setLoading(false),
        () => actions.RootStore().setPage(PAGES.MODEL_VIEWER),
        () => {
          actions.Web3DScene.addOpacity();
        },
      ],
      on: {
        TEXTURE_CHANGED: "UPDATE_TEXTURE",
        GLB_CHANGED: "UPDATE_GLB",
      },
    },
  },
});

export default ViewerSM;
