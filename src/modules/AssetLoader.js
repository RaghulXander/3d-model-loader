import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader";
import { ASSET_EVENTS, ASSET_TYPES } from "./Constant";
import { buildGraph } from "../utils/modelUtils";

import Event from "./Event";

const initAssetLoader = () => {
  // Draco Loader
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("./draco/gltf/");
  dracoLoader.preload();

  // GLTF with KTX Loaders
  const gltfLoader = new GLTFLoader();
  const ktx2Loader = new KTX2Loader();

  const renderer = new THREE.WebGLRenderer();

  ktx2Loader.setTranscoderPath("./basis/");
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.setKTX2Loader(ktx2Loader.detectSupport(renderer));

  // RGBE Loader
  const rgbeLoader = new RGBELoader();
  rgbeLoader.setDataType(THREE.HalfFloatType);
  const textureLoader = new THREE.TextureLoader();

  // map id -> assetObject
  const assetsMap = {};
  // map of id => {type, url}
  const assetMetaMap = {};
  //  map of id -> {blob object}
  const assetsMapNetwork = {};

  // Event that says asset loaded
  const loadedEvent = (assetMeta) =>
    Event.sendSMEvent(ASSET_EVENTS.ASSET_LOADED, assetMeta);

  const createNewGltf = async (id) => {
    if (assetsMap[id]) {
      console.log("model already loaded", assetsMap[id]);
      return;
    }
    const objectURL = URL.createObjectURL(assetsMapNetwork[id]);
    return new Promise((resolve) => {
      gltfLoader.load(
        objectURL,
        (gltfObject) => {
          const model = gltfObject.scene;
          model.traverse((object) => {
            if (object.isMesh) {
              object.castShadow = true;
              // object.geometry.center(); // center here
              // object.receiveShadow = true;
              if (object.material.map) object.material.map.anisotropy = 16;
            }
          });
          console.log("gltf loaded successfully", gltfObject.scene);
          const nodeMaterialObject = buildGraph(gltfObject.scene);
          gltfObject.nodes = nodeMaterialObject.nodes;
          gltfObject.materials = nodeMaterialObject.materials;
          resolve(gltfObject);
        },
        () => {},
        (event) => {
          console.log(" gltf error events", event);
          resolve(null);
        }
      );
    });
  };

  const loadTexture = async (id, assetMeta) => {
    if (assetsMap[id]) {
      console.log("texture already loaded", assetsMap[id]);
      return;
    }
    await new Promise((resolve) => {
      textureLoader.load(assetMeta.url, (texture) => {
        texture.encoding = THREE.sRGBEncoding;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        assetsMap[id] = texture;
        loadedEvent(assetMeta);
        resolve();
      });
    });
  };

  const loadHDRI = async (id, assetMeta) => {
    if (assetsMap[id]) {
      console.log("hdri already loaded", assetsMap[id]);
      return;
    }
    await new Promise((resolve) => {
      rgbeLoader.load(assetMeta.url, (texture) => {
        assetsMap[id] = texture;
        loadedEvent(assetMeta);
        resolve();
      });
    });
  };

  const loadAsset = async (id, assetMeta) => {
    if (assetsMapNetwork[id]) {
      console.log("Response object already saved for the asset", assetsMap[id]);
      return;
    }

    if (
      assetMeta.type !== ASSET_TYPES.GLTF &&
      assetMeta.type !== ASSET_TYPES.KTX_TEXTURE
    ) {
      return;
    }
    assetsMapNetwork[id] = await fetch(assetMeta.url).then((response) =>
      response.blob()
    );
  };

  const networkLoader = async (assetMetaObject, idList) => {
    const promises = [];
    idList.forEach((id) => {
      const assetMeta = assetMetaObject[id];
      promises.push(loadAsset(id, assetMeta));
    });
    await Promise.all(promises);
  };

  // expecting object of id: {type, url}
  const loadAssets = async (assetMetaObject, idList) => {
    const promises = [];
    idList.forEach((id) => {
      const assetMeta = assetMetaObject[id];
      assetMetaMap[id] = assetMeta;
      switch (assetMeta.type) {
        case ASSET_TYPES.TEXTURE: {
          promises.push(loadTexture(id, assetMeta));
          break;
        }
        case ASSET_TYPES.HDRI: {
          promises.push(loadHDRI(id, assetMeta));
          break;
        }
        default:
          console.log("invalid type loaded", assetMeta);
      }
    });
    await Promise.all(promises);
  };
  const loadAllAssets = async (assetMetaObject) => {
    await networkLoader(assetMetaObject, Object.keys(assetMetaObject));
    await loadAssets(assetMetaObject, Object.keys(assetMetaObject));
    loadedEvent();
  };

  const isAssetIdsLoaded = (idList) => {
    return idList.every((id) => {
      const flag =
        id in assetMetaMap && (assetsMap[id] || assetsMapNetwork[id]);
      if (!flag)
        console.log("isAssetIdsLoaded not loaded for", id, assetMetaMap[id]);
      return flag;
    });
  };
  return {
    isAssetObjectsLoaded: (assetObject) => {
      return isAssetIdsLoaded(Object.keys(assetObject));
    },
    isAssetIdsLoaded,
    getAsset: (id) => {
      console.log("Inside getAsset", id, assetsMap);
      return assetsMap[id];
    },
    getAssets: (idList) => {
      return idList.map((id) => assetsMap[id]);
    },
    removeAsset: (id) => {
      if (assetsMap[id]) delete assetsMap[id];
      if (assetMetaMap[id]) delete assetMetaMap[id];
    },
    getGltf: async (id) => {
      const gltf = await createNewGltf(id);
      return gltf;
    },
    loadAllAssets,
    loadAssets,
  };
};

const AssetLoader = initAssetLoader();
export default AssetLoader;
