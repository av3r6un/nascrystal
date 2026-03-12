export default {
  name: 'feature',
  component: 'feature/Feature',
  fields: [
    {
      name: 'content',
      type: 'array',
      items: [
        {
          type: 'feature',
          fields: [
            { name: 'text', type: 'text' },
            { name: 'caption', type: 'text' },
            { name: 'icon', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'options',
      type: 'object',
    },
  ],
};
