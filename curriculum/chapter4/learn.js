// Short original teaching screens, aligned to printed lesson starts 101–131.
(function (G) {
  "use strict";
  const C = G.chapter4,
    K = G.kit,
    M = G.models;
  const p = (t) => `<p>${t}</p>`;
  const steps = (xs) =>
    `<ol class="sol-steps">${xs.map((x) => `<li>${x}</li>`).join("")}</ol>`;
  const screens = [
    [
      [
        "Estimate before calculating",
        p(
          "An estimate is a nearby, easy answer. Use it to check whether an exact answer makes sense. Rounding and compatible numbers both help. An estimate does not need to match the exact answer.",
        ),
      ],
      [
        "Round each number first",
        p(
          "Estimate 6.38 + 2.74 to the nearest whole number. Look at tenths: 6.38 rounds to 6; 2.74 rounds to 3. Then 6 + 3 = 9. Do not add exactly and round only the final sum when the instruction says to round each operand.",
        ) +
          M.line({
            from: 6000,
            to: 7000,
            point: 6380,
            pointLabel: "6.38",
            mid: true,
            label:
              "Number line from 6 to 7, showing 6.38 below the halfway value 6.5.",
          }),
      ],
      [
        "Choose useful compatible numbers",
        p(
          "For 19.82 − 4.91, nearby compatible numbers 20 and 5 give 20 − 5 = 15. If more precision is useful, round each operand to tenths: 19.8 − 4.9 = 14.9. State which method you used. The exact difference is 14.91; both estimates help check its size. For a benchmark comparison such as 0.87 + 0.126, the gap from 0.87 to 1 is 0.130. Since 0.126 is smaller than that gap, the sum is less than 1 (exactly 0.996). Equivalent decimals let you compare tenths, hundredths and thousandths.",
        ),
      ],
      [
        "Use an estimate to catch a mistake",
        p(
          "A student reports 83.2 for 5.46 + 2.87. Whole-number rounding gives 5 + 3 = 8. The reported answer is far too large. Check decimal-point alignment. Estimates are especially useful for catching errors of a factor of ten.",
        ),
      ],
    ],
    [
      [
        "A grid is one whole",
        p(
          "Each 10 × 10 grid is 1. One column is 0.1; one small square is 0.01. Ten small squares fill one column, so 0.1 = 0.10.",
        ) + C.grid(34),
      ],
      [
        "Combine matching units",
        p(
          "Represent 0.26 + 0.31 with two grids. Combine 26 hundredths and 31 hundredths: 57 hundredths, or 0.57.",
        ) +
          C.operands(26, 31, "+") +
          C.grid(57),
      ],
      [
        "A sum can exceed one whole",
        p(
          "For 0.68 + 0.57, combine 68 + 57 = 125 hundredths. Exchange 100 hundredths for 1 whole. There are 25 hundredths left, so the sum is 1.25. Keep both grids: a single grid cannot hold more than 1.",
        ) + C.grid(125),
      ],
      [
        "Connect a model to a story",
        p(
          "A walk is 0.46 km, then 0.38 km. Add the distances: 46 + 38 = 84 hundredths, or 0.84 km. For three distances, combine the first two, then add the third. First decide what the numbers mean, then combine them. To explain your strategy, name what a grid and a square represent.",
        ),
      ],
    ],
    [
      [
        "Rename tenths as hundredths",
        p(
          "Tenths and hundredths are different units. Before combining 0.6 and 0.27, rename 0.6 as 0.60. Six columns contain 60 small squares.",
        ) + C.operands(60, 27, "+"),
      ],
      [
        "Combine and exchange",
        p(
          "0.6 + 0.27 = 60 hundredths + 27 hundredths = 87 hundredths = 0.87. For amounts above one, keep full grids for whole units and use another grid for the fractional part. Writing a trailing zero preserves value; it does not multiply by ten.",
        ) + C.grid(87),
      ],
      [
        "Cross one whole",
        p(
          "Rename 0.8 as 80 hundredths and 0.47 as 47 hundredths. Combining them gives 127 hundredths. Exchange 100 hundredths for one whole: 1.27. You can also combine 8 tenths + 4 tenths + 7 hundredths, then exchange 10 tenths for 1 whole.",
        ) + C.grid(127),
      ],
      [
        "Explain the units",
        p(
          "A jar holds 0.9 L and another holds 0.16 L. Altogether, 90 + 16 = 106 hundredths of a liter, or 1.06 L. For three amounts, add two, then add the third, preserving hundredths throughout. The zero in the tenths place matters: 1.6 would mean 160 hundredths, which is a different amount.",
        ),
      ],
    ],
    [
      [
        "Add by place value",
        p(
          "Line up decimal points, then add like units. For 4.7 + 2.65, write 4.70 so hundredths line up. A zero on the right of a decimal does not change its value.",
        ) + M.vertical(["4.7", "2.65"], "+", { pad: true }),
      ],
      [
        "Find partial sums",
        p(
          "Decompose 4.7 + 2.65: (4 + 2) + (0.7 + 0.6) + 0.05 = 6 + 1.3 + 0.05 = 7.35. You may also group whole numbers and decimals: 6 + (0.70 + 0.65). Both preserve the same quantities.",
        ),
      ],
      ["Exchange in the algorithm", K.columnSolution(["4.7", "2.65"], "+")],
      [
        "Choose and check a strategy",
        p(
          "For 3.98 + 1.24, compensation is convenient: add 0.02 to make 4, then subtract that extra 0.02: 4 + 1.24 − 0.02 = 5.22. For three amounts, combine two, then add the third. If a story asks how much more is needed, subtract the combined amount from the goal. Estimate or use another strategy to check.",
        ),
      ],
    ],
    [
      [
        "Subtract by removing",
        p(
          "Start with the first amount. For 0.76 − 0.23, shade 76 hundredths and cross out 23. Count the shaded squares that remain: 53, or 0.53.",
        ) + M.grid(76, { cross: 23 }),
      ],
      [
        "Find the distance between amounts",
        p(
          "For 0.8 − 0.3, the distance from 0.3 to 0.8 is 5 tenths, or 0.5. A number line can represent comparing amounts, even when nothing is physically removed.",
        ) + C.line(80, 30),
      ],
      [
        "Keep the value while exchanging",
        p(
          "For 0.62 − 0.38, view the first amount as 62 hundredths. Remove 38; 24 remain. A grid shows why exchanging a tenth for ten hundredths does not change the starting value.",
        ) + M.grid(62, { cross: 38 }),
      ],
      [
        "Connect a model to a story",
        p(
          "A 0.95 m ribbon loses 0.47 m. There are 95 − 47 = 48 hundredths, or 0.48 m, left. If more ribbon is cut off, subtract that amount from what remains. For a starting amount above 1, include a full grid for each whole before crossing out squares. Check by adding the cut pieces and the leftover ribbon to recover the original length.",
        ),
      ],
    ],
    [
      [
        "Use the same units",
        p(
          "For 0.8 − 0.36, rename 0.8 as 0.80, or 80 hundredths. You cannot subtract 36 hundredths from 8 hundredths: 0.8 is eight tenths.",
        ) + C.operands(80, 36, "−"),
      ],
      [
        "Exchange a tenth",
        p(
          "In 0.80 − 0.36, exchange one of the 8 tenths for 10 hundredths. Now there are 7 tenths and 10 hundredths. Subtract: 10 − 6 = 4 hundredths; 7 − 3 = 4 tenths. The difference is 0.44.",
        ) + M.grid(80, { cross: 36 }),
      ],
      [
        "Check by adding back",
        p(
          "Add the difference to the removed amount: 0.44 + 0.36 = 0.80. This proves the starting amount was preserved. On a number line, count up from 0.36 to 0.8: 0.04 to 0.4, then 0.4 to 0.8, for a total distance 0.44.",
        ) + C.line(80, 36),
      ],
      [
        "Explain equivalent decimals",
        p(
          "A bottle contains 0.7 L. After using 0.28 L, 0.42 L remains: 70 hundredths − 28 hundredths = 42 hundredths. If the starting amount is 1.20, exchange a whole for 10 tenths as needed, then a tenth for 10 hundredths. A trailing zero changes how the units are written, not how much liquid there is. In two-step problems, remove the first amount, then the next.",
        ),
      ],
    ],
    [
      [
        "Subtract by decomposing",
        p(
          "For 8.43 − 3.21, subtract parts of the second number: 8.43 − 3 = 5.43; 5.43 − 0.2 = 5.23; 5.23 − 0.01 = 5.22. Keep track of every part.",
        ),
      ],
      ["Regroup across zeros", K.columnSolution(["5", "2.68"], "−")],
      [
        "Count up or compensate",
        p(
          "For 5 − 2.68, count up: 0.02 to 2.70, 0.30 to 3, then 2 to 5. Total: 2.32. Or add 0.32 to BOTH operands: 5.32 − 3 = 2.32. Moving both endpoints the same distance preserves their difference.",
        ),
      ],
      [
        "Choose, explain and check",
        p(
          "Use decomposition when parts are easy; count up when endpoints are close to friendly numbers; use columns for many places. For two amounts used from a supply, subtract in sequence. Check by adding the amounts removed and the remainder. An estimate of 5 − 2.68 is 5 − 3 = 2, near 2.32.",
        ),
      ],
    ],
    [
      [
        "Choose the operation",
        p(
          "Combine distances or costs with addition. Find what remains, how much farther, or a comparison with subtraction. Name the quantities and units before calculating. For a goal of 8.5 km with 3.75 km traveled, write 3.75 + ? = 8.5, or 8.5 − 3.75 = ?.",
        ),
      ],
      [
        "Explain why a strategy works",
        p(
          "To solve 8.5 − 3.75, count up: 0.25 reaches 4; another 4.5 reaches 8.5. Total 4.75 km. This works because the distance between the endpoints is the difference. Check: 3.75 + 4.75 = 8.5.",
        ),
      ],
      [
        "Compare valid strategies",
        p(
          "For 2.85 + 1.6, partial sums give 3 + 1.4 + 0.05 = 4.45. Compensation gives 3 + 1.6 − 0.15 = 4.45. Columns also work. Choose a method that is efficient for these numbers, and explain how it preserves value. Line up decimal points, not final digits.",
        ) + K.columnSolution(["2.85", "1.6"], "+"),
      ],
      [
        "Solve a two-step story",
        p(
          "A runner travels 1.65 km, then 2.8 km, toward a goal of 6 km. First combine distances: 1.65 + 2.80 = 4.45. Then find what remains: 6 − 4.45 = 1.55 km. Explain each equation, keep the same units, and check: 4.45 + 1.55 = 6.",
        ),
      ],
    ],
  ];
  C.screens = screens.map((ss, i) =>
    ss
      .map(([title, html]) => ({ title, html }))
      .concat([
        {
          title: "Try it together",
          check: true,
          html: p(
            "Use the strategy from this lesson. Try the question, use progressive hints if needed, and explain your thinking aloud.",
          ),
        },
      ]),
  );
})((window.GML = window.GML || {}));
