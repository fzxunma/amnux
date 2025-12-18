import configProd from "./config_prod.js";
import configDev from "./config_dev.js";

class XmConfig {
  constructor() {
    if (this.Instance) {
      return this.Instance;
    }
    this.Instance = this;
    this.config = {};
    this.currentConfig = "dev";
    this.Init();
  }
  Init() {
    this.config["prod"] = configProd;
    this.config["dev"] = configDev;
  }
  setCurrentConfig(name) {
    this.currentConfig = name;
  }
  getConfig(name) {
    return this.config[this.currentConfig][name];
  }
  getSubConfig(name, subName) {
    return this.config[this.currentConfig][name][subName];
  }
  getThreeConfig(name, subName, threeNaem) {
    return this.config[this.currentConfig][name][subName][threeNaem];
  }
}

export default new XmConfig();
