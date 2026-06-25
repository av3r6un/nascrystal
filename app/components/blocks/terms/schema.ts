export default {
  name: 'terms',
  component: 'terms/Terms',
  fields: [
    {
      name: 'content',
      type: 'array',
      items: [
        {
          type: 'section',
          fields: [
            { name: 'title', type: 'text' },
            {
              name: 'items',
              type: 'array',
              items: [
                { name: 'caption', type: 'text' },
              ],
            },
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
