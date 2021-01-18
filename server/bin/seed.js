#!/usr/bin/env node

import Seeder from "../src/db/Seeder.js";

(async () => {
  await Seeder.seed();
})();
