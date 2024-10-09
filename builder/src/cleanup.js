import { JSX_DIR, SVG_DIR } from "./generator/assets.js";
import { deleteDir } from "./utils.js";

Promise.all([await deleteDir(SVG_DIR), await deleteDir(JSX_DIR)])
  .then(() => console.log("Successfully cleaned up!!\n"))
  .catch((error) => {
    console.log("Unable to cleanup!!\n");
    console.error(error);
  });
