import type { Schema, Struct } from '@strapi/strapi';

export interface EventDataTags extends Struct.ComponentSchema {
  collectionName: 'components_event_data_tags';
  info: {
    displayName: 'Tags';
    icon: 'apps';
  };
  attributes: {
    tagName: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'event-data.tags': EventDataTags;
    }
  }
}
