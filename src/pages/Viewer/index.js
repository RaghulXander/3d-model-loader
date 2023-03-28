import React from "react";

import Select from "react-select";

import { useRootStore } from "../../state/RootStore";
import "./index.scss";

const Viewer = ({ textureOptions, glbOptions, onMenuSelect }) => {
  const [materials = [], selectedMaterial, selectedTexture, selectedGlb] =
    useRootStore((state) => [
      state.glbMaterials,
      state.selectedMaterial,
      state.selectedTexture,
      state.selectedGlb,
    ]);

  const getGlbOptions = () => {
    return glbOptions.map((option) => {
      return {
        label: option.name,
        value: option.name,
        data: option,
      };
    });
  };
  const getMaterialOptions = () => {
    return materials?.map((menu) => {
      if (typeof menu === "string") return { label: menu, value: menu };
      return menu;
    });
  };

  return (
    <div className="viewerContainer">
      <div className="outer-container">
        <div className="header">Model Viewer</div>
      </div>
      <div className="seperator"></div>
      <div className="dataSelector">
        <div className="title">Select a GLB</div>
        <Select
          placeholder="Select GLB"
          className={"select-container"}
          classNamePrefix="select-dropdown"
          value={getGlbOptions().find((glb) => glb.value === selectedGlb.name)}
          isDisabled={false}
          isLoading={false}
          isClearable={false}
          isSearchable={false}
          name="glb"
          options={getGlbOptions()}
          onChange={({ data }) => {
            console.log(`🚀 ~ data:`, data);
            onMenuSelect(data, "glb");
          }}
        />
      </div>
      <div className="seperator"></div>
      <div className="dataSelector">
        <div className="title">Select a Material</div>
        <Select
          placeholder="Select Materials"
          className={"select-container"}
          classNamePrefix="select-dropdown"
          value={getMaterialOptions().find(
            (material) => material.value === selectedMaterial
          )}
          isDisabled={false}
          isLoading={false}
          isClearable={false}
          isSearchable={false}
          name="material"
          options={getMaterialOptions()}
          onChange={(data) => {
            onMenuSelect(data, "material");
          }}
        />
      </div>
      <div className="seperator"></div>
      <div className="dataSelector">
        <div className="title">Choose Textures</div>
        <div className="texturePane">
          {textureOptions?.map((texture) => {
            return (
              <div
                className="texture-item"
                key={texture.url}
                title={texture.name}
              >
                <img
                  title={texture.name}
                  width="56"
                  height="56"
                  src={texture.url}
                  className={`${
                    selectedTexture?.url === texture?.url && "active"
                  }`}
                  alt="texture"
                  onClick={() => onMenuSelect(texture, "texture")}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Viewer;
