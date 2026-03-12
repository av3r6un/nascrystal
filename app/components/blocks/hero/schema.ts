export default {
  name: 'blockHero',
  component: 'hero/Hero',
  fields: [
    {
      name: 'content.image',
      type: 'image',
    },
    {
      name: 'content.title',
      type: 'text',
    },
    {
      name: 'content.subtitle',
      type: 'text',
    },
    {
      name: 'content.button_text',
      type: 'text',
    },
    {
      name: 'content.button_to',
      type: 'text',
    },
    {
      name: 'options',
      type: 'object',
    },
  ],
};
