import { NotFoundError } from 'routing-controllers';
import { EntitySchema, EntityTarget } from 'typeorm';

export class NotFoundException extends NotFoundError {
  constructor(entityClass: EntityTarget<any>, criteria: any) {
    super();
    Object.setPrototypeOf(this, NotFoundException.prototype);

    let targetName: string;

    if (entityClass instanceof EntitySchema) {
      targetName = entityClass.options.name;
    } else if (typeof entityClass === 'function') {
      targetName = entityClass.name;
    } else if (typeof entityClass === 'object' && 'name' in entityClass) {
      targetName = entityClass.name;
    } else {
      targetName = entityClass;
    }

    this.message = `No ${targetName} found with ${JSON.stringify(criteria)}`;
  }
}
