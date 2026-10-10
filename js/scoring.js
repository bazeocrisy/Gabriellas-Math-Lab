// Test scoring: raw score, percent, per-skill results and the app's mastery benchmark (9 of 10).
// The benchmark is this app's instructional goal, not an official Georgia Milestones score.
(function (G) {
  'use strict';
  const MASTERY = 0.9;

  /** questions: built question objects; answers: responses in the same order. */
  function score(questions, answers) {
    const items = questions.map((q, i) => {
      const resp = answers[i];
      const r = G.engine.check(q, resp);
      return { skill: q.skill, correct: r.status === 'correct', answered: r.status !== 'empty' };
    });
    const correct = items.filter((x) => x.correct).length;
    const total = questions.length;
    const skills = {};
    items.forEach((x) => {
      const s = skills[x.skill] || (skills[x.skill] = { correct: 0, total: 0 });
      s.total++;
      if (x.correct) s.correct++;
    });
    const missedSkills = Object.keys(skills).filter((k) => skills[k].correct < skills[k].total);
    return {
      correct, total,
      percent: total ? Math.round((correct * 100) / total) : 0,
      mastered: total > 0 && correct >= Math.ceil(total * MASTERY - 1e-9),
      skills, missedSkills, items
    };
  }

  G.scoring = { score, MASTERY };
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
