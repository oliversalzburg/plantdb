import { DatabaseFormat } from "@plantdb/libplantdb";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";
import "@shoelace-style/shoelace/dist/components/input/input.js";
import "@shoelace-style/shoelace/dist/components/menu-item/menu-item";
import "@shoelace-style/shoelace/dist/components/select/select.js";
import "@shoelace-style/shoelace/dist/components/textarea/textarea";
import "./PlantApp";
import { PlantApp } from "./PlantApp";
import "./PlantCard";
import "./PlantDbConfig";
import "./PlantList";

document.addEventListener("DOMContentLoaded", () => {
  init().catch(console.error);
});

const init = async () => {
  const { default: plantsData } = await import("../../../plants.csv?raw");
  const { default: plantsLogData } = await import("../../../plantlog.csv?raw");
  const { default: plantsDbData } = await import("../../../plantdb.json?raw");

  const plantDbConfig = JSON.parse(plantsDbData) as DatabaseFormat;

  const plantApp = document.querySelector("plant-app") as PlantApp;
  plantApp.plantData = plantsData;
  plantApp.plantLogData = plantsLogData;
  plantApp.hasHeaderRow = plantDbConfig.hasHeaderRow;
  plantApp.columnSeparator = plantDbConfig.columnSeparator;
  plantApp.dateFormat = plantDbConfig.dateFormat;
  plantApp.timezone = plantDbConfig.timezone;
};
