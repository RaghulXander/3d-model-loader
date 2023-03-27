import * as THREE from "three";

import { ASSET_EVENTS } from "../modules/Constant";

import sceneConfig from "../static/sceneConfig.json";

export const executeInSequence = async (promises) => {
  for (let i = 0; i < promises.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await promises[i]();
  }
};

export function buildGraph(object) {
  const data = { nodes: {}, materials: {} };
  if (object) {
    object.traverse((obj) => {
      if (obj.name) {
        data.nodes[obj.name] = obj;
      }
      if (obj.material && !data.materials[obj.material.name]) {
        data.materials[obj.material.name] = obj.material;
      }
    });
  }

  return data;
}

export function assignDeepProperties(property, config) {
  Object.entries(config).forEach(([key, value]) => {
    if (typeof value === "object") {
      assignDeepProperties(property[key], value);
    } else {
      property[key] = value;
    }
  });
}

export const filterAssetObjects = (assets, typesArray) => {
  const assetObject = {};

  Object.entries(assets).forEach(([assetkey, metaobject]) => {
    if (typesArray.includes(metaobject.type))
      assetObject[assetkey] = assets[assetkey];
  });

  return assetObject;
};

export const setUpScene = (actions) => {
  const { scene, renderer } = actions.Web3DScene.getSceneDetails();
  if (sceneConfig?.rendererConfig) {
    const rendererConfig = sceneConfig.rendererConfig;
    renderer.physicallyCorrectLights = rendererConfig?.physicallyCorrectLights;
    renderer.outputEncoding = rendererConfig?.outputEncoding
      ? rendererConfig.outputEncoding
      : THREE.sRGBEncoding;
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

    //Enabling shadow rendering
    renderer.shadowMap.enabled = rendererConfig?.shadowMap?.enabled;
    renderer.shadowMap.type = rendererConfig?.shadowMap?.type
      ? rendererConfig?.shadowMap?.type
      : THREE.PCFSoftShadowMap;

    //Enabling tone mapping
    if (rendererConfig?.toneMapping) {
      renderer.toneMapping = rendererConfig?.toneMapping?.type;
      renderer.toneMappingExposure = rendererConfig?.toneMapping?.exposure;
    } else {
      renderer.toneMapping = THREE.NoToneMapping;
    }
  }
  if (sceneConfig?.ambientLight) {
    actions.Web3DScene.setAmbientLight(scene, sceneConfig.ambientLight);
  }
  if (sceneConfig?.shadowConfig) {
    actions.Web3DScene.setShadowSettings(scene, sceneConfig.shadowConfig);
  }
  if (sceneConfig?.directionalLights) {
    actions.Web3DScene.setDirectionalLights(
      scene,
      sceneConfig.directionalLights
    );
  }
  if (sceneConfig?.environmentLight) {
    actions.Web3DScene.addEnvironmentLight(
      scene,
      renderer,
      sceneConfig?.environmentLight,
      actions.AssetLoader.getAsset
    );
  }
};

const downloadAssetsInOrder = (actions) => {
  const downloadSceneAssets = () => {
    const { assets } = sceneConfig;
    return actions.AssetLoader.loadAllAssets(assets);
  };

  const downloadGLBAssets = () => {
    const { selectedGlb, selectedGlbAssetId } = actions.RootStore();
    return actions.AssetLoader.loadAllAssets({
      [selectedGlbAssetId]: selectedGlb,
    });
  };

  return [downloadSceneAssets, downloadGLBAssets];
};

export const downloadAssetsInSequence = (actions) => {
  executeInSequence(downloadAssetsInOrder(actions));
};

export const checkAssetsLoaded = (
  actions,
  filterArray,
  getIdList = () => []
) => {
  return {
    conds: [
      () => {
        const assets = actions.RootStore().assetObjects;

        const result = actions.AssetLoader.isAssetObjectsLoaded(
          filterAssetObjects(assets, filterArray)
        );

        return result;
      },
      () => {
        const idList = getIdList();
        const result = actions.AssetLoader.isAssetIdsLoaded(idList);

        return result;
      },
    ],
    events: [ASSET_EVENTS.ASSET_LOADED, ASSET_EVENTS.CONFIG_LOADED],
  };
};
