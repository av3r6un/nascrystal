export default {
  name: 'story',
  component: 'story/Story',
  fields: [
    {
      name: 'image',
      type: 'image',
    },
    {
      name: 'content',
      type: 'array',
      items: [
        {
          name: 'paragraph',
          type: 'text',
        },
      ],
    },
  ],
};
