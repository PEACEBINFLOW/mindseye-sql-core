import { LogicalPlan } from '../planner';

export interface FirestoreCompiledQuery {
  description: string;
  backend: 'FIRESTORE';
  target: string;
}

export class FirestoreBackend {
  compile(plan: LogicalPlan): FirestoreCompiledQuery {
    // Firestore isn't SQL, so we generate a high-level description.
    let collection = '';
    let target = '';

    for (const node of plan.nodes) {
      switch (node.type) {
        case 'scan':
          collection = (node as any).table;
          break;
        case 'route':
          target = (node as any).target;
          break;
      }
    }

    return {
      backend: 'FIRESTORE',
      target,
      description: `Firestore query on collection '${collection}' (see logical plan for filters, time windows, etc.)`
    };
  }
}
