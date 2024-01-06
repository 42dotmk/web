import type { Schema, Attribute } from '@strapi/strapi';

export interface EventDataTags extends Schema.Component {
  collectionName: 'components_event_data_tags';
  info: {
    displayName: 'Tags';
    icon: 'apps';
  };
  attributes: {
    tagName: Attribute.String;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'event-data.tags': EventDataTags;
    }
  }
}
