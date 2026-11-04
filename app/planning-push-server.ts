import 'server-only';
import {db,databaseTransaction} from './database';
import {runPlanningPush} from '../lib/planning-push';
export async function drainPlanningPush(){return databaseTransaction(()=>runPlanningPush(db))}
