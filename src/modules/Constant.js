export const MODEL_ID = "viewerModel";
export const PAGES = {
  MODEL_VIEWER: "MODEL_VIEWER",
};

export const APP_MODE = {
  VIEWER: "viewer",
  EDITOR: "editor",
};

export const TEXTURES = {
  BROWN: {
    id: "234343",
    type: "TEXTURE",
    name: "Brown",
    url: "./assets/textures/Brown_BaseColor.jpg",
  },
  MAROON: {
    id: "234344",
    type: "TEXTURE",
    name: "Maroon",
    url: "./assets/textures/Maroon_BaseColor.jpg",
  },
  METAL: {
    id: "234345",
    type: "TEXTURE",
    name: "Metal",
    url: "./assets/textures/Metal_BaseColor.jpg",
  },
  RED: {
    id: "2343411",
    type: "TEXTURE",
    name: "RED",
    url: "./assets/textures/Fabric_red.jpg",
  },
  SAND: {
    id: "2343419",
    type: "TEXTURE",
    name: "SAND",
    url: "./assets/textures/Fabric.jpg",
  },
};

export const DEFAULT_GLB = {
  145143: {
    id: "145143",
    type: "GLTF",
    name: "RobotExpressive",
    url: "./assets/RobotExpressive.glb",
  },
  145144: {
    id: "145144",
    type: "GLTF",
    name: "Astronaut",
    url: "./assets/Astronaut.glb",
  },
  145145: {
    id: "145145",
    type: "GLTF",
    name: "coffeemat",
    url: "./assets/coffeemat.glb",
  },
  145146: {
    id: "145146",
    type: "GLTF",
    name: "NeilArmstrong",
    url: "./assets/NeilArmstrong.glb",
  },
  145147: {
    id: "145147",
    type: "GLTF",
    name: "ToyCar",
    url: "./assets/ToyCar.glb",
  },
};

export const ASSET_EVENTS = {
  ASSET_LOADED: "ASSET_LOADED",
};

export const ANIMATION_EVENTS = {
  ANIMATION_COMPLETE: "ANIMATION_COMPLETE",
  CENTER_SCALE_COMPLETE: "CENTER_SCALE_COMPLETE",
  ANIMATION_QUEUE_COMPLETE: "ANIMATION_QUEUE_COMPLETE",
};

export const THREEJS_NAMES = {
  AMBIENT_LIGHT: "AMBIENT_LIGHT",
  DIRECTIONAL_LIGHT: "DIRECTIONAL_LIGHT",
  SCENE_NAME: "SCENE",
  STATS: "STATS",
  AXES_HELPER: "AXES_HELPER",
  BOX_HELPER: "BOX_HELPER",
  MODEL: "MODEL",
  GRID_HELPER: "GRID_HELPER",
  SHADOW_LIGHT: "SHADOW_LIGHT",
};

export const ASSET_TYPES = {
  GLTF: "GLTF",
  COMPRESSED_GLTF: "COMPRESSED_GLTF",
  TEXTURE: "TEXTURE",
  KTX_TEXTURE: "KTX_TEXTURE",
  IMAGE: "IMAGE",
  SPRITE: "SPRITE",
  HDRI: "HDRI",
  CUBE_MAP: "CUBE_MAP",
  FBX: "FBX",
  GLB: "GLB",
  COMPRESSED_GLB: "COMPRESSED_GLB",
};

export const GLOBAL_STATE_ATTR = {
  PREPROD: "preprod",
  APP_MODE: "appMode",
  BACKGROUND_COLOR: "backgroundColor",
  MODELID: "modelId",
};