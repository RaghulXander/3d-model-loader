/* eslint-disable no-unused-vars */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as TWEEN from "@tweenjs/tween.js";
import { clone } from "three/examples/jsm/utils/SkeletonUtils";

import { buildGraph, assignDeepProperties } from "../utils/modelUtils";
import { isEmpty } from "../utils/lodashUtils";
import { throttle } from "../utils/debounce";

import { ASSET_TYPES, THREEJS_NAMES } from "./Constant";

const RESIZE_UPDATE_INTERVAL = 500;

const mod = () => {
  // Global objects
  let models = {};
  const modelTriggers = {};
  const boxSizes = {};

  // Threejs fundamentals
  let scene = null;
  let shadowLight = null;
  let renderer = null;
  let camera = null;
  let orbitControls = null;

  // Boolean flags
  let renderFlag = true;
  let sceneCreate = false;
  let sceneAddedToDom = false;
  const windowActive = true;
  let updateHelpers = false;

  let animate = () => {};

  const playNext = (animationQueue) => {
    animationQueue.shift();
    if (animationQueue.length > 0) {
      if (animationQueue[0].type === "texture") animationQueue[0].value();
    }
  };

  const instantiateIfNull = (modelId) => {
    const modelObject = models[modelId];
    console.log(
      `🚀 ~ instantiateIfNull ~ modelObject:`,
      modelObject,
      modelTriggers
    );
    if (!(modelId in modelTriggers)) {
      modelTriggers[modelId] = {};
      modelTriggers[modelId].animationQueue = [];
      const { animationQueue } = modelTriggers[modelId];
      const mixerInstance = new THREE.AnimationMixer(modelObject.scene);
      mixerInstance.addEventListener("finished", (data) => {
        modelTriggers[modelId].prevAction = data.action;
        playNext(animationQueue, modelId);
      });
      modelTriggers[modelId].animationMixer = mixerInstance;
      const clock = new THREE.Clock();
      (function anim() {
        // snip
        const delta = clock.getDelta();
        requestAnimationFrame(anim);
        mixerInstance.update(delta);
      })();
    }
  };

  const resizeCanvasToDisplaySize = () => {
    if (renderer === null) {
      return;
    }
    const canvas = renderer.domElement;
    // look up the size the canvas is being displayed
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    // adjust displayBuffer size to match
    if (canvas.width !== width || canvas.height !== height) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  };

  return {
    resizeCanvasToDisplaySize,
    enableRenderLoop: () => {
      renderFlag = true;
      animate();
    },
    getModel: (modelId) => {
      return models[modelId];
    },
    cloneandAddModel: (gltfObject, modelId) => {
      const clonedGltfObject = { ...gltfObject };
      const clonedObject = clone(gltfObject.scene);
      clonedGltfObject.scene = clonedObject;
      const nodeMaterialObject = buildGraph(clonedObject);
      clonedGltfObject.nodes = nodeMaterialObject.nodes;
      clonedGltfObject.materials = nodeMaterialObject.materials;

      models[modelId] = clonedGltfObject;

      return clonedGltfObject;
    },
    updateModelOnLoad: (modelId) => {
      const model = models[modelId];
      const { materials } = model;
      Object.keys(materials).forEach((materialName) => {
        Object.values(materials[materialName]).forEach((attributeValue) => {
          if (attributeValue instanceof THREE.Texture) {
            attributeValue.wrapS = THREE.RepeatWrapping;
            attributeValue.wrapT = THREE.RepeatWrapping;
          }
        });
        materials[materialName].needsUpdate = true;
      });
    },
    updateEnvMapIntensity: (modelId, intensity) => {
      const model = models[modelId];

      Object.values(model.materials).forEach((material) => {
        material.envMapIntensity = intensity;
        material.needsUpdate = true;
      });
    },
    addOpacity: () => {
      const element = document.getElementById(THREEJS_NAMES.SCENE_NAME);
      if (element != null) {
        element.style.opacity = 1;
      }
      renderFlag = true;
      animate();
    },
    addGroundToScene: () => {
      const boxSize = Object.values(boxSizes)[0];
      // ground
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 1, 1),
        new THREE.ShadowMaterial({
          color: 0x000000,
          opacity: 0.05,
        })
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.translateZ(-boxSize.y / 2 - 0.00001);
      mesh.receiveShadow = true;
      scene.add(mesh);
    },
    createScene: (rendererConfig, backgroundColor) => {
      if (sceneCreate) return;
      const canvas = document.getElementById(THREEJS_NAMES.SCENE_NAME);
      canvas.style.opacity = 1;
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.physicallyCorrectLights =
        rendererConfig?.physicallyCorrectLights;
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

      scene = new THREE.Scene();
      scene.background = new THREE.Color(backgroundColor);
      const aspect = window.innerWidth / window.innerHeight;
      camera = new THREE.PerspectiveCamera(45, aspect, 0.01, 1000);
      const clock = new THREE.Clock();

      let delta = clock.getDelta();
      const interval = 1 / 30;
      animate = () => {
        if (renderFlag === true) requestAnimationFrame(animate);
        delta += clock.getDelta();
        if (delta > interval) {
          if (!windowActive) {
            return;
          }
          if (scene == null || renderer == null) return;
          if (orbitControls) {
            orbitControls.update();
          }
          if (updateHelpers) {
            scene.children.forEach((obj) => {
              if (obj.name === THREEJS_NAMES.BOX_HELPER) {
                obj.setFromObject(obj.modelObject);
              }
            });
          }
          TWEEN.update();
          renderer.render(scene, camera);

          delta %= interval;
        }
      };
      sceneCreate = true;
    },
    addSceneToDOM: () => {
      if (renderer == null) return;
      const element = document.getElementById(THREEJS_NAMES.SCENE_NAME);
      if (element != null) element.style.visibility = "visible";
      if (sceneAddedToDom) return;

      requestAnimationFrame(animate);
      resizeCanvasToDisplaySize();
      sceneAddedToDom = true;
    },
    hideScene: (hide) => {
      const element = document.getElementById(THREEJS_NAMES.SCENE_NAME);
      if (element != null) {
        element.style.visibility = hide ? "hidden" : "visible";
      }
    },
    getSceneDetails: () => ({ scene, camera, renderer }),
    setCameraConfig: (config) => {
      if (camera == null || config == null) return;
      // Update the camera attributes
      const attrs = {};
      [
        "aspect",
        "fov",
        "far",
        "near",
        "zoom",
        "filmGauge",
        "filmOffset",
        "focus",
      ].forEach((attr) => {
        if (attr in config) {
          attrs[attr] = config[attr];
        }
      });
      Object.assign(camera, attrs);

      // Update the camera position
      if (config.position) {
        const pos = config.position;
        camera.position.set(pos[0], pos[1], pos[2]);
      }
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      if (camera.view) {
        camera.updateProjectionMatrix();
      }
    },
    setAmbientLight: (sceneArg, ambientLight) => {
      if (sceneArg != null) {
        if (!isEmpty(ambientLight)) {
          const light = new THREE.AmbientLight(
            ambientLight.color,
            ambientLight.intensity
          );
          light.name = THREEJS_NAMES.AMBIENT_LIGHT;
          sceneArg.add(light);
        }
      }
    },
    setShadowSettings: (sceneArg, shadowConfig) => {
      if (!shadowConfig?.enableShadow) return;
      shadowLight = new THREE.DirectionalLight("#FFF", 0);
      shadowLight.castShadow = true;
      if (shadowConfig?.lightPosition) {
        const lightPosition = { ...shadowConfig.lightPosition };
        shadowLight.position.set(
          lightPosition.x,
          lightPosition.y,
          lightPosition.z
        );
      } else shadowLight.position.set(0, 4, 0);
      shadowLight.name = THREEJS_NAMES.SHADOW_LIGHT;
      if (shadowConfig?.shadowProperties)
        assignDeepProperties(shadowLight.shadow, shadowConfig.shadowProperties);
      sceneArg.add(shadowLight);
      sceneArg.add(shadowLight.target);
    },
    setDirectionalLights: (sceneArg, directionalLights) => {
      //
      if (sceneArg != null) {
        // Deleting existing directional lights
        sceneArg.children.forEach((obj) => {
          if (obj.name === THREEJS_NAMES.DIRECTIONAL_LIGHT)
            sceneArg.remove(obj);
        });
        // Adding new ones
        if (directionalLights != null) {
          directionalLights.forEach((config) => {
            const light = new THREE.DirectionalLight(
              config.color,
              config.intensity
            );
            light.position.set(
              config.position[0],
              config.position[1],
              config.position[2]
            );
            light.name = THREEJS_NAMES.DIRECTIONAL_LIGHT;
            light.customId = config.customId;
            if (config.shadowConfig?.enableShadow) {
              light.castShadow = true;
              if (light.castShadow) {
                assignDeepProperties(
                  light.shadow,
                  config.shadowConfig.shadowProperties
                );
              }
            }
            sceneArg.add(light);
          });
        }
      }
    },
    addEnvironmentLight: (
      sceneArg,
      rendererArg,
      environmentLightConfig,
      getAssetCallback
    ) => {
      console.log(`🚀 ~ mod ~ environmentLightConfig:`, environmentLightConfig);
      if (!sceneArg?.children || !rendererArg) return;
      if (!environmentLightConfig) return;

      const lightTexture = getAssetCallback(environmentLightConfig?.assetId);

      if (environmentLightConfig.type === ASSET_TYPES.CUBE_MAP) {
        lightTexture.encoding = THREE.sRGBEncoding;
      } else if (lightTexture.mapping) {
        lightTexture.mapping = THREE.EquirectangularReflectionMapping;
      }
      sceneArg.environment = lightTexture;
    },
    addModelToScene: (modelId, gltfObject, scale = 1) => {
      if (scene != null) {
        scene.add(gltfObject.scene);
        const box = new THREE.Box3().setFromObject(gltfObject.scene);
        const boxSize = box.getSize(new THREE.Vector3()).multiplyScalar(scale);
        boxSizes[gltfObject.scene.uuid] = boxSize;
        gltfObject.scene.scale.set(scale, scale, scale);
        gltfObject.scene.position.set(0, -boxSize.y / 2, 0);
        gltfObject.scene.name = THREEJS_NAMES.MODEL;

        // Camera position calculation
        const maxSide = Math.max(boxSize.x, Math.max(boxSize.y, boxSize.z));
        const defaultNear = maxSide / 100;
        const defaultFar = maxSide * 100;
        const canvas = renderer.domElement;
        const aspect = Math.min(1, canvas.clientWidth / canvas.clientHeight);
        const vFOV = (camera.fov * Math.PI) / 180;
        const radiusSphere =
          Math.sqrt(boxSize.x ** 2 + boxSize.y ** 2 + boxSize.z ** 2) / 2;
        let zSphere = 1.2 * (radiusSphere / Math.sin(vFOV / 2) / aspect);
        if (window.innerHeight < 500) {
          zSphere += 2 * (1 - (window.innerHeight / 500) ** 2);
        }
        camera.position.set(-zSphere / 2, zSphere / 2, zSphere);
        camera.far = defaultFar;
        camera.near = defaultNear;
        camera.updateProjectionMatrix();
      }
    },
    removeModelFromScene: () => {
      const objectArray = [];
      scene.children.forEach((threeD) => {
        if (threeD.name === THREEJS_NAMES.MODEL) {
          objectArray.push(threeD);
        }
      });
      objectArray.forEach((obj) => scene.remove(obj));
    },
    setCameraController: (cameraControllerConfig) => {
      if (scene == null || renderer == null || camera == null) return;
      orbitControls = new OrbitControls(camera, renderer.domElement);
      Object.assign(orbitControls, cameraControllerConfig);
      orbitControls.maxDistance = camera.position.z;
      orbitControls.minDistance = 0;
      orbitControls.enableDamping = cameraControllerConfig.enableDamping;
      orbitControls.dampingFactor = cameraControllerConfig.dampingFactor;
    },
    getRendererDOM: () => {
      renderer.render(scene, camera);
      return renderer.domElement;
    },
    applyMaterial: (modelId, materialName, assetData) => {
      console.log(
        `🚀 ~ mod ~ modelId, materialName, assetDat:`,
        modelId,
        materialName,
        assetData
      );
      // instantiateIfNull(modelId);
      // const { animationQueue } = modelTriggers[modelId];
      const model = models[modelId];
      console.log("materialName", model?.materials);
      if (model?.materials[materialName]) {
        if (model.materials[materialName]["map"] instanceof THREE.Texture) {
          model.materials[materialName]["map"].dispose();
        }
        model.materials[materialName]["map"] = assetData;
      }
    },
    windowResizeListener: throttle(
      () => {
        resizeCanvasToDisplaySize();
      },
      RESIZE_UPDATE_INTERVAL,
      { trailing: true }
    ),
  };
};
const ThreejsScene = mod();

export default ThreejsScene;
