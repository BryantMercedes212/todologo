// Convenience re-export so screens/services can do:
//   import { db } from '../firebase/firestore';
// or keep importing from './config' directly. Both point to the same instance.
export { db } from './config';
