const path = require("path");
// eslint-disable-next-line import/no-extraneous-dependencies
const gentlyCopy = require("gently-copy");

const to = path.resolve(__dirname, "../public/");

// KTX2 basis (/examples/js/libs/basis)
let from = path.resolve(
  __dirname,
  "../node_modules/three/examples/js/libs/basis"
);

console.log(`copying files from ${from} to ${to}`);

gentlyCopy(from, to, { overwrite: true });

// draco (/examples/js/libs/draco)
from = path.resolve(__dirname, "../node_modules/three/examples/js/libs/draco");

gentlyCopy(from, to, { overwrite: true });
