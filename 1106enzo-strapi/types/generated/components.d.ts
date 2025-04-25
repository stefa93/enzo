import type { Schema, Struct } from '@strapi/strapi';

export interface LayoutHomepageCard extends Struct.ComponentSchema {
  collectionName: 'components_layout_homepage_cards';
  info: {
    description: 'A card component for the homepage, containing a title, image, and link.';
    displayName: 'Homepage Card';
    icon: 'address-card';
  };
  attributes: {
    cardImage: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    cardLink: Schema.Attribute.String & Schema.Attribute.Required;
    cardTitle: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'layout.homepage-card': LayoutHomepageCard;
    }
  }
}
