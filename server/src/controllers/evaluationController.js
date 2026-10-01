import { Evaluation } from '../models/Evaluation.js';

// POST /api/evaluations
export async function createEvaluation(req, res, next) {
  try {
    const { seminarCode, score, comment, evaluatedBy } = req.body;

    const evaluation = await Evaluation.create({
      seminarCode,
      score,
      comment,
      evaluatedBy
    });

    res.status(201).json({ evaluation });
  } catch (err) {
    next(err);
  }
}

// GET /api/evaluations
export async function getAllEvaluations(req, res, next) {
  try {
    const evaluations = await Evaluation.find().sort({ createdAt: -1 }).lean();
    res.json({ evaluations });
  } catch (err) {
    next(err);
  }
}

// GET /api/evaluations/:id
export async function getEvaluation(req, res, next) {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    res.json({ evaluation });
  } catch (err) {
    next(err);
  }
}

// GET /api/evaluations/summary?seminarCode=...
export async function getEvaluationSummary(req, res, next) {
  try {
    const { seminarCode } = req.query;

    if (!seminarCode) {
      return res.status(400).json({ message: 'seminarCode is required' });
    }

    const results = await Evaluation.aggregate([
      { $match: { seminarCode: seminarCode } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' },
          evaluationCount: { $sum: 1 }
        }
      }
    ]);

    if (results.length === 0) {
      return res.json({
        seminarCode,
        averageScore: 0,
        evaluationCount: 0
      });
    }

    const result = results[0];
    res.json({
      seminarCode,
      averageScore: result.averageScore,
      evaluationCount: result.evaluationCount
    });
  } catch (err) {
    next(err);
  }
}
