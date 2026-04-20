// utils/validate.js
// Small middleware factory: pass it a Zod schema, get back express middleware
// that validates req.body and replaces it with the parsed (typed/cleaned) version.
// Returns the standard envelope on validation failure.

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      return res.status(400).json({ success: false, error: message });
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validateBody };
