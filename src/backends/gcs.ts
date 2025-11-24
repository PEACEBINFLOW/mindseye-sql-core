import { LogicalPlan } from '../planner';

export interface GCSCompiledQuery {
  description: string;
  backend: 'GCS';
  bucket: string;
}

export class GCSBackend {
  compile(plan: LogicalPlan): GCSCompiledQuery {
    let bucket = 'default-bucket';

    for (const node of plan.nodes) {
      if (node.type === 'route') {
        bucket = (node as any).target;
      }
    }

    return {
      backend: 'GCS',
      bucket,
      description: `GCS export job from MindsEye SQL plan to bucket '${bucket}'`
    };
  }
}
