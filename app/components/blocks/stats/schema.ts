export default {
  name: 'stats',
  component: 'stats/Stats',
  fields: [
    {
      name: 'content',
      type: 'array',
      items: [
        {
          type: 'bullet',
          fields: [
            { name: 'title', type: 'text' },
            { name: 'caption', type: 'text' },
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
