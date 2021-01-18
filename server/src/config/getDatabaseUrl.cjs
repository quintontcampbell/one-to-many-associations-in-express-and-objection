const getDatabaseUrl = (nodeEnv) => {
  return (
    {
      development: "postgres://postgres:postgres@localhost:5432/one-to-many-associations-in-express-and-objection_development",
      test: "postgres://postgres:postgres@localhost:5432/one-to-many-associations-in-express-and-objection_test",
    }[nodeEnv] || process.env.DATABASE_URL
  );
};

module.exports = getDatabaseUrl;
