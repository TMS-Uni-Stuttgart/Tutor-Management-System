/* ========================= IMPORTANT =======================
 * setupProcess MUST be called before the import of bootstrap to catch errors during object instantiations.
 * =========================================================== */

import { setupProcess } from './setupProcess';
setupProcess();

import { bootstrap } from './setupApp';
bootstrap();
