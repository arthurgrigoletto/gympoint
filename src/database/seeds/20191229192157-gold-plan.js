module.exports = {
  up: QueryInterface => {
    return QueryInterface.bulkInsert(
      'plans',
      [
        {
          title: 'Gold',
          duration: 3,
          price: 109,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: () => {},
};
