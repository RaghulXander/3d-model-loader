import React from "react";

import LoadingBar from "./Loader";
import Viewer from "./Viewer";

import { TEXTURES, DEFAULT_GLB } from "../modules/Constant";
import { useRootStore } from "../state/RootStore";

import Event from "../modules/Event";

import "./Root.scss";

const Root = () => {
  const [
    loading,
    setLoading,
    glbMaterials,
    setSelectedMaterial,
    setTexture,
    setSelectedGLB,
    selectedMaterial,
    selectedTexture,
    selectedGlb,
  ] = useRootStore((state) => [
    state.loading,
    state.setLoading,
    state.glbMaterials,
    state.setSelectedMaterial,
    state.setTexture,
    state.setSelectedGLB,
    state.selectedMaterial,
    state.selectedTexture,
    state.selectedGlb,
  ]);

  const onMenuSelect = (data, selector) => {
    switch (selector) {
      case "material":
        setSelectedMaterial(data.value);
        break;
      case "texture":
        setTexture(data);
        setLoading(true);
        Event.sendSMEvent("TEXTURE_CHANGED");
        break;
      case "glb":
        setLoading(true);
        setSelectedGLB(data);
        Event.sendSMEvent("GLB_CHANGED");
        break;
      default:
        break;
    }
  };

  return (
    <div className="experience-app">
      <div className="experience-container">
        <canvas id="SCENE" className="SCENE" />
        <div className="page-container">
          {loading ? (
            <LoadingBar />
          ) : (
            <Viewer
              textureOptions={Object.values(TEXTURES)}
              glbOptions={Object.values(DEFAULT_GLB)}
              materials={glbMaterials}
              selectedMaterial={selectedMaterial}
              selectedTexture={selectedTexture}
              selectedGlb={selectedGlb}
              onMenuSelect={onMenuSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Root;
