const { ZodError } = require("zod");

exports.validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    req.body = validated.body;
    req.params = validated.params;
    req.query = validated.query;

    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        errors: err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    next(err);
  }
};