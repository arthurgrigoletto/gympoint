module.exports = {
  up: QueryInterface => {
    return QueryInterface.bulkInsert(
      'plans',
      [
        {
          title: 'Diamond',
          duration: 6,
          price: 89,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: () => {},
};
