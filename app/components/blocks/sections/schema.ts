export default {
  name: 'sections',
  component: 'sections/Sections',
  fields: [
    {
      name: 'content',
      type: 'array',
      items: [
        {
          type: 'section',
          fields: [
            { name: 'title', type: 'text' },
            { name: 'items', type: 'array' },
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
