import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { getMetadataArgsStorage } from 'routing-controllers';

export function getOpenApiSpec() {
  const schemas = validationMetadatasToSchemas({
    refPointerPrefix: '#/components/schemas/',
  });

  const storage = getMetadataArgsStorage();
  return routingControllersToSpec(storage, undefined, {
    components: { schemas },
    info: { title: 'Ostoslista Backend', version: process.env.npm_package_version || '' },
  });
}
